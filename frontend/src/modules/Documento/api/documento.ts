/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi, { adminApiConfig } from '@/api/admin'
import type {
  Documento,
  DocumentoCreateReq,
  DocumentoListRes,
  DocumentoCreateRes,
  DocumentoGetRes,
  DocumentoUpdateRes,
  DocumentoDeleteRes,
} from '../types/documento.d.ts'

const documentoReqConf = {
  baseURL: adminApiConfig.baseURL + 'documento',
}

export const listarDocumento = async () => {
  return await adminApi.get<DocumentoListRes>('/', documentoReqConf)
}

export const criarDocumento = async (documento: DocumentoCreateReq) => {
  return await adminApi.post<DocumentoCreateRes>('/', documento, documentoReqConf)
}

export const obterDocumento = async (id: string) => {
  return await adminApi.get<DocumentoGetRes>('/' + id, documentoReqConf)
}

export const atualizarDocumento = async (documento: Documento) => {
  const { id, ...payload } = documento; // remove o id

  return await adminApi.put<DocumentoUpdateRes>('/' + id + '/', payload, documentoReqConf)
}

export const excluirDocumento = async (id: string) => {
  return await adminApi.delete<DocumentoDeleteRes>('/' + id + '/', documentoReqConf)
}    