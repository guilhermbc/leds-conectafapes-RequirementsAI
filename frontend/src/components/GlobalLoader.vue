<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const loading = useLoadingStore()
const { ativo, mensagem } = storeToRefs(loading)

const { t } = useI18n()
</script>

<template>
  <div
    v-if="ativo"
    class="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 
           bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg"
  >
    <!-- Spinner -->
    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

    <!-- Texto -->
    <span class="text-sm">
      {{ t(mensagem) }}
    </span>
  </div>
</template>