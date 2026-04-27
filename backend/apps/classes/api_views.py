import os

from .models import (
    Projeto,
    Modulo,
    Documento,
    DOCS,
    ApiKey
)
from .serializers import (
    ProjetoReadSerializer, ProjetoWriteSerializer,
    ModuloReadSerializer, ModuloWriteSerializer,
    DocumentoReadSerializer, DocumentoWriteSerializer,
    UserRegisterSerializer,
    ApiKeySerializer
)

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet, ModelViewSet, GenericViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_condition import And, Or
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication
from rest_framework.authentication import SessionAuthentication
from .pagination import CustomPagination
from rest_framework import generics, mixins
from rest_framework import filters
import django_filters.rest_framework
import json
import os
import logging

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
    
    @action(detail=False, methods=['get'], url_path=r'get_last_docs/(?P<modulo_id>\d+)', filter_backends = [])
    def get_last_docs(self, request, modulo_id=None):
        
        mod = get_object_or_404(Modulo, id=int(modulo_id))

        docs: list[Documento] = list(mod.modulo_documento.all())

        separated_docs = {tipo: [] for tipo, _ in DOCS.choices}

        for d in docs:
            tipo = d.TipoDocumento
            if tipo in separated_docs:
                separated_docs[tipo].append(d)

        latest_docs: list[Documento] = []

        def get_latest(docs: list[Documento], hi_major: int = 0) -> Documento:
            for d in docs:
                if d.vMajor > hi_major:
                    hi_major = d.vMajor
            
            hi_minor_index = 0
            hi_minor = -1
            i = 0
            while i < len(docs):
                if (docs[i].vMajor == hi_major) and (docs[i].vMinor > hi_minor):
                    hi_minor = docs[i].vMinor
                    hi_minor_index = i                
                i += 1

            return docs[hi_minor_index]

        for key, elem in list(separated_docs.items()):
            try:
                latest_docs.append(get_latest(elem))
            except:
                pass

        major = max((d.vMajor for d in latest_docs), default=None)

        result = [d for d in latest_docs if d.vMajor == major]

        return Response(DocumentoReadSerializer(result, many=True).data)
    
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
        'TipoDocumento',
        'DocumentoAnterior',
        'DocumentoOrigem',
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

    def _create_caso_uso_com_classes(self, data):
        documento_anterior = data.get("DocumentoAnterior")
        
        result = send_to_llm({
            **data,
            'TipoDocumento': 'CASO_USO_E_DIAGRAMA_CLASSE'
        })

        if not result:
            return Response({'error': 'Erro ao gerar documentos'}, status=500)

        caso_uso_result = result.get('caso_uso')
        diagrama_classe_result = result.get('diagrama_classe')

        # montar UC
        result_string_uc = ''
        for element in caso_uso_result:
            result_string_uc += element + '\n<!-- -->\n'

        vMajor, vMinor = 1, 0

        # CASO USO
        data_uc = data.copy()
        data_uc.update({
            'arquivo': result_string_uc,
            'TipoDocumento': 'CASO_USO',
            'vMajor': vMajor,
            'vMinor': vMinor,
            'geradoIA': True,
            'vMaisRecente': True
        })

        serializer_uc = self.get_serializer(data=data_uc)
        serializer_uc.is_valid(raise_exception=True)
        self.perform_create(serializer_uc)

        # CLASSES
        data_cd = data.copy()
        data_cd.update({
            'arquivo': diagrama_classe_result,
            'TipoDocumento': 'DIAGRAMA_CLASSE',
            'vMajor': vMajor,
            'vMinor': vMinor,
            'geradoIA': True,
            'vMaisRecente': True
        })

        serializer_cd = self.get_serializer(data=data_cd)
        serializer_cd.is_valid(raise_exception=True)
        self.perform_create(serializer_cd)

        # Atualizar estado de novidade do documento anterior
        if documento_anterior:
            doc_anterior = get_object_or_404(Documento, id=documento_anterior)
            if doc_anterior.vMaisRecente is not False:
                doc_anterior.vMaisRecente = False
                doc_anterior.save()

        return Response({
            "caso_uso": serializer_uc.data,
            "diagrama_classe": serializer_cd.data
        }, status=201)

    def create(self, request, *args, **kwargs):
        data = request.data.dict()
        arquivoAudio = request.FILES.get('arquivoAudio')
        documentos_origem = request.data.getlist('DocumentoOrigem')
        documento_anterior = data.get('DocumentoAnterior')

        api_key_id = data.get('api_key')
        data['api_key'] = get_object_or_404(ApiKey, pk=api_key_id).Key_String

        logger.info("FILES:", extra={"files": request.FILES})
        logger.info("audio:", extra={
            "existeAudio": bool(request.FILES.get('arquivoAudio')),
            "sizeAudio": getattr(request.FILES.get('arquivoAudio'), 'size', None)
})

        if not arquivoAudio:
            data.pop('arquivoAudio', None)

        # Força sempre lista no data, e nunca string
        data['DocumentoOrigem'] = documentos_origem

        # Criar path temporário se houver upload
        if arquivoAudio:
            import tempfile

            with tempfile.NamedTemporaryFile(delete=False) as temp:
                for chunk in arquivoAudio.chunks():
                    temp.write(chunk)

                temp_path = temp.name

            data['audio_path'] = temp_path  # substitui origemAudio
            
            logger.info("Temp path criado", extra={"path": temp_path})
            logger.info("Arquivo existe?", extra={"exists": os.path.exists(temp_path)})
        else:
            if documento_anterior:
                doc_anterior = get_object_or_404(Documento, pk=documento_anterior)

                if data.get('TipoDocumento') == 'MINIMUNDO' and doc_anterior.arquivoAudio:
                    data['arquivoAudio'] = doc_anterior.arquivoAudio
                else:
                    data.pop('arquivoAudio', None)

        # Se for CASO_USO/DIAGRAMA_CLASSE, enviar para um método separado
        if data.get('TipoDocumento') == 'CASO_USO_E_DIAGRAMA_CLASSE' and is_empty_or_null(data.get('arquivo')):
            return self._create_caso_uso_com_classes(data)

        # Casos simples
        # Se deve ser gerado por IA
        if is_empty_or_null(data.get('arquivo')):
            result = send_to_llm(data)
            generated_by_ai = True

            if data['DocumentoOrigem'] and len(data['DocumentoOrigem']) != 0:
                doc_origem_id = data['DocumentoOrigem'][-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id)
                
                vMajor, vMinor = version_from_another_doc(
                    doc_origem,
                    documento_anterior
                )

            elif data.get('audio_path') and documento_anterior:  # 👈 ALTERADO
                doc_anterior_id = documento_anterior
                doc_anterior = get_object_or_404(Documento, id=doc_anterior_id)
                vMajor, vMinor = version_from_audio(doc_anterior)

            else:
                vMajor = 1
                vMinor = 0

        # Se não deve ser gerado por IA
        else:
            generated_by_ai = False
            result = data.get('arquivo')

            # Incremento Minor
            if documento_anterior:
                doc_anterior_id = documento_anterior
                doc_anterior = get_object_or_404(Documento, id=doc_anterior_id)
                vMajor, vMinor = update_version(doc_anterior)

            elif data.get('DocumentoOrigem') and len(data.get('DocumentoOrigem')) != 0:
                doc_origem_id = data.get('DocumentoOrigem')[-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id)
                vMajor, vMinor = version_from_another_doc(doc_origem)

            else:
                vMajor = 1
                vMinor = 0

        # Mesma lógica de montagem
        result_string = ''
        if not isinstance(result, str):
            for element in result:
                result_string += element + '\n<!-- -->\n'
        else:
            result_string = result

        data['vMajor'] = vMajor
        data['vMinor'] = vMinor
        data['arquivo'] = result_string
        data['geradoIA'] = generated_by_ai
        data['vMaisRecente'] = True

        # 👇 IMPORTANTE: passar data, não request.data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Atualizar estado de novidade do documento anterior
        if documento_anterior:
            doc_anterior = get_object_or_404(Documento, id=documento_anterior)
            if doc_anterior.vMaisRecente is not False:
                doc_anterior.vMaisRecente = False
                doc_anterior.save()

        return Response(serializer.data, status=201)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class UserViewSet(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permissions_classes = [AllowAny]

class ApiKeyViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    queryset = ApiKey.objects.all()
    serializer_class = ApiKeySerializer
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Documento.objects.none()
        
        return Documento.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)