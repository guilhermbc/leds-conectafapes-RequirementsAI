import json
from rest_framework import status
from django.test import TestCase, Client
from django.urls import reverse
from classes.models import Documento
from classes.serializers import DocumentoSerializer
from faker import Faker
import random

class DocumentoTests(TestCase):
    def setUp(self):
        self.faker = Faker('pt_BR')
        self.client = Client()

        self.documento_1 = Documento.objects.create(versao = self.faker.first_name(), arquivo = self.faker.first_name())
        self.documento_2 = Documento.objects.create(versao = self.faker.first_name(), arquivo = self.faker.first_name())
        self.documento_3 = Documento.objects.create(versao = self.faker.first_name(), arquivo = self.faker.first_name())

        self.valid_payload = {
            'versao' : self.faker.first_name(),'arquivo' : self.faker.first_name()
        }
        self.invalid_payload = {
            'versao' : self.faker.first_name(),'arquivo' : self.faker.first_name()
        }

    def test_valid_create(self):
        response = self.client.post(
            reverse('documento-api-list'),
            data=json.dumps(self.valid_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_create(self):
        response = self.client.post(
            reverse('documento-api-list'),
            data=json.dumps(self.invalid_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_upload(self):
        response = self.client.put(
            reverse('documento-detail',
            kwargs={'pk': self.documento_1.id}),
            data=json.dumps(self.valid_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_upload(self):
        response = self.client.put(
            reverse('documento-detail',
            kwargs={'pk': self.documento_1.id}),
            data=json.dumps(self.invalid_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_paruc_cd_field_is_null_for_non_pair_document(self):
        doc = Documento.objects.create(
            TipoDocumento='REQUISITOS',
            arquivo=self.faker.first_name(),
            parUC_CD=self.documento_1
        )
        self.assertIsNone(Documento.objects.get(pk=doc.id).parUC_CD)

    def test_paruc_cd_links_caso_uso_and_diagrama_classe(self):
        caso_uso = Documento.objects.create(
            TipoDocumento='CASO_USO',
            arquivo=self.faker.first_name()
        )
        diagrama_classe = Documento.objects.create(
            TipoDocumento='DIAGRAMA_CLASSE',
            arquivo=self.faker.first_name()
        )
        caso_uso.parUC_CD = diagrama_classe
        caso_uso.save()
        diagrama_classe.parUC_CD = caso_uso
        diagrama_classe.save()

        self.assertEqual(caso_uso.parUC_CD_id, diagrama_classe.id)
        self.assertEqual(diagrama_classe.parUC_CD_id, caso_uso.id)

    # retornando todos os elementos    
    def test_retrieve_all(self):
        response   = self.client.get(reverse('documento-api-list'))
        data       = Documento.objects.all()
        serializer = DocumentoSerializer(data, context={'request': None}, many=True)
        # Aqui deve comparar todos os compos do objeto com serialização
        self.assertEqual(response.data, serializer.data)

        self.assertIsNotNone(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # retornando um elemento
    def test_valid_get_element(self):
        response = self.client.get(reverse('documento-detail',kwargs={'pk': self.documento_1.id}))
        data = Documento.objects.get(pk=self.condicao_1.id)
        # Aqui deve comparar todos os campos do objeto com serialização
        self.assertEqual(str(data.uuid),response.data['uuid'])
        self.assertIsNotNone(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # erro ao retornar um elemento invalido
    def test_invalid_get_element(self):
        response = self.client.get(reverse('documento-detail',kwargs={'pk': 666}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Delete um elemento valido
    def test_valid_delete(self):
        response = self.client.delete(reverse('documento-detail',kwargs={'pk': self.documento_1.id}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # Delete um elemento valido
    def test_invalid_delete(self):
        response = self.client.delete(reverse('documento-detail',kwargs={'pk': 666}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
