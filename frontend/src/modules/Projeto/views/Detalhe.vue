<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { obterProjeto } from '../controllers/projeto'
import type { Projeto } from '../types/projeto'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const projeto = ref<Projeto | null>(null)
const loading = ref(true)

const carregarProjeto = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await obterProjeto(id)
    projeto.value = data
  } catch (error) {
    ui.exibirAlerta({ message: 'Erro ao carregar projeto', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

onBeforeMount(carregarProjeto)
</script>

<template>
  <div class="p-4">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <template v-else-if="projeto">
      <div class="mb-6">
        <button
          class="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          @click="$router.back()"
        >
          ← Voltar
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ projeto.nome }}
        </h1>

        <div class="prose dark:prose-invert max-w-none">
          <p class="text-gray-600 dark:text-gray-300">
            {{ projeto.descricao || 'Sem descrição' }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>