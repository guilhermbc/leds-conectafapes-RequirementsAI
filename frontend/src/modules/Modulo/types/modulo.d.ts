import { Projeto } from "@/modules/Projeto/types/projeto"
import { Documento } from "@/modules/Documento/types/documento"

export type Modulo = {
  id : string
  modulo_documento: Documento[]
  nome : string
  descricao : string
  Projeto: Projeto | string
}

export type ModuloCreateReq = Pick<Modulo, "nome" | "descricao" | "Projeto">


export type ModuloListRes = {
  "@odata.context": string
  data: Modulo[]
}

export type ModuloCreateRes = {
  statusCode: number
  uri: string
  message: string
}

export type ModuloGetRes = ModuloListRes


export type ModuloUpdateRes = {
  statusCode: number
  message: string
}

export type ModuloDeleteRes = ModuloUpdateRes