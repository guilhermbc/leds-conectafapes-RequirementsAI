<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()

const sair = async () => {
  await auth.logout()
}

const ui = useUiStore()
const tooltipBarra = computed(() => {
  if (ui.mostrarBarraLateral) {
    return 'Esconder barra lateral'
  }
  return 'Mostrar barra lateral'
})
</script>

<template>
  
</template>