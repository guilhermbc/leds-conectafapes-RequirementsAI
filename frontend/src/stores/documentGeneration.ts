import { defineStore } from 'pinia'
import { criarDocumento , getJobStatus, obterDocumento} from '../modules/Documento/controllers/documento'

export const useDocumentGenerationStore =
defineStore('docGen', {

  state: () => ({
    isGenerating: false,
    currentJobId: null as string | null,
    currentJobStatus: null as string | null,
    currentJobProgress: 0,
    lastCreatedId: null as string | null,
    lastCreatedData: null as any,
    pollingInterval: null as any,
    error: null as string | null,
  }),

  actions: {
    async generate(data: any) {
      if (this.isGenerating) return
      this.isGenerating = true
      this.error = null
      this.currentJobStatus = 'PENDING'
      this.currentJobProgress = 0

      try {
        const response = await criarDocumento(data)
        if (!response) {
          throw new Error('Erro ao gerar documento')
        }

        if (!('job_id' in response.data)) {
          throw new Error('Resposta não contém job_id')
        }

        const jobId = response.data.job_id
        this.currentJobId = jobId
        await this.pollJob(jobId)

        return response

      } catch (err: any) {
        this.error = err?.message || 'Erro ao gerar documento'
        this.isGenerating = false

        throw err
      }
    },

    async pollJob(jobId: string) {
      return new Promise((resolve, reject) => {

        this.pollingInterval = setInterval(
          async () => {

            try {
              const job = await getJobStatus(jobId)

              this.currentJobStatus = job.status
              this.currentJobProgress = job.progress || 0

              if (job.status === 'SUCCESS') {
                clearInterval(this.pollingInterval)
                if (!job.documento_id) {
                    this.isGenerating = false
                    reject(
                        new Error(
                            'Job finalizado sem documento associado.'
                        )
                    )
                    return
                }

                const documento = await obterDocumento(job.documento_id)
                
                this.lastCreatedData = documento
                this.lastCreatedId = documento.id || null
                this.isGenerating = false
                
                resolve(documento)
            }

              if (job.status === 'FAILED') {
                clearInterval(this.pollingInterval)
                this.error = job.error || 'Erro na geração'
                this.isGenerating = false

                reject(job.error)
              }

            } catch (err) {
              clearInterval(this.pollingInterval)
              this.isGenerating = false

              reject(err)
            }
          },
          2000
        )
      })
    },

    clearLastCreated() {
      this.lastCreatedId = null
      this.lastCreatedData = null
    },

    clearJob() {
      this.currentJobId = null
      this.currentJobStatus = null
      this.currentJobProgress = 0
      this.error = null
    }
  }
})