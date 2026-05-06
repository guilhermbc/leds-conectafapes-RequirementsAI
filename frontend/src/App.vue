<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import { useNotificationStore } from '@/stores/notification'
import { useDocumentGenerationStore } from '@/stores/documentGeneration'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import GlobalLoader from '@/components/GlobalLoader.vue'

import { formatarTipoDocumento, formatarVersao } from '@/utils/formatacoesDocumentos'

const notification = useNotificationStore()
const docGen = useDocumentGenerationStore()

const { t } = useI18n()
const router = useRouter()

// Notificações genéricas
watch(
  () => notification.messageKey,
  (key) => {
    if (!key) return

    const tipoTraduzido = t(notification.params.tipoKey)
    const versao = notification.params.versao
    const nome = `${tipoTraduzido} (${versao})`

    const mensagem = t(key, { nome })
    const id = notification.params.id

    toast.success(mensagem, {
      duration: 6000,
      closeButton: true,
      action: {
        label: t('document.notification.open'),
        onClick: () => {
          router.push({ name: 'documento-detalhe', params: { id } })
        }
      },
    })

    notification.clear()
  }
)

// Notificação automática quando documento é gerado
watch(
  () => docGen.lastCreatedId,
  (id) => {
    if (!id || !docGen.lastCreatedData) return

    const data = docGen.lastCreatedData

    const tipo = t(formatarTipoDocumento(data.TipoDocumento))
    const versao = formatarVersao(data.vMajor, data.vMinor)
    const nome = `${tipo} (${versao})`

    const mensagem = t('document.notification.created', { nome })

    toast.success(mensagem, {
      duration: 6000,
      closeButton: true,
      action: {
        label: t('document.notification.open'),
        onClick: () => {
          router.push({ name: 'documento-detalhe', params: { id } })
        }
      },
    })
  }
)
</script>

<template>
  <Toaster richColors />
  <GlobalLoader />
  <RouterView />
</template>