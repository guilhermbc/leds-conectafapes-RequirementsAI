import { Modulo } from "@/modules/Modulo/types/modulo"

export type Projeto = {
  id : string
  projeto_modulo :  Modulo[]
  nome : string
  descricao : string
}

export type ProjetoCreateReq = Pick<Projeto, "nome" | "descricao">


export type ProjetoListRes = {
  "@odata.context": string
  value: Projeto[]
}

export type ProjetoCreateRes = {
  statusCode: number
  uri: string
  message: string
}

export type ProjetoGetRes = ProjetoListRes


export type ProjetoUpdateRes = {
  statusCode: number
  message: string
}

export type ProjetoDeleteRes = ProjetoUpdateRes