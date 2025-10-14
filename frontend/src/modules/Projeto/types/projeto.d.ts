export type Projeto = {
  nome : string
descricao : string
Id : string

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