export class classdiagramApi {
  minimundo: string
  requisitos: string
  tabela_caso_uso: string
  descricao_caso_uso: string
  old_cd: string
  cd_instruction: string

  constructor(
    minimundo: string,
    requisitos: string,
    tabela_caso_uso: string,
    descricao_caso_uso: string,
    old_cd: string,
    cd_instruction: string
  ) {
    this.minimundo = minimundo
    this.requisitos = requisitos
    this.tabela_caso_uso = tabela_caso_uso
    this.descricao_caso_uso = descricao_caso_uso
    this.old_cd = old_cd
    this.cd_instruction = cd_instruction
  }

  public toJson() {
    return {
      minimundo: this.minimundo,
      requisitos: this.requisitos,
      tabela_caso_uso: this.tabela_caso_uso,
      descricao_caso_uso: this.descricao_caso_uso,
      old_cd: this.old_cd,
      cd_instruction: this.cd_instruction,
    }
  }
}