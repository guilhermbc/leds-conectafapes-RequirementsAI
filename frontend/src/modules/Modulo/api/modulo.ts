/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi, { adminApiConfig } from '@/api/admin'
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
  baseURL: adminApiConfig.baseURL + 'modulo',
}

export const listarModulo = async () => {
  return await adminApi.get<ModuloListRes>('/', moduloReqConf)
}

export const criarModulo = async (modulo: ModuloCreateReq) => {
  return await adminApi.post<ModuloCreateRes>('/', modulo, moduloReqConf)
}

export const obterModulo = async (id: string) => {
  const { data } = await adminApi.get<ModuloGetRes>('/' + id, moduloReqConf)
  return data.value[0]
}

export const atualizarModulo = async (modulo: Modulo) => {
  return await adminApi.put<ModuloUpdateRes>('/' + modulo.id, modulo, moduloReqConf)
}

export const excluirModulo = async (id: string) => {
  return await adminApi.delete<ModuloDeleteRes>('/' + id, moduloReqConf)
}    