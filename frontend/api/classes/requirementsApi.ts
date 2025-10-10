export class RequirementsApi {
  minimundo: string;
  requisitos_anteriores: string;

  constructor(
    minimundo: string,
    requisitos_anteriores: string
  ) {
    this.minimundo = minimundo;
    this.requisitos_anteriores = requisitos_anteriores;
  }

  public toJson() {
    return {
      minimundo: this.minimundo,
      requisitos_anteriores: this.requisitos_anteriores,
    }
  }
}