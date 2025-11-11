<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarProjeto,
  excluirProjetos,
} from '../controllers/projeto'
import type { Projeto } from '../types/projeto'

const route = useRoute()
const ui = useUiStore()

const headers = [
  { value: 'nome', title: 'nome' },
  { value: 'descricao', title: 'descricao' }
]

const items = ref<Projeto[]>([])

const carregarProjetos = async () => {
  const projetos = await listarProjeto()
  items.value = projetos
}

const router = useRouter()

const editarProjeto = (cls: Projeto) => {
  router.push({ name: 'projeto-criar', params: { id: cls.id } })
}

const excluirprojeto = async (cls: Projeto[]) => {
  const ids = cls.map((a) => a.id)
  await excluirProjetos(ids)
  await carregarProjetos()
}

// Novo helper para excluir um único projeto com confirmação
const excluirProjetoSingle = async (proj: Projeto) => {
  const ok = confirm(`Deseja realmente excluir o projeto "${proj.nome}"?`)
  if (!ok) return
  await excluirProjetos([proj.id])
  await carregarProjetos()
}

onBeforeMount(carregarProjetos)

watch(route, (val) => console.log('Rota mudou:', val.fullPath))

</script>



<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Projetos</h1>
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="$router.push({ name: 'projeto-criar' })"
      >
        Novo Projeto
      </button>
    </div>

    <div v-if="items.length === 0" class="text-center text-gray-500 py-12">
      Nenhum projeto encontrado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link
        v-for="proj in items"
        :key="proj.id"
        :to="{ name: 'projeto-detalhe', params: { id: proj.id }}" 
        class="block group h-48"
      >

        <!-- Card do Projeto -->
        <article
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col h-full"
        >
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ proj.nome }}</h2>
          </header>

          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 overflow-hidden">
            {{ proj.descricao || 'Sem descrição' }}
          </p>
        </article>
      </router-link>
    </div>
  </div>
</template>
