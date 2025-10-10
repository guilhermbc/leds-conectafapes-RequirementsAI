export class RevisionApi {
  requisitos: string
  descricao_caso_uso: string
  diagrama_classes: string

  constructor(
    requisitos: string,
    descricao_caso_uso: string,
    diagrama_classes: string,
  ) {
    this.requisitos = requisitos
    this.descricao_caso_uso = descricao_caso_uso
    this.diagrama_classes = diagrama_classes
  }

  public toJson() {
    return {
      requisitos: this.requisitos,
      descricao_caso_uso: this.descricao_caso_uso,
      diagrama_classes: this.diagrama_classes,
    }
  }
}