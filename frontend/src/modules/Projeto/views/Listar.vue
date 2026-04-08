<script setup lang="ts">
import { ref, onBeforeMount} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  listarProjeto,
} from '../controllers/projeto'
import Criar from './Criar.vue'
import type { Projeto } from '../types/projeto'

const { locale } = useI18n()

const items = ref<Projeto[]>([])

const carregarProjetos = async () => {
  const projetos = await listarProjeto()
  items.value = projetos
}

const mostrarModal = ref(false)

function abrirModal(){
  mostrarModal.value = true
}

onBeforeMount(carregarProjetos)

</script>


<template>
  <div class="w-11/12 my-auto mt-20 p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">{{ $t('project.title') }}</h1>
      <button
        class="min-w-[170px] h-[45px] bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="abrirModal()"
      >
        {{ $t('project.new') }}
      </button>

      <!-- Modal -->
      <Criar v-model="mostrarModal" @salvo="carregarProjetos" />

    </div>

    <div v-if="items.length === 0" class="text-center text-gray-500 py-12">
      {{ $t('project.none') }}
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
            {{ proj.descricao || $t('project.noDescription') }}
          </p>
        </article>
      </router-link>
    </div>
  </div>
</template>
