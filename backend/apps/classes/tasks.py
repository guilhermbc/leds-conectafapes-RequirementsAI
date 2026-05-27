from celery import shared_task

from .models import DocumentoGenerationJob
from .services.document_generation_service import (
    DocumentoGenerationService
)

@shared_task
def process_document_generation(
    job_id,
    payload,
    user_id
):

    job = (
        DocumentoGenerationJob.objects
        .get(id=job_id)
    )

    try:

        job.status = "RUNNING"
        job.progress = 10

        job.save(
            update_fields=[
                "status",
                "progress"
            ]
        )

        result = (
            DocumentoGenerationService
            .generate(
                data=payload,
                user_id=user_id,
                job=job
            )
        )

        job.status = "SUCCESS"
        job.progress = 100

        job.save(
            update_fields=[
                "status",
                "progress"
            ]
        )

    except Exception as exc:

        job.status = "FAILED"
        job.error = str(exc)

        job.save(
            update_fields=[
                "status",
                "error"
            ]
        )

        raise