import { defineStore } from 'pinia'
import { criarDocumento , getJobStatus, obterDocumento} from '../modules/Documento/controllers/documento'
import type { Documento } from '@/modules/Documento/types/documento'

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
    async generate(data: any): Promise<Documento> {
      if (this.isGenerating) throw new Error('Generation already in progress')
      this.isGenerating = true
      this.error = null
      this.currentJobStatus = 'PENDING'
      this.currentJobProgress = 0

      try {
        const response = await criarDocumento(data)
        if (!response) {
          throw new Error('Erro ao gerar documento')
        }

        // Resposta síncrona: já recebi o Documento
        if ("id" in response.data) {
          this.lastCreatedData = response.data
          this.lastCreatedId = response.data.id ?? null
          this.isGenerating = false

          return response.data
        }

        // Resposta assíncrona: preciso esperar o Job
        if ("job_id" in response.data) {
          this.currentJobId = response.data.job_id

          const documento = await this.pollJob(response.data.job_id)

          this.isGenerating = false
          return documento
        }

        throw new Error("Resposta inválida da API.")

      } catch (err: any) {
        this.error = err?.message || 'Erro ao gerar documento'

        throw err
      } finally {
        this.isGenerating = false
      }
    },

    async pollJob(jobId: string): Promise<Documento> {
      return new Promise<Documento>((resolve, reject) => {

        this.pollingInterval = setInterval(
          async () => {

            try {
              const job = await getJobStatus(jobId)

              this.currentJobStatus = job.status
              this.currentJobProgress = job.progress || 0

              if (job.status === 'SUCCESS') {
                clearInterval(this.pollingInterval)
                if (!job.documento_id) {
                    reject(
                        new Error(
                            'Job finalizado sem documento associado.'
                        )
                    )
                    return
                }

                const documento = await obterDocumento(job.documento_id) as Documento
                
                console.log('Documento gerado:', documento)
                
                this.lastCreatedData = documento
                this.lastCreatedId = documento.id || null

                resolve(documento)
            }

              if (job.status === 'FAILED') {
                clearInterval(this.pollingInterval)
                this.error = job.error || 'Erro na geração'

                reject(job.error)
              }

            } catch (err) {
              clearInterval(this.pollingInterval)

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