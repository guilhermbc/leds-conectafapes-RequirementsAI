import os

from .models import (
    Projeto,
    Modulo,
    Documento,
    DocumentoGenerationJob,
    DOCS
)
from .serializers import (
    ProjetoReadSerializer, ProjetoWriteSerializer,
    ModuloReadSerializer, ModuloWriteSerializer,
    DocumentoReadSerializer, DocumentoWriteSerializer,
    DocumentoGenerationJobSerializer,
    UserRegisterSerializer,
)

from .tasks import generate_documento as generate_documento_task

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Case, When, IntegerField
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet, ModelViewSet, ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_condition import And, Or
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication
from rest_framework.authentication import SessionAuthentication
from .pagination import CustomPagination
from rest_framework import generics
from rest_framework import filters
import django_filters.rest_framework
import tempfile
import logging
import requests
import uuid

logger = logging.getLogger(__name__)

from rest_framework.permissions import AllowAny # for testing
from .filters import DocumentoFilter
from .utils import is_empty_or_null, send_to_llm, version_from_another_doc, version_from_audio, update_version

class HealthViewSet(ViewSet):

    permission_classes = [AllowAny]

    @action(detail='', url_path='')
    def check(self, request):
        response_data = {'content': 'OK'}
        return JsonResponse(response_data, status=201)


class ProjetoViewSet(ModelViewSet):
    queryset = Projeto.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = [Or(IsAdminUser, IsAuthenticated, TokenHasReadWriteScope)]

    # permission_classes = [AllowAny]

    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        django_filters.rest_framework.DjangoFilterBackend
    )
    filterset_fields = '__all__'
    search_fields = ['nome', 'descricao']
    ordering_fields = '__all__'
    ordering = ["id"]
    
    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return ProjetoReadSerializer
        return ProjetoWriteSerializer
    
    def get_object(self):
        '''
        return the Projeto and the associated Modulo's objects
        '''

        queryset = self.filter_queryset(self.get_queryset())

        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('projeto_modulo')
        
        obj = get_object_or_404(queryset, **self.kwargs)
        
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Projeto.objects.filter(user=self.request.user)

class ModuloViewSet(ModelViewSet):
    queryset = Modulo.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    # permission_classes = [AllowAny]

    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        django_filters.rest_framework.DjangoFilterBackend
    )
    filterset_fields = '__all__'
    search_fields = ['nome', 'descricao']
    ordering_fields = '__all__'
    ordering = ["id"]
    
    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return ModuloReadSerializer
        return ModuloWriteSerializer
    
    def get_object(self) -> any:
        queryset = self.filter_queryset(self.get_queryset())

        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('modulo_documento')
        
        obj = get_object_or_404(queryset, **self.kwargs)
        
        self.check_object_permissions(self.request, obj)
        return obj
    
    @action(detail=False, methods=['get'], url_path=r'get_last_docs/(?P<modulo_id>\d+)', filter_backends=[])
    def get_last_docs(self, request, modulo_id=None):

        mod = get_object_or_404(Modulo, id=int(modulo_id))

        docs = mod.modulo_documento.filter(
            vMaisRecente=True
        ).order_by(
            Case(
                When(TipoDocumento='MINIMUNDO', then=0),
                When(TipoDocumento='REQUISITOS', then=1),
                When(TipoDocumento='CASO_USO', then=2),
                When(TipoDocumento='DIAGRAMA_CLASSE', then=3),
                output_field=IntegerField()
            )
        )

        return Response(
            DocumentoReadSerializer(docs, many=True).data
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Modulo.objects.filter(user=self.request.user)

class DocumentoViewSet(ModelViewSet):
    queryset = Documento.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]
    parser_classes = (MultiPartParser, FormParser)

    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        django_filters.rest_framework.DjangoFilterBackend
    )
    filterset_fields = [
        'id',
        'vMajor',
        'vMinor',
        'geradoIA',
        'vMaisRecente',
        'obsoleto',
        'TipoDocumento',
        'DocumentoAnterior',
        'DocumentoOrigem',
        'parUC_CD',
        'Modulo',
    ]
    search_fields = ['versao', 'arquivo']
    ordering_fields = '__all__'
    ordering = ["id"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Documento.objects.none()
        return Documento.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return DocumentoReadSerializer
        return DocumentoWriteSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.dict()
        arquivoAudio = request.FILES.get('arquivoAudio')
        documento_anterior = data.get('DocumentoAnterior')

        arquivo_para_reusar = None

        if not arquivoAudio:
            data.pop('arquivoAudio', None)

        # Criar path temporário se houver upload
        if arquivoAudio:
            with tempfile.NamedTemporaryFile(delete=False) as temp:
                for chunk in arquivoAudio.chunks():
                    temp.write(chunk)

                data['audio_path'] = temp.name
        else:
            if documento_anterior:
                doc_anterior = get_object_or_404(Documento, pk=documento_anterior)

                if data.get('TipoDocumento') == 'MINIMUNDO' and doc_anterior.arquivoAudio:
                    arquivo_para_reusar = doc_anterior.arquivoAudio
                    arquivo_para_reusar_path = doc_anterior.arquivoAudio.path
                
                    with open(doc_anterior.arquivoAudio.path, 'rb') as original:
                        with tempfile.NamedTemporaryFile(delete=False) as temp:
                            temp.write(original.read())
                            temp_path = temp.name

                    data['audio_path'] = temp_path

        payload = {
            "documento_data": data,
            "arquivo_para_reusar_path": arquivo_para_reusar_path,
        }

        job = DocumentoGenerationJob.objects.create(
            id=uuid.uuid4(),
            user=request.user,
            status="PENDING"
        )

        generate_documento_task.delay(
            job_id=str(job.id),
            user_id=request.user.id,
            payload=payload
        )

        return Response(
            {
                "job_id": str(job.id),
                "status": "PENDING"
            },
            status=202
        )

class DocumentoGenerationJobViewSet(ReadOnlyModelViewSet):
    def get_queryset(self):
        return (DocumentoGenerationJob.objects.filter(user=self.request.user))
    
    serializer_class = (DocumentoGenerationJobSerializer)
    authentication_classes = [
        OAuth2Authentication,
        SessionAuthentication
    ]
    permission_classes = [
        Or(IsAdminUser, TokenHasReadWriteScope)
    ]
    lookup_field = 'id'
    
class UserViewSet(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permissions_classes = [AllowAny]