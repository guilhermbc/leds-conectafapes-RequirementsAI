import { defineStore } from 'pinia'
import { criarDocumento } from '../modules/Documento/controllers/documento'

export const useDocumentGenerationStore = defineStore('docGen', {
  state: () => ({
  isGenerating: false,
  lastCreatedId: null as string | null,
  lastCreatedData: null as any
}),

  actions: {
    async generate(data: any) {
      if (this.isGenerating) return

      this.isGenerating = true

      try {
        const response = await criarDocumento(data)

        if (response && response.data && response.data.id) { 
            this.lastCreatedId = response.data.id
            this.lastCreatedData = response.data
        }

        return response

      } finally {
        this.isGenerating = false
      }
    },

    clearLastCreated() {
      this.lastCreatedId = null
    }
  }
})