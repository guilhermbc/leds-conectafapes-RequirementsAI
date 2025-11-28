<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { obterModulo } from '../controllers/modulo'
import type { Modulo } from '../types/modulo'

// Importa o componente de listagem de módulos
import ListarDocumento from '../../Documento/views/Listar.vue'


const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const modulo = ref<Modulo[]>([])

const loading = ref(true)

const voltar = () => {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push({ name: 'projeto-home'})
  }
}

const carregarModulo = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    console.log('Modulo ID:', id)
    const data = await obterModulo(id)
    // Para obter o 'dado' desejado, use modulo.value.dado
    modulo.value = data
  } catch (error) {
    console.error('Error loading modulo:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar módulo', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

onBeforeMount(carregarModulo)

</script>

<template>
  <div class="w-11/12 my-auto mt-20 p-4">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="modulo">
      <div class="mb-6">
        <button 
          class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
          @click="voltar"
        >
          ← Voltar
        </button>
      </div>

      <!-- Nome -->
      <div class="flex items-center justify-between mb-4">
      <h1 class="text-3xl font-semibold text-gray-800"> {{ modulo.nome }}</h1>
      </div>

      <!-- Descrição -->
      <div class="flex items-center justify-between mb-4">
      <p class="text-gray-500 dark:text-gray-500 leading-relaxed"> {{ modulo.descricao }}</p>
      </div>

      <!-- Listagem dos documentos do módulo -->
      <div>
        <ListarDocumento :modulo-id="modulo.id" />
      </div>
    </div>
  </div>
</template>