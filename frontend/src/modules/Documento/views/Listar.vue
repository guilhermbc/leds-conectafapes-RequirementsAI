<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarDocumento,
  excluirDocumentos,
} from '../controllers/documento'
import { obterModulo } from '@/modules/Modulo/controllers/modulo'
import type { Documento } from '../types/documento'

const props = defineProps<{
  moduloId?: string | number
}>()

const documentos = ref<Documento[]>([])

const carregarDocumentos = async () => {
  const modulo = await obterModulo(props.moduloId as string)
  documentos.value = modulo.modulo_documento
}

const router = useRouter()
const editarDocumento = (cls: Documento) => {
  router.push({ name: 'documento-criar', params: { id: cls.id }})
}

const excluirdocumento = async (cls: Documento[]) => {
  const ids = cls.map((a) => a.id)
  await excluirDocumentos(ids)
  await carregarDocumentos()
}

onBeforeMount(carregarDocumentos)

function capitalizarPrimeiraLetra(palavra: string): string {
  if (!palavra) {
    return ""; 
  }
  const primeiraLetra = palavra[0].toUpperCase();
  const restanteDaString = palavra.slice(1).toLowerCase();

  return primeiraLetra + restanteDaString;
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">Documentos</h1>
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer"
        @click="$router.push({ name: 'documento-criar' })"
      >
        Novo Documento
      </button>
    </div>

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
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ capitalizarPrimeiraLetra(documento.TipoDocumento) }} (v{{ documento.versao }})</h2>
          </header>
        </article>
      </router-link>
    </div>
  </div>
</template>