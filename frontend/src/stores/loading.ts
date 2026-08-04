import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    ativo: false,
    mensagem: '' as string
  }),

  actions: {
    start(msg: string) {
      this.ativo = true
      this.mensagem = msg
    },

    stop() {
      this.ativo = false
      this.mensagem = ''
    }
  }
})