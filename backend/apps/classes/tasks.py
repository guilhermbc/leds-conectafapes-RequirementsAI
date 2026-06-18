import os

from celery import shared_task
from django.utils import timezone

from .models import DocumentoGenerationJob
from .services.document_generation_service import (
    DocumentoGenerationService
)

@shared_task
# payload: {
#     "documento_data": Dados do documento passados na requisição,
#     "audio_path": "Caminho do arquivo de áudio do upload" (opcional, somente se houver upload),
#     "arquivoAudio_name": "Nome do áudio a ser reusado" (opcional, para novos minimundos sem upload de áudio)
# }
def generate_documento(job_id, user_id, payload):
    audio_path = payload.get("audio_path")

    job = DocumentoGenerationJob.objects.get(id=job_id)

    try:
        job.status = "RUNNING"
        job.progress = 10

        job.save(
            update_fields=[
                "status",
                "progress"
            ]
        )
        
        documento = (
            DocumentoGenerationService.generate_documento(
                payload=payload,
                user_id=user_id,
                job=job
            )
        )

        job.documento = documento

        job.status = "SUCCESS"
        job.progress = 100

        # guardar referência ao resultado
        job.result_documento_id = documento.id

        job.finished_at = timezone.now()

        job.save(
            update_fields=[
                "documento",
                "status",
                "progress",
                "finished_at"
            ]
        )

    except Exception as exc:
        job.status = "FAILED"
        job.error = str(exc)
        job.finished_at = timezone.now()

        job.save(
            update_fields=[
                "status",
                "error",
                "finished_at"
            ]
        )
        raise

    finally:
        audio_path = payload.get("audio_path")

        if (audio_path and os.path.exists(audio_path)):
            os.remove(audio_path)