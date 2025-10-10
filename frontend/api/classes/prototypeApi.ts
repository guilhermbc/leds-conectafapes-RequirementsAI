export class InterfaceprototypeApi {
  descricao_caso_uso: string
  diagrama_classes: string

  constructor(
    descricao_caso_uso: string,
    diagrama_classes: string
  ) {
    this.descricao_caso_uso = descricao_caso_uso
    this.diagrama_classes = diagrama_classes
  }

  public toJson() {
    return {
      descricao_caso_uso: this.descricao_caso_uso,
      diagrama_classes: this.diagrama_classes,
    }
  }
}