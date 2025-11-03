from rest_framework import serializers
from .models import (
    Projeto,
    Modulo,
    Documento,
)

class DocumentoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        exclude = ("polymorphic_ctype",)

class DocumentoReadSerializer(serializers.ModelSerializer):
    class Meta:
        depth = 1
        model = Documento
        exclude = ("polymorphic_ctype",)

class ModuloWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        exclude = ("polymorphic_ctype",)

class ModuloReadSerializer(serializers.ModelSerializer):
    modulo_documento = DocumentoReadSerializer(many=True, read_only=True)

    class Meta:
        depth = 1
        model = Modulo
        exclude = ("polymorphic_ctype",)

class ProjetoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projeto
        exclude = ("polymorphic_ctype",)

class ProjetoReadSerializer(serializers.ModelSerializer):
    projeto_modulo = ModuloReadSerializer(many=True, read_only=True)

    class Meta:
        depth = 1
        model = Projeto
        exclude = ("polymorphic_ctype",)