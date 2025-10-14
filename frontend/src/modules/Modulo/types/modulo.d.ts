export type Modulo = {
  nome : string
descricao : string
Id : string

}

export type ModuloCreateReq = Pick<Modulo, "nome" | "descricao">


export type ModuloListRes = {
  "@odata.context": string
  value: Modulo[]
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