from rest_framework import serializers, generics
from django.contrib.auth.models import User

from .models import (
    Projeto,
    Modulo,
    Documento,
    DocumentoGenerationJob,
)
class DocumentoGenerationJobSerializer(serializers.ModelSerializer):

    documento_id = serializers.UUIDField(
        source='documento.id',
        read_only=True
    )
    class Meta:
        model = DocumentoGenerationJob
        fields = [
            'id',
            'status',
            'progress',
            'documento_id',
            'error',
            'created_at',
            'finished_at',
        ]
class DocumentoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        exclude = ("polymorphic_ctype",)
        read_only_fields = ("user",)

class DocumentoReadSerializer(serializers.ModelSerializer):
    class Meta:
        depth = 1
        model = Documento
        exclude = ("polymorphic_ctype",)

class ModuloWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        exclude = ("polymorphic_ctype",)
        read_only_fields = ("user",)

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
        read_only_fields = ("user",)


class ProjetoReadSerializer(serializers.ModelSerializer):
    projeto_modulo = ModuloReadSerializer(many=True, read_only=True)

    class Meta:
        depth = 1
        model = Projeto
        exclude = ("polymorphic_ctype",)

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user