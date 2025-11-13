<script setup lang="ts">
import VMdEditor from '@kangc/v-md-editor'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import Prism from 'prismjs'
import { ref, onBeforeMount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { obterDocumento } from '../controllers/documento'
import type { Documento } from '../types/documento'

// Importa o componente de listagem de módulos
import ListarDocumento from '../../Documento/views/Listar.vue'

// Configura o editor Markdown
VMdEditor.use(githubTheme, { Prism })

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const documento = ref<Documento[]>([])

const loading = ref(true)

const voltar = () => {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push({ name: 'projeto-home'})
  }
}

/*
onMounted(async () => {
  const id = route.params.id
  try {
    // Aqui você faria a requisição ao backend
    const response = await fetch(`/api/documentos/${id}`)
    documento.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar documento:', error)
  } finally {
    loading.value = false
  }
})
*/

const carregarDocumento = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await obterDocumento(id)
    // Para obter o 'dado' desejado, use documento.value.dado
    documento.value = data
    console.log(documento.value)
  } catch (error) {
    console.error('Error loading documento:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar documento', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

onBeforeMount(carregarDocumento)

watch(
  () => route.params.id,
  () => {
    carregarDocumento()
  }
)

function capitalizarPrimeiraLetra(palavra: string): string {
  if (!palavra) {
    return ""; 
  }
  const primeiraLetra = palavra[0].toUpperCase();
  const restanteDaString = palavra.slice(1).toLowerCase();

  return primeiraLetra + restanteDaString;
}

</script>

<style scoped>
audio {
  border-radius: 8px;
  background-color: #f8f9fa;
}
</style>

<template>
  <div class="p-6">
    <!-- Botão de voltar -->
    <div class="mb-6">
      <button
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
        @click="voltar"
      >
        ← Voltar
      </button>
    </div>

    <!-- Carregando -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Conteúdo -->
    <div v-else-if="documento">
      <!-- Título -->
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">
        {{ capitalizarPrimeiraLetra(documento.TipoDocumento)}} (v{{ documento.versao }})
      </h1>

      <!-- Origem de Áudio (somente se tipo = MINIMUNDO) -->
      <!-- <div v-if="documento.TipoDocumento === 'MINIMUNDO'" class="mb-4"> -->
        <!-- <p class="text-gray-600 font-medium mb-1">Áudio de Origem:</p> -->
        <!-- <audio v-if="documento.origemAudio" :src="documento.origemAudio" controls class="w-full" /> -->
        <!-- <p v-else class="text-gray-500 italic">Sem áudio associado.</p> -->
      <!-- </div> -->

      <!-- Documento Origem -->
      <div v-if="documento.DocumentoOrigem?.length" class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Documentos de Origem:</p>
        <ul class="list-disc ml-6 text-blue-600">
          <li v-for="origem in documento.DocumentoOrigem" :key="origem.id">
            <RouterLink :to="`/Documento/${origem.id}`" class="hover:underline">
              {{ capitalizarPrimeiraLetra(origem.TipoDocumento) }} (v{{ origem.versao }})
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Documento Anterior -->
      <div v-if="documento.DocumentoAnterior" class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Versão Anterior:</p>
        <RouterLink
          :to="`/Documento/${documento.DocumentoAnterior.id}`"
          class="text-blue-600 hover:underline"
        >
          {{ documento.DocumentoAnterior.TipoDocumento }} {{ documento.DocumentoAnterior.versao }}
        </RouterLink>
      </div>

      <!-- Documento Seguinte (obviamente está errado, a ser feito ainda)-->
      <div v-if="documento.documentoSeguinte" class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Nova Versão:</p>
        <RouterLink
          :to="`/Documento/${documento.documentoSeguinte.id}`"
          class="text-blue-600 hover:underline"
        >
          {{ documento.documentoSeguinte.tipoDocumento }} {{ documento.documentoSeguinte.versao }}
        </RouterLink>
      </div>

      <!-- Editor Markdown -->
      <div class="w-[900px] mx-auto">
        <p class="text-gray-600 font-medium mb-2">Conteúdo do Documento:</p>
        <v-md-editor
          v-model="documento.arquivo"
          mode="preview"
          height="500px"
        />
      </div>
    </div>

    <!-- Erro ou documento não encontrado -->
    <div v-else class="text-gray-500 italic">Documento não encontrado.</div>
  </div>
</template>