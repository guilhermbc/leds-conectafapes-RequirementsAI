import { Modulo } from "@/modules/Modulo/types/modulo"

export type Documento = {
  id? : string
  versao : string
  geradoIA : boolean
  arquivo : string
  origemAudio: string
  TipoDocumento: string
  DocumentoAnterior: Documento | int
  Modulo: Modulo | string
  DocumentoOrigem: Documento | int
}

export type DocumentoCreateReq = Pick<Documento, 
                                      "versao"
                                      | "arquivo"
                                      | "geradoIA"
                                      | "origemAudio"
                                      | "TipoDocumento"
                                      | "DocumentoAnterior"
                                      | "Modulo"
                                      | "DocumentoOrigem"
                                      >


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