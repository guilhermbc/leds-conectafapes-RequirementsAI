<script setup lang="ts">
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

// Tentativa de integrar um editor markdown, está em stand by por enquanto
// import MarkdownEditor from '@/components/MarkdownEditor.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

import { obterDocumento } from '../controllers/documento'
import { obterModulo, listarUltimosDocumentos} from '@/modules/Modulo/controllers/modulo'
import { obterProjeto } from '@/modules/Projeto/controllers/projeto'
import type { Projeto } from '@/modules/Projeto/types/projeto'
import type { Modulo } from '@/modules/Modulo/types/modulo'
import type { Documento } from '../types/documento'
import NovaVersaoIA from './NovaVersaoIA.vue'
import UploadNovaVersao from './UploadNovaVersao.vue'
import { formatarTipoDocumento, formatarVersao, getNomeArquivo } from '@/utils/formatacoesDocumentos';
import GerarProximoDocumento from './GerarProximoDocumento.vue'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const documentoId = ref(route.params.id as string)
const documento = ref<Documento | null>(null)
// Próximas versões do documento atual (documentos que têm o documento atual como DocumentoAnterior)
const documentosSeguintes = ref<Documento[]>([])

// Últimos documentos do módulo (para verificar se o botão de gerar nova versão deve ser habilitado ou não)
const ultimosDocsModulo = ref<Documento[]>([])

const modulo = ref<Modulo | null>(null)
const projeto = ref<Projeto | null>(null)

const loading = ref(true)

const isGerarProximoArtefatoDisponivel = computed(() => {
  if (documento.value?.obsoleto) return false

  if (documento.value?.TipoDocumento === 'MINIMUNDO') {
    const requisito = ultimosDocsModulo.value.find(doc => doc.TipoDocumento === 'REQUISITOS')
    if (!requisito) return true
    return requisito.obsoleto === true
  }

  if (documento.value?.TipoDocumento === 'REQUISITOS') {
    const casoUso = ultimosDocsModulo.value.find(doc => doc.TipoDocumento === 'CASO_USO')
    const diagramaClasse = ultimosDocsModulo.value.find(doc => doc.TipoDocumento === 'DIAGRAMA_CLASSE')
    if (!casoUso || !diagramaClasse) return true
    return casoUso.obsoleto === true || diagramaClasse.obsoleto === true
  }

  return false
})

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
    modulo.value = typeof documento.value?.Modulo === 'string' ? null : documento.value?.Modulo as Modulo
    projeto.value = await obterProjeto(modulo.value?.Projeto as string)

    // Carrega os últimos documentos do módulo
    ultimosDocsModulo.value = await listarUltimosDocumentos(modulo.value?.id as string)

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
    const moduloId = typeof documento.value?.Modulo === 'object' && documento.value?.Modulo !== null
      ? (documento.value.Modulo as { id: string }).id
      : documento.value?.Modulo as string
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

const mostrarModalUploadNovaVersao = ref(false)

function abrirModalUploadNovaVersao(){
  mostrarModalUploadNovaVersao.value = true
}

// Mostrar modal nova versão
const mostrarModalNovaVersaoIA = ref(false)

function abrirModalNovaVersaoIA(){
  mostrarModalNovaVersaoIA.value = true
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
  <div class="w-full my-auto mt-20 p-4">
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
    :to="`/Modulo/${modulo?.id}`"
      class="hover:text-blue-600 hover:underline"
    >
      {{ modulo?.nome }}
    </router-link>

    >

    <router-link 
      :to="`/Documento/${documento?.id}`"
      class="hover:text-blue-600 hover:underline"
    >
      {{ $t(formatarTipoDocumento(documento?.TipoDocumento || '')) }} (v{{ formatarVersao(documento?.vMajor || 0, documento?.vMinor || 0) }})
    </router-link>
  </div>
  
    <div class="flex w-full gap-6 items-start">
      <div class="flex-1 min-w-0 p-4 border border-gray-500 rounded-lg">
      <!-- Cabeçalho com alinhamento correto -->
      <div class="flex items-start justify-between mb-6 w-full">

        <!-- Botão voltar -->
        <button
          class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition cursor-pointer"
          @click="voltar"
        >
          {{ $t('navigation.back') }}
        </button>

        <!-- Container dos botões à direita -->
        <div class="flex flex-col items-end">

          <!-- Linha dos dois botões -->
          <div class="flex gap-3">
            <button
              class="px-4 py-2 border border-gray-700 bg-white text-gray-700 rounded-md
                    hover:bg-gray-700 hover:text-white transition cursor-pointer"
              @click="abrirModalUploadNovaVersao"
            >
              {{ $t('document.uploadNewVersion') }}
            </button>

            <UploadNovaVersao
              v-model="mostrarModalUploadNovaVersao"
              @salvo="irParaSeguinte()"
              :documentoId="route.params.id as string"
            />

            <button
              v-if="documento?.TipoDocumento == 'MINIMUNDO'"
              class="bg-blue-600 text-white px-4 py-2 rounded-md shadow
                    hover:bg-blue-700 transition cursor-pointer
                    disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
              @click="abrirModalNovaVersaoIA"
              :disabled="!isGerarProximoArtefatoDisponivel"
            >
              {{ $t('document.generateNewRequirements') }}
            </button>

            <button
              v-if="documento?.TipoDocumento == 'REQUISITOS'"
              class="bg-blue-600 text-white px-4 py-2 rounded-md shadow
                    hover:bg-blue-700 transition cursor-pointer
                    disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
              @click="abrirModalNovaVersaoIA"
              :disabled="!isGerarProximoArtefatoDisponivel"
            >
              {{ $t('document.generateNewUCandCD') }}
            </button>

            <GerarProximoDocumento
              v-model="mostrarModalNovaVersaoIA"
              :documentoId="route.params.id as string"
            />
          </div>

          <!-- Botão de download com largura exata dos dois botões -->
          <button
            class="mt-3 bg-gray-500 text-white px-4 py-2 rounded-md shadow
                  hover:bg-gray-800 transition cursor-pointer w-[calc(100%)]"
            @click="baixarMarkdown"
          >
            {{ $t('document.download') }}
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
          {{ $t(formatarTipoDocumento(documento.TipoDocumento))}} (v{{ formatarVersao(documento.vMajor, documento.vMinor) }})
        </h1>

        <!-- Editor Markdown -->
        <div class="w-full">
          <p class="text-gray-600 font-medium mb-2">{{ $t('document.contentText') }}:</p>
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
    <div class="border border-1 border-gray-500 p-2 rounded-lg w-3/12">
      
      <!-- Documento Origem -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">{{ $t('document.sidebar.sourceDocuments') }}:</p>
        <!-- Se o documento for um minimundo -->
        <p v-if="documento?.TipoDocumento === 'MINIMUNDO'" class="text-gray-500 italic ml-2 break-words">
          {{ getNomeArquivo(documento?.arquivoAudio) }}
        </p>
        <ul v-else-if="documento?.TipoDocumento !== 'MINIMUNDO' && documento?.DocumentoOrigem?.length" class="list-disc ml-6 text-blue-600">
          <li v-for="origem in documento.DocumentoOrigem" :key="origem.id">
            <RouterLink :to="`/Documento/${origem.id}`" class="hover:underline">
              {{ $t(formatarTipoDocumento(origem.TipoDocumento)) }} (v{{ formatarVersao(origem.vMajor, origem.vMinor) }})
            </RouterLink>
          </li>
        </ul>
        <p v-else class="text-gray-500 italic ml-2">Sem documentos de origem.</p>
      </div>

      <!-- Par UC/CD -->
       <div v-if="documento?.parUC_CD" class="mb-4">
        <p class="text-gray-600 font-medium mb-1">{{ $t('document.sidebar.pairUC_CD') }}:</p>
        <ul class="list-disc ml-6 text-blue-600">
          <li>
            <RouterLink :to="`/Documento/${documento.parUC_CD.id}`" class="text-blue-600 hover:underline">
              {{ $t(formatarTipoDocumento(documento.parUC_CD.TipoDocumento)) }} (v{{ formatarVersao(documento.parUC_CD.vMajor, documento.parUC_CD.vMinor) }})
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Documento Anterior -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">{{ $t('document.sidebar.previousVersion') }}:</p>
        <!-- Se não houver nenhuma versão anterior-->
        <p v-if="!documento?.DocumentoAnterior" class="text-gray-500 italic ml-2">
          {{ $t('document.sidebar.noPreviousVersion') }}
        </p>
        <ul v-else class="list-disc ml-6 text-blue-600">
          <li>
            <RouterLink
              :to="`/Documento/${documento.DocumentoAnterior.id}`"
              class="text-blue-600 hover:underline"
            >
              {{ $t(formatarTipoDocumento(documento.DocumentoAnterior.TipoDocumento)) }} (v{{ formatarVersao(documento.DocumentoAnterior.vMajor, documento.DocumentoAnterior.vMinor)}})
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Documentos Seguintes -->
      <div class="mb-4">
        <p class="text-gray-600 font-medium mb-1">{{ $t('document.sidebar.nextVersion') }}:</p>
        <!-- Se não houver nenhuma nova versão -->
        <p v-if="!documentosSeguintes || documentosSeguintes.length === 0" class="text-gray-500 italic ml-2">
          {{ $t('document.sidebar.noNextVersion') }}
        </p>
        <ul v-else-if="documentosSeguintes.length > 0"class="list-disc ml-6 text-blue-600">
          <li v-for="seguinte in documentosSeguintes" :key="seguinte.id">
            <RouterLink :to="{ name: 'documento-detalhe', params: { id: seguinte.id }}" class="text-blue-600 hover:underline">
              {{ $t(formatarTipoDocumento(seguinte.TipoDocumento)) }} (v{{formatarVersao(seguinte.vMajor, seguinte.vMinor)}})
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>           
  </div>
  
</template>