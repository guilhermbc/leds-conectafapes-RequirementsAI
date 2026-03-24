from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from polymorphic.models import PolymorphicModel

User = get_user_model()

class DOCS(models.TextChoices):
    """"""
    MINIMUNDO = 'MINIMUNDO', _('Minimundo')
    REQUISITOS = 'REQUISITOS', _('Requisitos')
    CASO_USO = 'CASO_USO', _('Caso uso')
    DIAGRAMA_CLASSE = 'DIAGRAMA_CLASSE', _('Diagrama classe')
    PROTOTIPO_INTERFACE = 'PROTOTIPO_INTERFACE', _('Prototipo interface')


class Projeto(PolymorphicModel, models.Model):
    ''''''

    nome = models.CharField(max_length=300, null=True, blank=True)
    descricao = models.TextField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projetos')

    class Meta:
        db_table = 'projeto'

class Modulo(PolymorphicModel, models.Model):
    ''''''

    nome = models.CharField(max_length=300, null=True, blank=True)
    descricao = models.TextField(null=True, blank=True)

    Projeto = models.ForeignKey('Projeto', blank=True, null=True, on_delete=models.CASCADE, related_name="projeto_%(class)s")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='modulos')


    class Meta:
        db_table = 'modulo'

class Documento(PolymorphicModel, models.Model):
    ''''''
    # versao do documento
    vMajor = models.IntegerField(null=True, blank=True)
    vMinor = models.IntegerField(null=True, blank=True)

    # gerado por IA
    geradoIA = models.BooleanField(null=True, blank=True)

    # string do documento
    arquivo = models.TextField(null=True, blank=True)
    
    # path do audio de origem do documento (se houver)
    origemAudio = models.CharField(null=True, blank=True)
    
    # id dos documentos de origem
    DocumentoOrigem = models.ManyToManyField('Documento', blank=True, null=True, symmetrical=False, related_name='documento_%(class)s_origem')
    
    # id da versao anterior do documento (se houver)
    DocumentoAnterior = models.ForeignKey('Documento', blank=True, null=True, on_delete=models.DO_NOTHING, related_name="documento_%(class)s_anteior")
    
    # id do modulo que o documento pertence
    Modulo = models.ForeignKey('Modulo', blank=True, null=True, on_delete=models.CASCADE, related_name="modulo_%(class)s")
    
    # tipo do documento
    TipoDocumento = models.CharField(max_length=20, choices=DOCS.choices, default=DOCS.MINIMUNDO)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documentos')

    class Meta:
        db_table = 'documento'

