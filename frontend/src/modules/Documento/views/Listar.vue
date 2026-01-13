<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import Criar from './Criar.vue'
import { obterModulo, listarUltimosDocumentos } from '@/modules/Modulo/controllers/modulo'
import type { Documento } from '../types/documento'
import { formatarTipoDocumento, formatarVersao } from '@/utils/formatacoesDocumentos'

const props = defineProps<{
  moduloId?: string | number
}>()

const documentos = ref<Documento[]>([])
const ultimosDocumentos = ref<Documento[]>([])

const carregarDocumentos = async () => {
  const modulo = await obterModulo(props.moduloId as string)
  const ultimosDocs = await listarUltimosDocumentos(props.moduloId as string)

  ultimosDocumentos.value = ultimosDocs  
  documentos.value = modulo.modulo_documento
}

// const excluirdocumento = async (cls: Documento[]) => {
//   const ids = cls.map((a) => a.id)
//   await excluirDocumentos(ids)
//   await carregarDocumentos()
// }

const mostrarModal = ref(false)

onBeforeMount(carregarDocumentos)

function abrirModal(){
  mostrarModal.value = true
}

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Últimos Documentos</h1>
      <button
        class="w-[170px] h-[45px] bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="abrirModal()"
      >
        Novo Documento
      </button>

      <!-- Modal -->
      <Criar v-model="mostrarModal" @salvo="carregarDocumentos" :moduloId="moduloId"/>
    </div>

    <!-- Últimos Documentos -->
    <div v-if="ultimosDocumentos.length === 0" class="text-center text-gray-500 py-12">
      Nenhum documento encontrado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link
        v-for="documento in ultimosDocumentos"
        :key="documento.id"
        :to="{ name: 'documento-detalhe', params: { id: documento.id }}"
        class="block group h-48"
      >
        <article
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col h-full"
        >
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ formatarTipoDocumento(documento.TipoDocumento) }} (v{{formatarVersao(documento.vMajor, documento.vMinor)  }})</h2>
          </header>
        </article>
      </router-link>
    </div>

    <hr class="my-6 border-gray-400" />

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Documentos</h1>
    </div>

    <!-- Todos os Documentos -->
    <div v-if="documentos.length === 0" class="text-center text-gray-500 py-12">
      Nenhum documento encontrado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link
        v-for="documento in documentos"
        :key="documento.id"
        :to="{ name: 'documento-detalhe', params: { id: documento.id }}"
        class="block group h-48"
      >
        <article
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col h-full"
        >
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ formatarTipoDocumento(documento.TipoDocumento) }} (v{{formatarVersao(documento.vMajor, documento.vMinor)  }})</h2>
          </header>
        </article>
      </router-link>
    </div>
  </div>
</template>