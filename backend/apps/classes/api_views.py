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
        # original create code
        '''
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        '''

        data: dict = request.data

        if is_empty_or_null(data['arquivo']):
            print('is empty')
            # Call artifact generation
        print('not empty')
        # Use given arquivo

        # return super().create(request, *args, **kwargs)
        NotImplementedError(('ainda não zé'))


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
