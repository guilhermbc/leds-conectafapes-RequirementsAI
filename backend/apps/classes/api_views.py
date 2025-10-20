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
    
    # specify behavior of create Documento
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


    # specify behavior of update Documento
    def update(self, request, *args, **kwargs):
        '''
        Specific behavior of the update Documento
        '''
        # original update code
        '''
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
        '''
        # return super().update(request, *args, **kwargs)
        NotImplementedError(('segura a onda'))

def send_to_llm(data: dict) -> str | tuple:
    match (data['Documento']):
        case 'MINIMUNDO':
            mw_data = run_mw()
            if mw_data and isinstance(mw_data, dict):
                state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                result = state.get('minimundo')
            
        case 'REQUISITOS':
            rq_data = run_rq()
            if rq_data and isinstance(rq_data, dict):
                state = next(iter(rq_data.values())) if len(rq_data) == 1 else rq_data
                result = state.get('report')

        case 'CASO_USO':
            data = run_uc
            if mw_data and isinstance(mw_data, dict):
                state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                diagrama = state.get("usecases_diagram")
                tabela = state.get("format_uc")
                descricao = state.get("report_validateuc")

                result = (diagrama, tabela, descricao)
        
        case 'DIAGRAMA_CLASSE':
            data = run_dc()
            if mw_data and isinstance(mw_data, dict):
                state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                result = state.get("diagrama_classes_final")

        case 'PROTOTIPO_INTERFACE':
            data = run_ip()
            if mw_data and isinstance(mw_data, dict):
                state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                prototipo_interface = state.get("interface_prototype")
                descricao_interface = state.get("interface_description")

                result = (prototipo_interface, descricao_interface)

    return result if result else ''