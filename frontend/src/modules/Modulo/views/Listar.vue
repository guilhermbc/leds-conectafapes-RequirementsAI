<script setup lang="ts">
import { ref, onBeforeMount, watch, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import {
  excluirModulos,
} from '../controllers/modulo'
import Criar from './Criar.vue'
import type { Modulo } from '../types/modulo'
import { obterProjeto } from '@/modules/Projeto/controllers/projeto'

const props = defineProps<{
  projetoId: string | number
}>()

const router = useRouter()

const modulos = ref<Modulo[]>([])

const carregarModulos = async () => {
  const projeto = await obterProjeto(props.projetoId as string)
  modulos.value = projeto.projeto_modulo
}

const editarModulo = (cls: Modulo) => {
  router.push({ name: 'modulo-criar', params: { id: cls.id }})
}

const excluirmodulo = async (cls: Modulo[]) => {
  const ids = cls.map((a) => a.id)
  await excluirModulos(ids)
  await carregarModulos()
}

const mostrarModal = ref(false)

function abrirModal(){
  mostrarModal.value = true
}

onBeforeMount(carregarModulos)
watch(() => props.projetoId, carregarModulos)

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Módulos</h1>
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="abrirModal()"
      >
        Novo Módulo
      </button>

      <!-- Modal -->
      <Criar v-model="mostrarModal" @salvo="carregarModulos" :projetoId="projetoId"/>

    </div>

    <div v-if="modulos.length === 0" class="text-center text-gray-500 py-12">
      Nenhum módulo encontrado.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link
        v-for="modulo in modulos"
        :key="modulo.id"
        :to="{ name: 'modulo-detalhe', params: { id: modulo.id }}"
        class="block group h-48"
      >
        <article
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col h-full"
        >
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ modulo.nome }}</h2>
          </header>
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 overflow-hidden">
            {{ modulo.descricao || 'Sem descrição' }}
          </p>
        </article>
      </router-link>
    </div>
  </div>
</template>