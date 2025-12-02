<script setup lang="ts">
import VMdEditor from '@kangc/v-md-editor'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import Prism from 'prismjs'
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { listarDocumento, obterDocumento } from '../controllers/documento'
import type { Documento } from '../types/documento'
import NovaVersao from './NovaVersaoIA.vue'
import Editar from './NovaVersaoManual.vue'
import { formatarTipoDocumento } from '@/utils/formatacoesDocumentos';

// Configura o editor Markdown
VMdEditor.use(githubTheme, { Prism })

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const documentoId = ref(route.params.id as string)
const documento = ref<Documento[]>([])
const documentosSeguintes = ref<Documento[]>([])

const loading = ref(true)

const voltar = () => {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push({ name: 'projeto-home'})
  }
}

const carregarDocumento = async () => {
  try {
    loading.value = true
    documentoId.value = route.params.id as string
    const data = await obterDocumento(documentoId.value)
    // Para obter o 'dado' desejado, use documento.value.dado
    documento.value = data
  } catch (error) {
    console.error('Error loading documento:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar documento', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

const carregarDocumentosSeguintes = async () => {
  try {
    documentoId.value = route.params.id as string
    const documentosData = await listarDocumento()
    documentosSeguintes.value = []
    // Lista de documentos seguintes
    for (const doc of documentosData){
      if (String(doc.DocumentoAnterior?.id) === documentoId.value && String(doc.id) !== documentoId.value) {
        documentosSeguintes.value.push(doc)
      }
    }
  }
  catch (error){
    console.error('Error loading documentos seguintes:', error)
    ui.exibirAlerta({ message: 'Erro ao carregar documentos', color: 'error' })
    router.push({ name: 'projeto-home' })
  } finally {
    loading.value = false
  }
}

onBeforeMount(
  () => {
    carregarDocumento()
    carregarDocumentosSeguintes()
  }
)

watch(
  () => route.params.id,
  () => {
    carregarDocumento()
    carregarDocumentosSeguintes()
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

const mostrarModalEditar = ref(false)

function abrirModalEditar(){
  mostrarModalEditar.value = true
}

// Mostrar modal nova versão
const mostrarModalNV = ref(false)

function abrirModalNV(){
  mostrarModalNV.value = true
}

function baixarMarkdown() {
  if (!documento.value || !documento.value.arquivo) {
    console.error("Nenhum conteúdo encontrado para download.");
    return;
  }

  // Formatar nome do tipo de documento
  const nomeTipo = formatarTipoDocumento(documento.value.TipoDocumento);

  // Versão no formato vX_Y
  const versao = documento.value.versao; // ex: "3.4"
  let versaoFormatada = "v0_0";

  if (versao) {
    const partes = versao.toString().split(".");
    const maior = partes[0] ?? "0";
    const menor = partes[1] ?? "0";
    versaoFormatada = `v${maior}_${menor}`;
  }

  const nomeArquivo = `${nomeTipo}(${versaoFormatada}).md`;

  // Criar o arquivo markdown
  const blob = new Blob(
    [documento.value.arquivo],
    { type: "text/markdown;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();

  URL.revokeObjectURL(url);
}

</script>

<style scoped>
audio {
  border-radius: 8px;
  background-color: #f8f9fa;
}
</style>


<template>
  <div class="flex my-auto mt-20 w-11/12 gap-6 items-start">
    <div class="w-11/12 mb-0 p-4 border border-1 border-gray-500 rounded-lg">
      <!-- Cabeçalho com alinhamento correto -->
      <div class="flex items-start justify-between mb-6 w-full">

        <!-- Botão voltar -->
        <button
          class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
          @click="voltar"
        >
          ← Voltar
        </button>

        <!-- Container dos botões à direita -->
        <div class="flex flex-col items-end">

          <!-- Linha dos dois botões -->
          <div class="flex gap-3">
            <button
              class="px-4 py-2 border border-gray-700 bg-white text-gray-700 rounded-md
                    hover:bg-gray-700 hover:text-white transition cursor-pointer"
              @click="abrirModalEditar"
            >
              Editar
            </button>

            <Editar
              v-model="mostrarModalEditar"
              @salvo="carregarDocumento"
              :documentoId="route.params.id"
            />

            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md shadow
                    hover:bg-blue-700 transition cursor-pointer"
              @click="abrirModalNV"
            >
              Gerar Nova Versão
            </button>

            <NovaVersao
              v-model="mostrarModalNV"
              @salvo="carregarDocumento"
              :documentoId="documentoId"
            />
          </div>

          <!-- Botão de download com largura exata dos dois botões -->
          <button
            class="mt-3 bg-gray-500 text-white px-4 py-2 rounded-md shadow
                  hover:bg-gray-800 transition cursor-pointer w-[calc(100%)]"
            @click="baixarMarkdown"
          >
            Download
          </button>

        </div>
      </div>

      <!-- Carregando -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8"></div>
      </div>

      <!-- Conteúdo -->
      <div v-else-if="documento">
        <!-- Título -->
        <h1 class="text-3xl font-semibold text-gray-800 mb-4">
          {{ capitalizarPrimeiraLetra(documento.TipoDocumento)}} (v{{ documento.versao }})
        </h1>

        <!-- Editor Markdown -->
        <div class="w-full">
          <p class="text-gray-600 font-medium mb-2">Conteúdo do Documento:</p>
          <div class="border border-1 border-gray-500 rounded-md pr-2 py-2">
            <v-md-editor
              v-model="documento.arquivo"
              mode="preview"
              height="500px"
          />
          </div>
        </div>
      </div>

      <!-- Erro ou documento não encontrado -->
      <div v-else class="text-gray-500 italic">Documento não encontrado.</div>
    </div>

    <!-- Barra lateral com informações de documentos relacionados -->
    <div class="border border-1 border-gray-500 p-2 rounded-lg w-2/12">
      
      <!-- Documento Origem -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Documentos de Origem:</p>
        <!-- Se o documento for um minimundo -->
        <p v-if="documento.TipoDocumento === 'MINIMUNDO'" class="text-gray-500 italic ml-2">
          {{documento.origemAudio}}
        </p>
        <ul v-else="documento.TipoDocumento !== 'MINIMUNDO'" class="list-disc ml-6 text-blue-600">
          <li v-for="origem in documento.DocumentoOrigem" :key="origem.id">
            <RouterLink :to="`/Documento/${origem.id}`" class="hover:underline">
              {{ capitalizarPrimeiraLetra(origem.TipoDocumento) }} (v{{ origem.versao }})
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Documento Anterior -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Versão Anterior:</p>
        <!-- Se não houver nenhuma versão anterior-->
        <p v-if="documento.DocumentoAnterior === null" class="text-gray-500 italic ml-2">
          Não há versões anteriores.
        </p>
        <ul v-else="documento.DocumentoAnterior !== null" class="list-disc ml-6 text-blue-600">
          <li>
            <RouterLink
              :to="`/Documento/${documento.DocumentoAnterior.id}`"
              class="text-blue-600 hover:underline"
            >
              {{ capitalizarPrimeiraLetra(documento.DocumentoAnterior.TipoDocumento) }} (v{{ documento.DocumentoAnterior.versao }})
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Documentos Seguintes -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Versão Seguinte:</p>
        <!-- Se não houver nenhuma nova versão -->
        <p v-if="!documentosSeguintes || documentosSeguintes.length === 0" class="text-gray-500 italic ml-2">
          Não há novas versões.
        </p>
        <ul v-else="documentosSeguintes.length > 0"class="list-disc ml-6 text-blue-600">
          <li v-for="seguinte in documentosSeguintes" :key="seguinte.id">
            <RouterLink :to="{ name: 'documento-detalhe', params: { id: seguinte.id }}" class="text-blue-600 hover:underline">
              {{ capitalizarPrimeiraLetra(seguinte.TipoDocumento) }} (v{{ seguinte.versao }})
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>