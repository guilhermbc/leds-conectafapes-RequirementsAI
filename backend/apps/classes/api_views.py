from .models import (
    Projeto,
    Modulo,
    Documento,
    DOCS
)
from .serializers import (
    ProjetoReadSerializer, ProjetoWriteSerializer,
    ModuloReadSerializer, ModuloWriteSerializer,
    DocumentoReadSerializer, DocumentoWriteSerializer,
)

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet, ModelViewSet
from rest_framework.response import Response
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
from .utils import is_empty_or_null, send_to_llm, version_from_another_doc, version_from_audio, update_version

class HealthViewSet(ViewSet):

    @action(detail='')
    def check(self, request):
        response_data = {'content': 'OK'}
        return JsonResponse(response_data, status=201)


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
            from django.db.models import OuterRef, Subquery, Max, Q, Prefetch

            highest_major_subquery = Documento.objects.filter(
                Modulo=OuterRef("pk")
            ).order_by("-vMajor").values("vMajor")[:1]
            
            tipos = [ tipo for tipo, _ in DOCS.choices ]

            base_filtered_docs = Documento.objects.filter(
                Modulo=OuterRef("pk"),
                vMajor=Subquery(highest_major_subquery)
            )

            from django.db.models.expressions import Case, When

            # Lista de condições When para filtrar os IDs
            whens = []
            for tipo in tipos:
                # subquery para aquela combinação (módulo + maior major + tipo)
                doc_sub = base_filtered_docs.filter(
                    TipoDocumento=tipo
                ).order_by("-vMinor").values("id")[:1]

                whens.append(When(TipoDocumento=tipo, then=Subquery(doc_sub)))

            # queryset final que será usado no Prefetch
            final_docs = Documento.objects.filter(
                id__in=Subquery(
                    base_filtered_docs.annotate(
                        chosen_id=Case(*whens)
                    ).values("chosen_id")
                )
            )

            queryset = queryset.prefetch_related(
                Prefetch("modulo_documento", queryset=final_docs)
            )
        
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
    filterset_fields = '__all__'
    # filterser_class = DocumentoFilter
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

        # If it should be generated by AI, generate it
        # and if its from another document, copy the version from the origin
        # or if its a new audio, create a new major version
        if is_empty_or_null(request.data.get('arquivo')):
            result = send_to_llm(request.data)
            generated_by_ai = True

            if request.data.get('DocumentoOrigem') and len(request.data.get('DocumentoOrigem')) != 0:
                doc_origem_id = request.data.get('DocumentoOrigem')[-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id)
                
                vMajor, vMinor = version_from_another_doc(
                    doc_origem,
                    request.data.get('DocumentoAnterior')
                )

            elif request.data.get('audioOrigem') and request.data.get('DocumentoAnterior'):
                doc_anterior_id = request.data.get('DocumentoAnterior')
                doc_anterior = get_object_or_404(Documento, id=doc_anterior_id)
                vMajor, vMinor = version_from_audio(doc_anterior)
            else:
                vMajor = 1
                vMinor = 0

        # If its not generatad by AI, use the given content
        # and if its a update, increment the minor 
        # and if its a manual generation, use the origin document version
        else:
            generated_by_ai = False
            result = request.data.get('arquivo')

            if request.data.get(''):
                doc_anterior_id = request.data.get('')
                doc_anterior = get_object_or_404(Documento, id=doc_anterior_id)
                vMajor, vMinor = update_version(doc_anterior)
            if request.data.get('DocumentoOrigem') and len(request.data.get('DocumentoOrigem')) != 0:
                doc_origem_id = request.data.get('DocumentoOrigem')[-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id)
                vMajor, vMinor = version_from_another_doc(doc_origem)
            else:
                vMajor = 1
                vMinor = 0

        result_string = ''
        if not isinstance(result, str):
            for element in result:
                result_string += element + '\n<!-- -->\n'
        else:
            result_string = result

        request.data['vMajor'] = vMajor
        request.data['vMinor'] = vMinor

        request.data['arquivo'] = result_string
        request.data['geradoIA'] = generated_by_ai

        return super().create(request, *args, **kwargs)