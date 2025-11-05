import { Modulo } from "@/modules/Modulo/types/modulo"

export type Documento = {
  id : string
  versao : string
  arquivo : string
  origemAudio: string
  TipoDocumento: string
  DocumentoAnterior: Documento | int
  Modulo: Modulo 
  DocumentoOrigem: Documento | int
}

export type DocumentoCreateReq = Pick<Documento, "versao" | "arquivo">


export type DocumentoListRes = {
  "@odata.context": string
  value: Documento[]
}

export type DocumentoCreateRes = {
  statusCode: number
  uri: string
  message: string
}

export type DocumentoGetRes = DocumentoListRes


export type DocumentoUpdateRes = {
  statusCode: number
  message: string
}

export type DocumentoDeleteRes = DocumentoUpdateRes