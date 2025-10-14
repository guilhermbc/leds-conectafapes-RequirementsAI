from django.db import models
from django.utils.translation import gettext_lazy as _
from polymorphic.models import PolymorphicModel

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
    descricao = models.CharField(max_length=300, null=True, blank=True)


    Projeto = models.ForeignKey('Modulo', blank=True, null=True, on_delete=models.CASCADE, related_name="projeto_%(class)s")

    class Meta:
        db_table = 'projeto'

class Modulo(PolymorphicModel, models.Model):
    ''''''

    nome = models.CharField(max_length=300, null=True, blank=True)
    descricao = models.CharField(max_length=300, null=True, blank=True)


    Modulo = models.ForeignKey('Documento', blank=True, null=True, on_delete=models.CASCADE, related_name="modulo_%(class)s")

    class Meta:
        db_table = 'modulo'

class Documento(PolymorphicModel, models.Model):
    ''''''

    versao = models.CharField(max_length=300, null=True, blank=True)
    arquivo = models.CharField(max_length=300, null=True, blank=True)

    Documento = models.CharField(max_length=18, choices=DOCS.choices, default=DOCS.MINIMUNDO)


    class Meta:
        db_table = 'documento'

