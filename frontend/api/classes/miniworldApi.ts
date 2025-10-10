export class MiniworldApi {
  chatInput: string;

  constructor(
    chatInput: string
  ) {
    this.chatInput = chatInput;
  }

  public toJson() {
    return {
      chatInput: this.chatInput
    }
  }
}