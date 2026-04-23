<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import Criar from './Criar.vue'
import type { Modulo } from '../types/modulo'
import { obterProjeto } from '@/modules/Projeto/controllers/projeto'

const props = defineProps<{
  projetoId: string | number
}>()

const modulos = ref<Modulo[]>([])

const carregarModulos = async () => {
  const projeto = await obterProjeto(props.projetoId as string)
  modulos.value = projeto.projeto_modulo
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
      <h1 class="text-2xl font-semibold text-gray-800">{{ $t('module.title') }}</h1>
      <button
        class="min-w-[170px] h-[45px] bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="abrirModal()"
      >
        {{ $t('module.new') }}
      </button>

      <!-- Modal -->
      <Criar v-model="mostrarModal" @salvo="carregarModulos" :projetoId="projetoId"/>

    </div>

    <div v-if="modulos.length === 0" class="text-center text-gray-500 py-12">
      {{ $t('module.none') }}
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
            {{ modulo.descricao || $t('module.noDescription') }}
          </p>
        </article>
      </router-link>
    </div>
  </div>
</template>