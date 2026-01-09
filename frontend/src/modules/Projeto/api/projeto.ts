/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi, { adminApiConfig } from '@/api/admin'
import type {
  Projeto,
  ProjetoCreateReq,
  ProjetoListRes,
  ProjetoCreateRes,
  ProjetoGetRes,
  ProjetoUpdateRes,
  ProjetoDeleteRes,
} from '../types/projeto.d.ts'

const projetoReqConf = {
  baseURL: adminApiConfig.baseURL + 'projeto/',
  url: adminApiConfig.baseURL + 'projeto/'
}

export const listarProjeto = async () => {
  return await adminApi.get<ProjetoListRes>('/', projetoReqConf)
}

export const criarProjeto = async (projeto: ProjetoCreateReq) => {
  return await adminApi.post<ProjetoCreateRes>('/', projeto, projetoReqConf)
}

export const obterProjeto = async (id: string) => {
  return await adminApi.get<ProjetoGetRes>('/' + id, projetoReqConf)
}

export const atualizarProjeto = async (projeto: Projeto) => {
  return await adminApi.put<ProjetoUpdateRes>('/' + projeto.id + '/', projeto, projetoReqConf)
}

export const excluirProjeto = async (id: string) => {
  return await adminApi.delete<ProjetoDeleteRes>('/' + id, projetoReqConf)
}    