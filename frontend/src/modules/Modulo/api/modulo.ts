/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi from '@/api/admin'
import type {
  Modulo,
  ModuloCreateReq,
  ModuloListRes,
  ModuloCreateRes,
  ModuloGetRes,
  ModuloUpdateRes,
  ModuloDeleteRes,
} from '../types/modulo.d.ts'

const moduloReqConf = {
  url: 'classes/modulo/',
}

export const listarModulo = async () => {
  return await adminApi.get<ModuloListRes>(moduloReqConf.url)
}

export const listarUltimosDocumentos = async (id: string) => {
  return await adminApi.get<ModuloGetRes>(
    `${moduloReqConf.url}get_last_docs/${id}`
  )
}

export const criarModulo = async (modulo: ModuloCreateReq) => {
  return await adminApi.post<ModuloCreateRes>(moduloReqConf.url, modulo)
}

export const obterModulo = async (id: string) => {
  return await adminApi.get<ModuloGetRes>(
    `${moduloReqConf.url}${id}/`
  )
}

export const atualizarModulo = async (modulo: Modulo) => {
  return await adminApi.put<ModuloUpdateRes>(
    `${moduloReqConf.url}${modulo.id}/`,
    modulo
  )
}

export const excluirModulo = async (id: string) => {
  return await adminApi.delete<ModuloDeleteRes>(
    `${moduloReqConf.url}${id}/`
  )
}     