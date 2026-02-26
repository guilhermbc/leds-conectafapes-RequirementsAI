/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi from '@/api/admin'
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
  url: 'classes/projeto/',
}

export const listarProjeto = async () => {
  return await adminApi.get<ProjetoListRes>(projetoReqConf.url)
}

export const criarProjeto = async (projeto: ProjetoCreateReq) => {
  return await adminApi.post<ProjetoCreateRes>(
    projetoReqConf.url,
    projeto
  )
}

export const obterProjeto = async (id: string) => {
  return await adminApi.get<ProjetoGetRes>(
    `${projetoReqConf.url}${id}/`
  )
}

export const atualizarProjeto = async (projeto: Projeto) => {
  return await adminApi.put<ProjetoUpdateRes>(
    `${projetoReqConf.url}${projeto.id}/`,
    projeto
  )
}

export const excluirProjeto = async (id: string) => {
  return await adminApi.delete<ProjetoDeleteRes>(
    `${projetoReqConf.url}${id}/`
  )
}  