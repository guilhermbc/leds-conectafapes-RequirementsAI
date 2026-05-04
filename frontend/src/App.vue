<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import { useNotificationStore } from '@/stores/notification'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const notification = useNotificationStore()
const { t } = useI18n()

watch(
  () => notification.messageKey,
  (key) => {
    if (key) {
      const tipoTraduzido = t(notification.params.tipoKey)
      const versao = notification.params.versao
      const nome = `${tipoTraduzido} (${versao})`

      const mensagem = t(key, { nome })

      toast.success(mensagem)

      notification.clear()
    }
  }
)
</script>

<template>
  <Toaster richColors />
  <RouterView />
</template>