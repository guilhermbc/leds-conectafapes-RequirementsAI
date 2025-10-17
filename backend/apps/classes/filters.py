import django_filters
from .models import Documento

class DocumentoFilter(django_filters.FilterSet):
    class Meta:
        model = Documento
        fields = '__all__'
        exclude = ['fromAudioFile'] 