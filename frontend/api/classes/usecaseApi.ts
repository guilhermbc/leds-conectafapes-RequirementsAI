export class UsecaseApi {
  minimundo: string
  requisitos: string
  casosdeuso_anteriores: string
  info_casosdeuso: string

  constructor(
    minimundo: string,
    requisitos: string,
    casosdeuso_anteriores: string,
    info_casosdeuso: string
  ) {
    this.minimundo = minimundo
    this.requisitos = requisitos
    this.casosdeuso_anteriores = casosdeuso_anteriores
    this.info_casosdeuso = info_casosdeuso
  }

  public toJson() {
    return {
      minimundo: this.minimundo,
      requisitos: this.requisitos,
      casosdeuso_anteriores: this.casosdeuso_anteriores,
      info_casosdeuso: this.info_casosdeuso,
    }
  }
}