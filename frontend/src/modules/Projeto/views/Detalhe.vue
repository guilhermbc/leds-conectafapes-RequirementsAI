<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { obterProjeto } from '../controllers/projeto'
import type { Projeto } from '../types/projeto'

// Importa o componente de listagem de módulos
import ListarModulo from '../../Modulo/views/Listar.vue'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const projeto = ref<Projeto[]>([])

const loading = ref(true)

const voltar = () => {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push({ name: 'projeto-home'})
  }
}

const carregarProjeto = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await obterProjeto(id)
    // Para obter o 'dado' desejado, use projeto.value.dado
    projeto.value = data
  } catch (error) {
    console.error('Error loading project:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar projeto', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

// Add route watcher to handle navigation changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('Route param changed, reloading project:', newId)
    carregarProjeto()
  }
})

onBeforeMount(carregarProjeto)
</script>

<template>
  <div class="w-11/12 my-auto mt-6 p-4">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="projeto">
      <div class="mb-6">
        <button 
          class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
          @click="voltar"
        >
          ← Voltar
        </button>
      </div>

      <div class="flex items-center justify-between mb-4">
      <h1 class="text-3xl font-semibold text-gray-800"> {{ projeto.nome }}</h1>
      </div>

      <!-- Descrição -->
      <div class="flex items-center justify-between mb-4">
      <p class="text-gray-500 dark:text-gray-500 leading-relaxed"> {{ projeto.descricao }}</p>
      </div>
      
      <!-- Listagem dos módulos do projeto -->
      <div>
        <ListarModulo :projeto-id="projeto.id" />
      </div>
    </div>
  </div>
</template>