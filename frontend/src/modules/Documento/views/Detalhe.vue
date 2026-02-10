<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

import MarkdownEditor from '@/components/MarkdownEditor.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

import { listarDocumento, obterDocumento } from '../controllers/documento'
import { obterModulo } from '@/modules/Modulo/controllers/modulo'
import type { Documento } from '../types/documento'
import NovaVersao from './NovaVersaoIA.vue'
import Editar from './NovaVersaoManual.vue'
import { formatarTipoDocumento, formatarVersao } from '@/utils/formatacoesDocumentos';

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const documentoId = ref(route.params.id as string)
const documento = ref<Documento | null>(null)
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
    documento.value = Array.isArray(data) ? data[0] : data

    await carregarDocumentosSeguintes()
  }
  catch (error) {
    console.error(error)
    ui.exibirAlerta({ message: 'Erro ao carregar documento', color: 'error' })
    router.push({ name: 'projeto-home' })
  }
  finally {
    loading.value = false
  }
}

const carregarDocumentosSeguintes = async () => {
  try {
    documentoId.value = route.params.id as string
    const moduloId = documento.value?.Modulo?.id
    const modulo = await obterModulo(moduloId as string)
    const documentos = modulo.modulo_documento as Documento[]
    documentosSeguintes.value = []
    // Lista de documentos seguintes
    for (const doc of documentos){
      if (String(doc.DocumentoAnterior?.id) === documentoId.value){
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

const irParaSeguinte = async () => {
  try {
    loading.value = true
    await carregarDocumento()

    const proximo = documentosSeguintes.value[0]
    if (!proximo) {
      ui.exibirAlerta({ message: 'Nenhuma versão seguinte encontrada', color: 'info' })
      return
    }

    await router.push({ name: 'documento-detalhe', params: { id: proximo.id } })
  }
  catch (error) {
    console.error('Erro ao navegar para documento seguinte:', error)
    ui.exibirAlerta({ message: 'Erro ao navegar para próximo documento', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

onBeforeMount(
  () => {
    carregarDocumento()
  }
)

watch(
  () => route.params.id,
  () => {
    carregarDocumento()
  }
)

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
  const vMajor = documento.value.vMajor;
  const vMinor = documento.value.vMinor;

  const nomeArquivo = `${nomeTipo}(v${vMajor}_${vMinor}).md`;

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

// Extrai os comentários do protótipo de interface após o fechamento do HTML
function textoAposHtml(conteudo: string): string {
  const fechamento = '</html>'
  const index = conteudo.toLowerCase().lastIndexOf(fechamento)

  if (index === -1) {
    return ''
  }

  const retorno = conteudo.slice(index + fechamento.length).trim()
  console.log('Conteúdo extraído após </html>:', retorno)
  return retorno
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
    <div class="w-10/12 mb-0 p-4 border border-1 border-gray-500 rounded-lg">
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
              @salvo="irParaSeguinte()"
              :documentoId="route.params.id as string"
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
              @salvo="irParaSeguinte()"
              :documentoId="route.params.id as string"
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
          {{ formatarTipoDocumento(documento.TipoDocumento)}} (v{{ formatarVersao(documento.vMajor, documento.vMinor) }})
        </h1>

        <!-- Editor Markdown -->
        <div class="w-full">
          <p class="text-gray-600 font-medium mb-2">Conteúdo do Documento:</p>
          <div class="border border-gray-700 rounded-lg px-4 py-4">
            <MarkdownViewer v-if="documento.TipoDocumento === 'PROTOTIPO_INTERFACE'" :source="textoAposHtml(documento.arquivo)"/>
            <MarkdownViewer v-else :source="documento.arquivo"/>      
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
        <p v-if="documento?.TipoDocumento === 'MINIMUNDO'" class="text-gray-500 italic ml-2">
          {{ documento?.origemAudio }}
        </p>
        <ul v-else-if="documento?.TipoDocumento !== 'MINIMUNDO' && documento?.DocumentoOrigem?.length" class="list-disc ml-6 text-blue-600">
          <li v-for="origem in documento.DocumentoOrigem" :key="origem.id">
            <RouterLink :to="`/Documento/${origem.id}`" class="hover:underline">
              {{ formatarTipoDocumento(origem.TipoDocumento) }} (v{{ formatarVersao(origem.vMajor, origem.vMinor) }})
            </RouterLink>
          </li>
        </ul>
        <p v-else class="text-gray-500 italic ml-2">Sem documentos de origem.</p>
      </div>

      <!-- Documento Anterior -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">Versão Anterior:</p>
        <!-- Se não houver nenhuma versão anterior-->
        <p v-if="!documento?.DocumentoAnterior" class="text-gray-500 italic ml-2">
          Não há versões anteriores.
        </p>
        <ul v-else class="list-disc ml-6 text-blue-600">
          <li>
            <RouterLink
              :to="`/Documento/${documento.DocumentoAnterior.id}`"
              class="text-blue-600 hover:underline"
            >
              {{ formatarTipoDocumento(documento.DocumentoAnterior.TipoDocumento) }} (v{{ formatarVersao(documento.DocumentoAnterior.vMajor, documento.DocumentoAnterior.vMinor)}})
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
        <ul v-else-if="documentosSeguintes.length > 0"class="list-disc ml-6 text-blue-600">
          <li v-for="seguinte in documentosSeguintes" :key="seguinte.id">
            <RouterLink :to="{ name: 'documento-detalhe', params: { id: seguinte.id }}" class="text-blue-600 hover:underline">
              {{ formatarTipoDocumento(seguinte.TipoDocumento) }} (v{{formatarVersao(seguinte.vMajor, seguinte.vMinor)}})
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>