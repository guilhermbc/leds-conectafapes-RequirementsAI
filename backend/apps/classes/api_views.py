from .models import (
    Projeto,
    Modulo,
    Documento,
)
from .serializers import (
    ProjetoReadSerializer, ProjetoWriteSerializer,
    ModuloReadSerializer, ModuloWriteSerializer,
    DocumentoReadSerializer, DocumentoWriteSerializer,
)

from django.shortcuts import get_object_or_404
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser
from rest_condition import And, Or
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication
from rest_framework.authentication import SessionAuthentication
from .pagination import CustomPagination
from rest_framework import generics
from rest_framework import filters
import django_filters.rest_framework

from rest_framework.permissions import AllowAny # for testing
from .filters import DocumentoFilter
from .utils import is_empty_or_null

from webhook_server.webhook_server_functions.miniworld_functions import (
    # expected data: video_entrevista: str
    run_graphMW_with_trace as run_mw
)
from webhook_server.webhook_server_functions.requirements_functions import (
    # expected data: minimundo: str
    run_graphRq_with_trace as run_rq
)
from webhook_server.webhook_server_functions.usecase_functions import (
    # expected data: minimundo: str, report: str
    run_graphUC_with_trace as run_uc
)
from webhook_server.webhook_server_functions.classdiagram_functions import (
    # expected data: minimundo: str, report: str, format_uc: str, report_validateuc: str
    run_graphDC_with_trace as run_dc
)
from webhook_server.webhook_server_functions.interface_functions import (
    # expected data: report: str, cdinuc_description_revised: str, ucincd_revised: str
    run_graphIP_with_trace as run_ip
)

class ProjetoViewSet(ModelViewSet):
    queryset = Projeto.objects.all()
    pagination_class = CustomPagination
    # authentication_classes = [OAuth2Authentication, SessionAuthentication]
    # permission_classes = permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    permission_classes = [AllowAny]

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

class ModuloViewSet(ModelViewSet):
    queryset = Modulo.objects.all()
    pagination_class = CustomPagination
    # authentication_classes = [OAuth2Authentication, SessionAuthentication]
    # permission_classes = permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    permission_classes = [AllowAny]

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
    
    def get_object(self):
        '''
        return the Modulo and the associated Documento's objects
        '''

        queryset = self.filter_queryset(self.get_queryset())

        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('modulo_documento')
        
        obj = get_object_or_404(queryset, **self.kwargs)
        
        self.check_object_permissions(self.request, obj)
        return obj

class DocumentoViewSet(ModelViewSet):
    queryset = Documento.objects.all()
    pagination_class = CustomPagination
    # authentication_classes = [OAuth2Authentication, SessionAuthentication]
    # permission_classes = permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    permission_classes = [AllowAny]
    
    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        django_filters.rest_framework.DjangoFilterBackend
    )
    # filterset_fields = '__all__'
    filterser_class = DocumentoFilter
    search_fields = ['versao', 'arquivo', 'Documento']
    ordering_fields = '__all__'
    ordering = ["id"]
    
    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return DocumentoReadSerializer
        return DocumentoWriteSerializer
    
    def create(self, request, *args, **kwargs):
        '''
        Specific behavior of the create Documento
        '''

        if is_empty_or_null(request.data['arquivo']):
            result = send_to_llm(request.data)

        result_string = ''
        if not isinstance(result, str):
            for element in result:
                result_string += element + '\n<!-- -->\n'
        else:
            result_string = result

        request.data['arquivo'] = result_string

        return super().create(request, *args, **kwargs)


def send_to_llm(data: dict) -> str | tuple:
    result = None

    match (data['TipoDocumento']):
        case 'MINIMUNDO':
            try:
                if data['origemAudio']:
                    path = '../shared/uploads/' + data['origemAudio']

                    mw_data = run_mw({ 'video_entrevista': path })
                    if mw_data and isinstance(mw_data, dict):
                        state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                        result = state.get('minimundo')
            except:
                result = None
            
        case 'REQUISITOS':
            try:
                if data['DocumentoOrigem'] != []:
                    originMw = ''
                    for docId in data['DocumentoOrigem']:
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                    
                    oldRq = ''
                    if data['DocumentoAnterior']:
                        doc = Documento.objects.get(pk=data['DocumentoAnterior'])
                        if doc.TipoDocumento == 'REQUISITOS':
                            oldRq = doc.arquivo

                    rq_data = run_rq({ 'minimundo': originMw, 'old_requirements':oldRq })
                    if rq_data and isinstance(rq_data, dict):
                        state = next(iter(rq_data.values())) if len(rq_data) == 1 else rq_data
                        result = state.get('report')
            except:
                result = None

        case 'CASO_USO':
            try:
                if data['DocumentoOrigem'] != []:
                    
                    originMw = ''
                    originRq = ''
                    for docId in data['DocumentoOrigem']:
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                        elif doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo

                    uc_data = run_uc({ 'minimundo':originMw, 'report':originRq})
                    if uc_data and isinstance(uc_data, dict):
                        state = next(iter(uc_data.values())) if len(uc_data) == 1 else uc_data
                        diagrama = state.get("usecases_diagram")
                        tabela = state.get("format_uc")
                        descricao = state.get("report_validateuc")

                        result = (diagrama, tabela, descricao)
            except:
                result = None
            
        case 'DIAGRAMA_CLASSE':

            '''
            expected data
            { minimundo: str, report: str, format_uc: str, report_validateuc: str }
            '''
            try:
                if data['DocumentoOrigem'] != []:
                    originMw = ''
                    originRq = ''
                    originUcTable = ''
                    originUcDescr = ''

                    for docId in data['DocumentoOrigem']:
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                        elif doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo
                        elif doc.TipoDocumento == 'CASO_USO':
                            _, originUcTable, originUcDescr = doc.arquivo.split('\n<!-- -->\n')

                    cd_data = run_dc({
                        'minimundo': originMw,
                        'report': originRq,
                        'format_uc': originUcTable,
                        'report_validateuc': originUcDescr })
                    if cd_data and isinstance(cd_data, dict):
                        state = next(iter(cd_data.values())) if len(cd_data) == 1 else cd_data
                        result = state.get("diagrama_classes_final")
            except:
                result = None

        case 'PROTOTIPO_INTERFACE':
            '''
            expected data
            { report: str, cdinuc_description_revised: str, ucincd_revised: str }
            '''
            try:
                if data['DocumentoOrigem'] != []:
                    originRq = ''
                    originUcDescr = ''
                    originCd = ''

                    for docId in data['DocumentoOrigem']:
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo
                        elif doc.TipoDocumento == 'CASO_USO':
                            _, _, originUcDescr = doc.arquivo.split('\n<!-- -->\n')
                        elif doc.TipoDocumento == 'DIAGRAMA_CLASSE':
                            originCd = doc.arquivo

                ip_data = run_ip({ 'report': originRq, 'cdinuc_description_revised': originUcDescr, 'ucincd_revised': originCd })
                if ip_data and isinstance(ip_data, dict):
                    state = next(iter(ip_data.values())) if len(ip_data) == 1 else ip_data
                    prototipo_interface = state.get("interface_prototype")
                    descricao_interface = state.get("interface_description")

                    result = (prototipo_interface, descricao_interface)
            except:
                result = None

    return result if result else ''