from django.urls import path, register_converter, include
from rest_framework import routers
from .api_views import (
    ProjetoViewSet,
    ModuloViewSet,
    DocumentoViewSet,
)
router = routers.DefaultRouter()

router.register(r'projeto', ProjetoViewSet, basename='projeto')
router.register(r'modulo', ModuloViewSet, basename='modulo')
router.register(r'documento', DocumentoViewSet, basename='documento')

urlpatterns = [
    path('classes/', include(router.urls))
]
