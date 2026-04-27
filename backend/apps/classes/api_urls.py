from django.urls import path, register_converter, include
from rest_framework import routers
from .api_views import (
    ProjetoViewSet,
    ModuloViewSet,
    DocumentoViewSet,
    UserViewSet,
    HealthViewSet,
    ApiKeyViewSet
)
router = routers.DefaultRouter()

router.register(r'projeto', ProjetoViewSet, basename='projeto')
router.register(r'modulo', ModuloViewSet, basename='modulo')
router.register(r'documento', DocumentoViewSet, basename='documento')
router.register(r'health', HealthViewSet, basename='health')

apikey_router = routers.DefaultRouter()
apikey_router.register(r'apikey', ApiKeyViewSet, basename='apikey')

urlpatterns = [
    path('classes/', include(router.urls)),
    path('register/', UserViewSet.as_view(), name='user-register'),
    path('apikey/', include(apikey_router.urls))
    # path('classes/modulo/get_last_docs/<int:modulo_id>', , name='get_last_docs')
]


# urlpatterns = [
#     path('topics/<int:topic_id>/', views.topic, name='topic'),
# ]