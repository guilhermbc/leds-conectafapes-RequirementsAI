import os

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
    UserRegisterSerializer
)

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Case, When, IntegerField
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet, ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_condition import And, Or
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication
from rest_framework.authentication import SessionAuthentication
from .pagination import CustomPagination
from rest_framework import generics
from rest_framework import filters
import django_filters.rest_framework
import logging
import requests

logger = logging.getLogger(__name__)

from rest_framework.permissions import AllowAny # for testing
from .filters import DocumentoFilter
from .utils import is_empty_or_null, send_to_llm, version_from_another_doc, version_from_audio, update_version

class HealthViewSet(ViewSet):

    permission_classes = [AllowAny]

    @action(detail='', url_path='')
    def check(self, request):
        response_data = {'content': 'OK'}
        return JsonResponse(response_data, status=201)


class ProjetoViewSet(ModelViewSet):
    queryset = Projeto.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = [Or(IsAdminUser, IsAuthenticated, TokenHasReadWriteScope)]

    # permission_classes = [AllowAny]

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
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Projeto.objects.filter(user=self.request.user)

class ModuloViewSet(ModelViewSet):
    queryset = Modulo.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]

    # permission_classes = [AllowAny]

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
    
    def get_object(self) -> any:
        queryset = self.filter_queryset(self.get_queryset())

        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('modulo_documento')
        
        obj = get_object_or_404(queryset, **self.kwargs)
        
        self.check_object_permissions(self.request, obj)
        return obj
    
    @action(detail=False, methods=['get'], url_path=r'get_last_docs/(?P<modulo_id>\d+)', filter_backends=[])
    def get_last_docs(self, request, modulo_id=None):

        mod = get_object_or_404(Modulo, id=int(modulo_id))

        docs = mod.modulo_documento.filter(
            vMaisRecente=True
        ).order_by(
            Case(
                When(TipoDocumento='MINIMUNDO', then=0),
                When(TipoDocumento='REQUISITOS', then=1),
                When(TipoDocumento='CASO_USO', then=2),
                When(TipoDocumento='DIAGRAMA_CLASSE', then=3),
                output_field=IntegerField()
            )
        )

        return Response(
            DocumentoReadSerializer(docs, many=True).data
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Modulo.objects.filter(user=self.request.user)

class DocumentoViewSet(ModelViewSet):
    queryset = Documento.objects.all()
    pagination_class = CustomPagination
    authentication_classes = [OAuth2Authentication, SessionAuthentication]
    permission_classes = [Or(IsAdminUser, TokenHasReadWriteScope)]
    parser_classes = (MultiPartParser, FormParser)

    filter_backends = (
        filters.SearchFilter,
        filters.OrderingFilter,
        django_filters.rest_framework.DjangoFilterBackend
    )
    filterset_fields = [
        'id',
        'vMajor',
        'vMinor',
        'geradoIA',
        'vMaisRecente',
        'obsoleto',
        'TipoDocumento',
        'DocumentoAnterior',
        'DocumentoOrigem',
        'parUC_CD',
        'Modulo',
    ]
    search_fields = ['versao', 'arquivo']
    ordering_fields = '__all__'
    ordering = ["id"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Documento.objects.none()
        return Documento.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return DocumentoReadSerializer
        return DocumentoWriteSerializer

    def _create_caso_uso_com_classes(self, data):
        documento_anterior = data.get("DocumentoAnterior")
        previous_uc_id = None
        previous_cd_id = None

        if documento_anterior:
            doc_anterior = get_object_or_404(Documento, id=documento_anterior)
            if doc_anterior.TipoDocumento == 'CASO_USO':
                previous_uc_id = doc_anterior.id
                previous_cd_id = getattr(doc_anterior.parUC_CD, 'id', None)
            elif doc_anterior.TipoDocumento == 'DIAGRAMA_CLASSE':
                previous_cd_id = doc_anterior.id
                previous_uc_id = getattr(doc_anterior.parUC_CD, 'id', None)


        # Ambos gerados juntos, por IA
        if data.get('TipoDocumento') == 'CASO_USO_E_DIAGRAMA_CLASSE':
            # Pode ser duas coisas:
            # Gerar os dois pela primeira vez, sem documento anterior
            # Ou gerar uma nova versão dos dois
            result = send_to_llm({
            **data,
            'TipoDocumento': data.get('TipoDocumento')
            })

            if not result:
                return Response({'error': 'Erro ao gerar documentos'}, status=500)

            caso_uso_result = result.get('caso_uso')
            diagrama_classe_result = result.get('diagrama_classe')

            # montar UC
            result_string_uc = ''
            for element in caso_uso_result:
                result_string_uc += element + '\n<!-- -->\n'

            # Versionamento
            vMajor, vMinor = 1, 0

            doc_origem_id = data.get('DocumentoOrigem')[-1]
            doc_origem = get_object_or_404(Documento, id=doc_origem_id)
            vMajorOrigem = doc_origem.vMajor
            vMinorOrigem = doc_origem.vMinor
            vMajorAnteriorUC = 0
            vMinorAnteriorUC = 0

            if previous_uc_id:
                previous_uc = get_object_or_404(Documento, id=previous_uc_id)
                # Como UC e CD têm sempre a mesma versão, pode-se utilizar a mesma versão para ambos
                vMajorAnteriorUC = previous_uc.vMajor
                vMinorAnteriorUC = previous_uc.vMinor

            if (vMajorOrigem, vMinorOrigem) >= (vMajorAnteriorUC, vMinorAnteriorUC):
                vMajor = vMajorOrigem
                vMinor = vMinorOrigem
            else:
                vMajor = vMajorAnteriorUC
                vMinor = vMinorAnteriorUC + 1

            # CASO USO
            data_uc = data.copy()
            data_uc.update({
                'arquivo': result_string_uc,
                'TipoDocumento': 'CASO_USO',
                'vMajor': vMajor,
                'vMinor': vMinor,
                'geradoIA': True,
                'vMaisRecente': True,
                'DocumentoAnterior': previous_uc_id,
            })

            serializer_uc = self.get_serializer(data=data_uc)
            serializer_uc.is_valid(raise_exception=True)
            self.perform_create(serializer_uc)

            # CLASSES
            data_cd = data.copy()
            data_cd.update({
                'arquivo': diagrama_classe_result,
                'TipoDocumento': 'DIAGRAMA_CLASSE',
                'vMajor': vMajor,
                'vMinor': vMinor,
                'geradoIA': True,
                'vMaisRecente': True,
                'DocumentoAnterior': previous_cd_id,
            })

            serializer_cd = self.get_serializer(data=data_cd)
            serializer_cd.is_valid(raise_exception=True)
            self.perform_create(serializer_cd)

            uc_instance = serializer_uc.instance
            cd_instance = serializer_cd.instance
            uc_instance.parUC_CD = cd_instance
            uc_instance.save(update_fields=['parUC_CD'])
            cd_instance.parUC_CD = uc_instance
            cd_instance.save(update_fields=['parUC_CD'])

            # Atualizar estado de novidade do documento anterior
            if documento_anterior:
                doc_anterior = get_object_or_404(Documento, id=documento_anterior)
                if doc_anterior.vMaisRecente is not False:
                    doc_anterior.vMaisRecente = False
                    doc_anterior.save(update_fields=['vMaisRecente'])
                if getattr(doc_anterior, 'parUC_CD', None) and doc_anterior.parUC_CD.vMaisRecente is not False:
                    doc_anterior.parUC_CD.vMaisRecente = False
                    doc_anterior.parUC_CD.save(update_fields=['vMaisRecente'])

            return Response(serializer_cd.data, status=201)

            
        # Se for qualquer outro caso, joga pra essa função que vai criar os dois documentos adequadamente, com IA ou não
        else:
            return self._create_uploaded_uc_cd(data)


    def create(self, request, *args, **kwargs):
        data = request.data.dict()
        arquivoAudio = request.FILES.get('arquivoAudio')
        documentos_origem = request.data.getlist('DocumentoOrigem')

        logger.info("FILES:", extra={"files": request.FILES})
        logger.info("audio:", extra={
            "existeAudio": bool(request.FILES.get('arquivoAudio')),
            "sizeAudio": getattr(request.FILES.get('arquivoAudio'), 'size', None)
        })

        arquivo_para_reusar = None

        if not arquivoAudio:
            data.pop('arquivoAudio', None)

        documento_anterior = data.get('DocumentoAnterior')

        # Força sempre lista no data, e nunca string
        data['DocumentoOrigem'] = documentos_origem

        # Criar path temporário se houver upload
        if arquivoAudio:
            import tempfile

            with tempfile.NamedTemporaryFile(delete=False) as temp:
                for chunk in arquivoAudio.chunks():
                    temp.write(chunk)

                temp_path = temp.name

            data['audio_path'] = temp_path
            
            logger.info("Temp path criado", extra={"path": temp_path})
            logger.info("Arquivo existe?", extra={"exists": os.path.exists(temp_path)})

        else:
            if documento_anterior:
                doc_anterior = get_object_or_404(Documento, pk=documento_anterior)

                if data.get('TipoDocumento') == 'MINIMUNDO' and doc_anterior.arquivoAudio:
                    arquivo_para_reusar = doc_anterior.arquivoAudio

                    import tempfile

                    with open(doc_anterior.arquivoAudio.path, 'rb') as original:
                        with tempfile.NamedTemporaryFile(delete=False) as temp:
                            temp.write(original.read())
                            temp_path = temp.name

                    data['audio_path'] = temp_path

        # Se for CASO_USO/DIAGRAMA_CLASSE, enviar para um método separado
        if data.get('TipoDocumento') in ['CASO_USO_E_DIAGRAMA_CLASSE', # Ambos gerados juntos, por IA
                                         'CASO_USO_SIMPLES', # Upload do UC e incremento de versão do CD relacionado, sem usar IA
                                         'DIAGRAMA_CLASSE_SIMPLES', # Upload do CD e incremento de versão do UC relacionado, sem usar IA
                                         'CASO_USO_ATUALIZAR', # Upload do UC e geração de nova versão do CD relacionado com IA
                                         'DIAGRAMA_CLASSE_ATUALIZAR']: # Upload do CD e geração de nova versão do UC relacionado com IA
            return self._create_caso_uso_com_classes(data)
        
        # Definir parUC_CD
        if (data.get('TipoDocumento') == 'CASO_USO' or data.get('TipoDocumento') == 'DIAGRAMA_CLASSE'):
                # Se foi passado, utilize ele
                if data.get('parUC_CD'):
                    par_doc_id = data.get('parUC_CD')
                    par_doc = get_object_or_404(Documento, id=par_doc_id)
                    data['parUC_CD'] = par_doc.id
                # Se não foi passado, tente manter o par da versão anterior
                else:
                    if documento_anterior:
                        doc_anterior = get_object_or_404(Documento, id=documento_anterior)
                        if (doc_anterior.TipoDocumento in ['CASO_USO', 'DIAGRAMA_CLASSE']) and doc_anterior.parUC_CD:
                            data['parUC_CD'] = doc_anterior.parUC_CD.id
                        else:
                            data['parUC_CD'] = None
                    else:
                        data['parUC_CD'] = None

        # Casos simples
        # Se deve ser gerado por IA
        if is_empty_or_null(data.get('arquivo')):
            result = send_to_llm(data)
            generated_by_ai = True

            vMajor = 1
            vMinor = 0

            if is_empty_or_null(documento_anterior):
                vMajorAnterior = 0
                vMinorAnterior = 0
            else:
                doc_anterior = get_object_or_404(Documento, pk=documento_anterior)
                vMajorAnterior = doc_anterior.vMajor
                vMinorAnterior = doc_anterior.vMinor

            # Geração de uma nova Narrativa de Domínio
            if data.get('TipoDocumento') == 'MINIMUNDO' and data.get('audio_path'):
                # Baseada em novo áudio
                if documento_anterior:
                    vMajor = vMajorAnterior + 1
                    vMinor = 0
                #Se não tiver DocumentoAnterior, fica 1.0

            else:
                doc_origem_id = data['DocumentoOrigem'][-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id) 
                vMajorOrigem = doc_origem.vMajor
                vMinorOrigem = doc_origem.vMinor

                if (vMajorOrigem, vMinorOrigem) >= (vMajorAnterior, vMinorAnterior):
                    vMajor = vMajorOrigem
                    vMinor = vMinorOrigem

                else:
                    vMajor = vMajorAnterior
                    vMinor = vMinorAnterior + 1

        # Se não deve ser gerado por IA
        else:
            generated_by_ai = False
            result = data.get('arquivo')

            # Incremento Minor
            if documento_anterior:
                doc_anterior_id = documento_anterior
                doc_anterior = get_object_or_404(Documento, id=doc_anterior_id)
                vMajor, vMinor = update_version(doc_anterior)

            elif data.get('DocumentoOrigem') and len(data.get('DocumentoOrigem')) != 0:
                doc_origem_id = data.get('DocumentoOrigem')[-1]
                doc_origem = get_object_or_404(Documento, id=doc_origem_id)
                vMajor, vMinor = version_from_another_doc(doc_origem)

            else:
                vMajor = 1
                vMinor = 0

        # Mesma lógica de montagem
        result_string = ''
        if not isinstance(result, str):
            for element in result:
                result_string += element + '\n<!-- -->\n'
        else:
            result_string = result

        data['vMajor'] = vMajor
        data['vMinor'] = vMinor
        data['arquivo'] = result_string
        data['geradoIA'] = generated_by_ai
        data['vMaisRecente'] = True

        # 👇 IMPORTANTE: passar data, não request.data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(user=self.request.user)

        if arquivo_para_reusar:
            instance.arquivoAudio = arquivo_para_reusar
            instance.save(update_fields=['arquivoAudio'])

        # Atualizar parUC_CD relacionado, caso seja UC ou CD gerado por IA
        if data.get('parUC_CD') and (data.get('TipoDocumento') == 'CASO_USO' or data.get('TipoDocumento') == 'DIAGRAMA_CLASSE') and generated_by_ai:
            par_doc_id = data.get('parUC_CD')
            par_doc = get_object_or_404(Documento, id=par_doc_id)
            par_doc.parUC_CD = instance
            par_doc.save(update_fields=['parUC_CD'])

        # Atualizar estado de novidade do documento anterior
        if documento_anterior:
            doc_anterior = get_object_or_404(Documento, id=documento_anterior)
            if doc_anterior.vMaisRecente is not False:
                doc_anterior.vMaisRecente = False
                doc_anterior.save(update_fields=['vMaisRecente'])

        return Response(serializer.data, status=201)

    def _compute_uploaded_version(self, data):
        documento_anterior = data.get('DocumentoAnterior')

        if documento_anterior:
            doc_anterior = get_object_or_404(Documento, id=documento_anterior)
            return update_version(doc_anterior)

        if data.get('DocumentoOrigem') and len(data.get('DocumentoOrigem')) != 0:
            doc_origem_id = data.get('DocumentoOrigem')[-1]
            doc_origem = get_object_or_404(Documento, id=doc_origem_id)
            return version_from_another_doc(doc_origem)

        return 1, 0

    def _create_uploaded_uc_cd(self, data):
        tipo_documento = data.get('TipoDocumento')
        is_caso_uso = tipo_documento.startswith('CASO_USO')
        is_update = tipo_documento.endswith('_ATUALIZAR')

        # Define o tipo do documento principal e do par
        actual_tipo = 'CASO_USO' if is_caso_uso else 'DIAGRAMA_CLASSE'
        pair_tipo = 'DIAGRAMA_CLASSE' if is_caso_uso else 'CASO_USO'

        documento_anterior = data.get('DocumentoAnterior')
        old_doc = get_object_or_404(Documento, id=documento_anterior) if documento_anterior else None
        pair_previous = getattr(old_doc, 'parUC_CD', None) if old_doc else None

        # Criar documento principal
        data_main = data.copy()
        data_main.update({
            'TipoDocumento': actual_tipo, # Substituir o tipo corretamente (nada de CASO_USO_SIMPLES, etc)
            'geradoIA': False,
            'vMaisRecente': True,
        })

        # Definir versão do documento principal
        vMajor, vMinor = self._compute_uploaded_version(data_main)
        data_main['vMajor'] = vMajor
        data_main['vMinor'] = vMinor

        # Criar o documento principal
        serializer_main = self.get_serializer(data=data_main)
        serializer_main.is_valid(raise_exception=True)
        self.perform_create(serializer_main)
        main_doc = serializer_main.instance

        # Criar o documento par
        pair_doc = None
        if is_update or pair_previous:
            # A princípio, o par recebe os mesmos dados do documento principal, 
            # exceto pelo tipo, pelo relacionamento de versão com o documento anterior do par (se existir),
            # vMaisRecente e parUC_CD
            pair_data = data.copy()
            pair_data.update({
                'TipoDocumento': pair_tipo,
                'DocumentoAnterior': getattr(pair_previous, 'id', None),
                'vMaisRecente': True,
                'parUC_CD': main_doc.id,
            })

            # Se for atualização, o par é gerado por IA.
            if is_update:
                pair_data['geradoIA'] = True

                main_origin_ids = list(main_doc.DocumentoOrigem.values_list('id', flat=True))
                pair_data['DocumentoOrigem'] = main_origin_ids.copy()

                # pair_origin_ids = main_origin_ids.copy()

                # if pair_previous and pair_previous.id not in pair_origin_ids:
                #     pair_origin_ids.append(pair_previous.id)
                # if main_doc.id not in pair_origin_ids:
                #     pair_origin_ids.append(main_doc.id)

                print("\n\nDados enviados para IA:", pair_data)
                pair_content = send_to_llm(pair_data)
                print("Pair_content:", pair_content, "\n\n")

               
                if not isinstance(pair_content, str):
                    pair_content = '' if pair_content is None else '\n<!-- -->\n'.join(pair_content)

                if not pair_content and pair_previous:
                    pair_content = pair_previous.arquivo or ''

                pair_data['arquivo'] = pair_content
            # Se for criação simples, o par continua com mesmo conteúdo que o seu anterior
            else:
                pair_data['geradoIA'] = False
                if pair_previous:
                    pair_data['arquivo'] = pair_previous.arquivo
                    pair_data['DocumentoOrigem'] = list(pair_previous.DocumentoOrigem.values_list('id', flat=True))
                else:
                    pair_data['arquivo'] = ''
                    pair_data['DocumentoOrigem'] = data.get('DocumentoOrigem', [])

            if pair_previous:
                pair_vMajor, pair_vMinor = update_version(pair_previous)
            else:
                pair_vMajor, pair_vMinor = 1, 0

            pair_data['vMajor'] = pair_vMajor
            pair_data['vMinor'] = pair_vMinor

            serializer_pair = self.get_serializer(data=pair_data)
            serializer_pair.is_valid(raise_exception=True)
            self.perform_create(serializer_pair)
            pair_doc = serializer_pair.instance

            main_doc.parUC_CD = pair_doc
            main_doc.save(update_fields=['parUC_CD'])
            pair_doc.parUC_CD = main_doc
            pair_doc.save(update_fields=['parUC_CD'])

        if documento_anterior:
            if old_doc and old_doc.vMaisRecente is not False:
                old_doc.vMaisRecente = False
                old_doc.save(update_fields=['vMaisRecente'])
            if old_doc and getattr(old_doc, 'parUC_CD', None) and old_doc.parUC_CD.vMaisRecente is not False:
                old_doc.parUC_CD.vMaisRecente = False
                old_doc.parUC_CD.save(update_fields=['vMaisRecente'])

        response_data = serializer_main.data
        # if pair_doc:
        #     response_data['parUC_CD'] = serializer_pair.data

        return Response(response_data, status=201)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class UserViewSet(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permissions_classes = [AllowAny]