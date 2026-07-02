<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { obterModulo } from '../controllers/modulo'
import type { Projeto } from '../../Projeto/types/projeto'
import type { Modulo } from '../types/modulo'
import ListarDocumento from '../../Documento/views/Listar.vue'
import Criar from './Criar.vue'
import Excluir from './Excluir.vue'


const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const projeto = ref<Projeto | null>(null)
const modulo = ref<Modulo | null>(null)

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
    const data = await obterModulo(id)
    // Para obter o 'dado' desejado, use modulo.value.dado
    modulo.value = Array.isArray(data) ? data[0] : data
    projeto.value = typeof modulo.value?.Projeto === 'string' ? null : modulo.value?.Projeto as Projeto

  } catch (error) {
    console.error('Error loading modulo:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar módulo', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    carregarModulo()
  }
})

const mostrarModalEditar = ref(false)
const mostrarModalExcluir = ref(false)

function abrirModalEditar(){
  mostrarModalEditar.value = true
}

function abrirModalExcluir(){
  mostrarModalExcluir.value = true
}

const handleExcluido = () => {
  router.back()
}

onBeforeMount(carregarModulo)

</script>

<template>
  <div class="w-11/12 my-auto mt-20 p-4">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="modulo">
      <!-- Breadcrumbs -->
      <div class="text-lg text-gray-800 mb-5">
        <router-link 
          to="/Projeto/home"
          class="hover:text-blue-600 hover:underline"
        >
          Home
        </router-link>

        >
          
        <router-link 
          :to="`/Projeto/${projeto?.id}`"
          class="hover:text-blue-600 hover:underline"
        >
          {{ projeto?.nome }}
        </router-link>

        >
          
        <router-link 
        :to="`/Modulo/${modulo.id}`"
          class="hover:text-blue-600 hover:underline"
        >
          {{ modulo.nome }}
        </router-link>
      </div>

      <div class="flex items-start mb-6 w-full">
        
        <!-- Botão voltar -->
        <button 
          class="h-[45px] px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
          @click="voltar"
        >
        {{ $t('navigation.back') }}
        </button>

        <div class="ml-auto grid grid-cols-2 gap-3 h-[45px]">
          <!-- Botão de Editar -->
          <button
            class="px-4 py-2 border border-gray-700 bg-white text-gray-700 rounded-md
                  hover:bg-gray-700 hover:text-white transition cursor-pointer"
            @click="abrirModalEditar()"
          >
            {{ $t('module.edit') }}
          </button>

          <!-- Botão de Excluir -->
          <button
            class="px-4 py-2 border rounded-md text-white bg-red-700 
            hover:bg-red-800 transition cursor-pointer"
            @click="abrirModalExcluir()"
          >
            {{ $t('module.delete') }}
          </button>
        </div>

        <!-- Editar Módulo (usa a mesma página de Criar) -->
        <Criar v-model="mostrarModalEditar" @salvo="carregarModulo" :modulo="modulo"/>

        <Excluir v-model="mostrarModalExcluir" @excluido="handleExcluido" :modulo="modulo"/>
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