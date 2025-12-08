from hashids import Hashids
from django.conf import settings
from django.http import Http404

from .models import (
    Documento
)

from webhook_server.webhook_server_functions.miniworld_functions import (
    # expected data: video_entrevista: str
    run_graphMW_with_trace as run_mw
)
from webhook_server.webhook_server_functions.requirements_functions import (
    # expected data: minimundo: str
    run_graphRq_with_trace as run_rq
)
from webhook_server.webhook_server_functions.usecase_functions import (
    # expected data: minimundo: str, report: str
    run_graphUC_with_trace as run_uc
)
from webhook_server.webhook_server_functions.classdiagram_functions import (
    # expected data: minimundo: str, report: str, format_uc: str, report_validateuc: str
    run_graphDC_with_trace as run_dc
)
from webhook_server.webhook_server_functions.interface_functions import (
    # expected data: report: str, cdinuc_description_revised: str, ucincd_revised: str
    run_graphIP_with_trace as run_ip
)

hashids = Hashids(settings.HASHIDS_SALT, min_length=8)

def h_encode(id):
    return hashids.encode(id)

def h_decode(h):
    if z := hashids.decode(h):
        return z[0]


class HashIdConverter:
    regex = '[a-zA-Z0-9]{8,}'

    def to_python(self, value):
        return h_decode(value)

    def to_url(self, value):
        return h_encode(value)

def is_empty_or_null(string: str) -> bool:
    '''
    Verify if a string is empty or if its a None
    '''
    return not (string and string.strip())

def version_from_another_doc(doc_origin: Documento, doc_old_v: Documento | None = None) -> tuple[int, int]:
    print('from another document')

    v_major = doc_origin.vMajor

    # if the origin and the older versions have the same major, it indicates a regen of a version
    if doc_old_v and doc_old_v.vMajor == v_major:
        v_minor = doc_old_v.vMinor + 1
    # otherwise, the version follows the same of the origin document
    else:
        v_minor = doc_origin.vMinor
    
    return v_major, v_minor

def version_from_audio(doc_old_v: Documento) -> tuple[int, int]:
    print('new major')

    return doc_old_v.vMajor + 1, 0

def update_version(doc_old_v: Documento) -> tuple[int, int]:
    print('update')

    return doc_old_v.vMajor, doc_old_v.vMinor + 1

def send_to_llm(data: dict) -> str | tuple:
    result = None

    match (data.get('TipoDocumento')):
        case 'MINIMUNDO':
            try:
                if data['origemAudio']:
                    path = '../shared/uploads/' + data['origemAudio']

                    mw_data = run_mw({ 'video_entrevista': path })
                    if mw_data and isinstance(mw_data, dict):
                        state = next(iter(mw_data.values())) if len(mw_data) == 1 else mw_data
                        result = state.get('minimundo')
            except:
                result = None
            
        case 'REQUISITOS':
            try:
                print('Requisitos')

                if data.get('DocumentoOrigem'):
                    originMw = ''
                    for docId in data.get('DocumentoOrigem'):
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                    
                    oldRq = ''
                    if data.get('DocumentoAnterior'):
                        doc = Documento.objects.get(pk=data.get('DocumentoAnterior'))
                        if doc.TipoDocumento == 'REQUISITOS':
                            oldRq = doc.arquivo

                    rq_data = run_rq({ 'minimundo': originMw, 'old_requirements':oldRq })
                    if rq_data and isinstance(rq_data, dict):
                        state = next(iter(rq_data.values())) if len(rq_data) == 1 else rq_data
                        result = state.get('report')
            except:
                result = None

        case 'CASO_USO':
            try:
                if data.get('DocumentoOrigem'):
                    
                    originMw = ''
                    originRq = ''
                    for docId in data.get('DocumentoOrigem'):
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                        elif doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo

                    uc_data = run_uc({ 'minimundo':originMw, 'report':originRq})
                    if uc_data and isinstance(uc_data, dict):
                        state = next(iter(uc_data.values())) if len(uc_data) == 1 else uc_data
                        diagrama = state.get("usecases_diagram")
                        tabela = state.get("format_uc")
                        descricao = state.get("report_validateuc")

                        result = (diagrama, tabela, descricao)
            except:
                result = None
            
        case 'DIAGRAMA_CLASSE':

            '''
            expected data
            { minimundo: str, report: str, format_uc: str, report_validateuc: str }
            '''
            try:
                if data.get('DocumentoOrigem'):
                    originMw = ''
                    originRq = ''
                    originUcTable = ''
                    originUcDescr = ''

                    for docId in data.get('DocumentoOrigem'):
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'MINIMUNDO':
                            originMw = doc.arquivo
                        elif doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo
                        elif doc.TipoDocumento == 'CASO_USO':
                            _, originUcTable, originUcDescr = doc.arquivo.split('\n<!-- -->\n')

                    cd_data = run_dc({
                        'minimundo': originMw,
                        'report': originRq,
                        'format_uc': originUcTable,
                        'report_validateuc': originUcDescr })
                    if cd_data and isinstance(cd_data, dict):
                        state = next(iter(cd_data.values())) if len(cd_data) == 1 else cd_data
                        result = state.get("diagrama_classes_final")
            except:
                result = None

        case 'PROTOTIPO_INTERFACE':
            '''
            expected data
            { report: str, cdinuc_description_revised: str, ucincd_revised: str }
            '''
            try:
                if data.get('DocumentoOrigem'):
                    originRq = ''
                    originUcDescr = ''
                    originCd = ''

                    for docId in data.get('DocumentoOrigem'):
                        doc = Documento.objects.get(pk=docId)
                        if doc.TipoDocumento == 'REQUISITOS':
                            originRq = doc.arquivo
                        elif doc.TipoDocumento == 'CASO_USO':
                            _, _, originUcDescr = doc.arquivo.split('\n<!-- -->\n')
                        elif doc.TipoDocumento == 'DIAGRAMA_CLASSE':
                            originCd = doc.arquivo

                ip_data = run_ip({ 'report': originRq, 'cdinuc_description_revised': originUcDescr, 'ucincd_revised': originCd })
                if ip_data and isinstance(ip_data, dict):
                    state = next(iter(ip_data.values())) if len(ip_data) == 1 else ip_data
                    prototipo_interface = state.get("interface_prototype")
                    descricao_interface = state.get("interface_description")

                    result = (prototipo_interface, descricao_interface)
            except:
                result = None

    return result if result else Http404()