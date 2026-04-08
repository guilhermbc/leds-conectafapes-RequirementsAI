import { Modulo } from "@/modules/Modulo/types/modulo"

export type Documento = {
  id? : string
  vMajor : number
  vMinor : number
  geradoIA : boolean
  arquivo : string
  arquivoAudio: File | null
  TipoDocumento: string
  DocumentoAnterior: Documento | int
  Modulo: Modulo | string
  DocumentoOrigem: Documento | int
}

export type DocumentoCreateReq = Pick<Documento, 
                                      "vMajor"
                                      | "vMinor"
                                      | "arquivo"
                                      | "geradoIA"
                                      | "arquivoAudio"
                                      | "TipoDocumento"
                                      | "DocumentoAnterior"
                                      | "Modulo"
                                      | "DocumentoOrigem"
                                      >


export type DocumentoListRes = {
  "@odata.context": string
  data: Documento[]
}

export type DocumentoCreateRes = {
  data : Documento
  status: number
  uri: string
  statusText: string
}

export type DocumentoGetRes = DocumentoListRes


export type DocumentoUpdateRes = {
  statusCode: number
  message: string
}

export type DocumentoDeleteRes = DocumentoUpdateRes