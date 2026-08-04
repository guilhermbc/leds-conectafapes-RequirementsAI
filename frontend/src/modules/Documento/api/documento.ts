/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */

import adminApi from '@/api/admin'

import type {
  Documento,
  DocumentoCreateReq,
  DocumentoListRes,
  DocumentoCreateRes,
  DocumentoGetRes,
  DocumentoUpdateRes,
  DocumentoDeleteRes,
  DocumentoGenerationJobRes,
} from '../types/documento.d.ts'

const documentoReqConf = {
  url: 'classes/documento/',
}

const jobReqConf = {
  url: 'classes/document-generation-jobs/',
}

//
// documentos
//

export const listarDocumento = async () => {
  return await adminApi.get<DocumentoListRes>(
    documentoReqConf.url
  )
}

export const criarDocumento = async (
  documento: DocumentoCreateReq | FormData
) => {

  if (documento instanceof FormData) {

    return await adminApi.post<DocumentoCreateRes>(
      documentoReqConf.url,
      documento
    )
  }

  return await adminApi.post<DocumentoCreateRes>(
    documentoReqConf.url,
    documento
  )
}

export const obterDocumento = async (
  id: string
) => {

  return await adminApi.get<DocumentoGetRes>(
    `${documentoReqConf.url}${id}/`
  )
}

export const atualizarDocumento = async (
  documento: Documento
) => {

  const {
    id,
    ...payload
  } = documento

  return await adminApi.put<DocumentoUpdateRes>(
    `${documentoReqConf.url}${id}/`,
    payload
  )
}

export const excluirDocumento = async (
  id: string
) => {

  return await adminApi.delete<DocumentoDeleteRes>(
    `${documentoReqConf.url}${id}/`
  )
}

export const getJobStatus = async (
  jobId: string
) => {

  return await adminApi.get<DocumentoGenerationJobRes>(
    `${jobReqConf.url}${jobId}/`
  )
}