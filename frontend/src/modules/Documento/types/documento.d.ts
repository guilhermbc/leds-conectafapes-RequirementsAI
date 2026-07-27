import { Modulo } from "@/modules/Modulo/types/modulo"

export type Documento = {
  id?: string
  vMajor: number
  vMinor: number
  geradoIA: boolean
  vMaisRecente: boolean
  parUC_CD: Documento | null
  obsoleto: boolean
  arquivo: string
  arquivoAudio: File | null
  TipoDocumento: string
  DocumentoAnterior: Documento | null
  Modulo: Modulo | string
  DocumentoOrigem: Array<Documento>
}

export type DocumentoCreateReq = Pick<
  Documento,
    | "vMajor"
    | "vMinor"
    | "arquivo"
    | "geradoIA"
    | "vMaisRecente"
    | "parUC_CD"
    | "obsoleto"
    | "arquivoAudio"
    | "TipoDocumento"
    | "DocumentoAnterior"
    | "Modulo"
    | "DocumentoOrigem"
>

export interface DocumentoGenerationJob {
  id: string
  status:
    | "PENDING"
    | "RUNNING"
    | "SUCCESS"
    | "FAILED"
  progress: number
  documento_id?: string
  error?: string | null
}

export type DocumentoGenerationJobRes = {
  data: DocumentoGenerationJob
}

export type DocumentoAsyncCreateData = {
  job_id: string
  status:
    | "PENDING"
    | "RUNNING"
}

export type DocumentoCreateRes = {
  data: Documento | DocumentoAsyncCreateData
  status: number
  uri: string
  statusText: string
}

export type DocumentoListRes = {
  "@odata.context": string
  data: Documento[]
}

export type DocumentoGetRes = DocumentoListRes

export type DocumentoUpdateRes = {
  statusCode: number
  message: string
}

export type DocumentoDeleteRes = DocumentoUpdateRes