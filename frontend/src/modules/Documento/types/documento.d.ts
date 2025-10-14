export type Documento = {
  versao : string
arquivo : string
Id : string

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