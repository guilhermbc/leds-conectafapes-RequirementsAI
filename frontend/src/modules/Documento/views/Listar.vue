<script setup lang="ts">
import { ref, onBeforeMount, computed, watch} from 'vue'
import Criar from './Criar.vue'
import { obterModulo, listarUltimosDocumentos } from '@/modules/Modulo/controllers/modulo'
import type { Documento } from '../types/documento'
import { formatarTipoDocumento, formatarVersao } from '@/utils/formatacoesDocumentos'
import { useDocumentGenerationStore } from '@/stores/documentGeneration'
import { useLoadingStore } from '@/stores/loading'

const store = useDocumentGenerationStore()
const loading = useLoadingStore()

const props = defineProps<{
  moduloId?: string | number
}>()

const documentos = ref<Documento[]>([])
const ultimosDocumentos = ref<Documento[]>([])

const iconesDocumento: Record<string, string> = {
  MINIMUNDO: new URL('../../../assets/storytelling_icon.svg', import.meta.url).href,
  REQUISITOS: new URL('../../../assets/requirements_icon.svg', import.meta.url).href,
  CASO_USO: new URL('../../../assets/usecases_icon.svg', import.meta.url).href,
  DIAGRAMA_CLASSE: new URL('../../../assets/classdiagram_icon.svg', import.meta.url).href,
}

const getIconForTipo = (tipo: string) => iconesDocumento[tipo] || ''

const coresPorTipo: Record<string, string> = {
  MINIMUNDO: 'doc-minimundo',
  REQUISITOS: 'doc-requisitos',
  CASO_USO: 'doc-caso-uso',
  DIAGRAMA_CLASSE: 'doc-diagrama',
}

const coresColunaPorTipo: Record<string, string> = {
  MINIMUNDO: 'col-minimundo',
  REQUISITOS: 'col-requisitos',
  CASO_USO: 'col-caso-uso',
  DIAGRAMA_CLASSE: 'col-diagrama',
}

const tiposDocumentoOrdenados = [
  { valor: 'MINIMUNDO', nome: 'document.domainStorytelling' },
  { valor: 'REQUISITOS', nome: 'document.requirements' },
  { valor: 'CASO_USO', nome: 'document.useCases' },
  { valor: 'DIAGRAMA_CLASSE', nome: 'document.classDiagram' },
]

const documentosPorTipo = computed(() => {
  return tiposDocumentoOrdenados.map((tipo) => ({
    ...tipo,
    documentos: documentos.value
      .filter((doc) => doc.TipoDocumento === tipo.valor)
      .slice()
      .reverse(),
  }))
})

// Verificar se o botão de criar documento deve ser desabilitado
const isDisabled = computed(() => {
  if (store.isGenerating) {
    return true
  }
  const tiposArtefatosCriados: string[] = []
  for (const doc of documentos.value) {
    if (!tiposArtefatosCriados.includes(doc.TipoDocumento)) {
      tiposArtefatosCriados.push(doc.TipoDocumento)
    }
  }
  if (tiposArtefatosCriados.length >= 4) {
    return true
  }
  return false
})


const carregarDocumentos = async () => {
  const modulo = await obterModulo(props.moduloId as string)
  const ultimosDocs = await listarUltimosDocumentos(props.moduloId as string)

  ultimosDocumentos.value = ultimosDocs
  console.log('Documentos carregados:', ultimosDocumentos.value)
  documentos.value = modulo.modulo_documento
}

const mostrarModal = ref(false)

onBeforeMount(carregarDocumentos)

watch(
  () => store.lastCreatedId,
  async (id) => {
    if (id) {
      await carregarDocumentos()
      store.clearLastCreated()
    }
  }
)

watch(
  () => store.isGenerating,
  (val) => {
    if (val) loading.start('document.notification.loading')
    else loading.stop()
  }
)

function abrirModal(){
  mostrarModal.value = true
} 

function onSalvo() {
  carregarDocumentos()
}

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">{{ $t('document.currentDocumentsTitle') }}</h1>
      <button
        class="w-[347px] h-[45px] bg-blue-600 text-sm text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition cursor-pointer
        disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
        @click="abrirModal()"
        :disabled="isDisabled"
      >
        {{ $t('document.new') }}
      </button>

      <!-- Modal -->
      <Criar v-model="mostrarModal" @salvo="onSalvo" :moduloId="moduloId ?? ''"/>
    </div>

    <!-- Últimos Documentos -->
    <div v-if="ultimosDocumentos.length === 0" class="text-center text-gray-500 py-12">
      {{ $t('document.none') }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link
        v-for="documento in ultimosDocumentos"
        :key="documento.id"
        :to="{ name: 'documento-detalhe', params: { id: documento.id } }"
        class="block group h-25"
      >
        <article
          :class="[
            'relative rounded-lg shadow-sm hover:shadow-md transition p-4 pr-12 pb-10 flex flex-col h-full border',
            coresPorTipo[documento.TipoDocumento]
          ]"
        >
          <img
            :src="getIconForTipo(documento.TipoDocumento)"
            alt=""
            class="absolute right-4 top-4 w-6 h-6 sm:w-8 sm:h-8 object-contain"
          />
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ $t(formatarTipoDocumento(documento.TipoDocumento)) }} (v{{formatarVersao(documento.vMajor, documento.vMinor)  }})</h2>
          </header>
          <span
            v-if="documento.obsoleto"
            class="absolute right-4 bottom-4 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200"
          >
            {{ $t('document.deprecated') }}
          </span>
        </article>
      </router-link>
    </div>

    <hr class="my-6 border-gray-400" />

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">{{ $t('document.allDocumentsTitle') }}</h1>
    </div>

    <!-- Todos os Documentos -->

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[162px]">
      <div v-for="coluna in documentosPorTipo" :key="coluna.valor" class="h-full">
        <div
          :class="[
            'relative rounded-lg shadow-sm p-4 h-full flex flex-col',
            coresColunaPorTipo[coluna.valor]
          ]"
        >
          <img
            :src="getIconForTipo(coluna.valor)"
            alt=""
            class="absolute right-4 top-4 w-6 h-6 sm:w-8 sm:h-8 object-contain"
          />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {{ $t(coluna.nome) }}
          </h3>

          <div class="space-y-3 flex-1">
            <div v-if="coluna.documentos.length === 0" class="text-gray-300 italic text-sm">
              {{ $t('document.none') }}
            </div>

            <router-link
              v-else
              v-for="documento in coluna.documentos"
              :key="documento.id"
              :to="{ name: 'documento-detalhe', params: { id: documento.id } }"
              class="block group"
            >
              <article
                :class="[
                  'relative rounded-lg border p-4 pr-12 hover:shadow-md transition flex flex-col h-full',
                  coresPorTipo[documento.TipoDocumento]
                ]"
              >
                <header class="mb-2">
                  <h2 class="text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                    {{ $t(formatarTipoDocumento(documento.TipoDocumento)) }}
                  </h2>
                </header>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  v{{ formatarVersao(documento.vMajor, documento.vMinor) }}
                </p>
              </article>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Colunas */
.col-minimundo {
  background-color: #0f172a;
}

.col-requisitos {
  background-color: #08192e;
}

.col-caso-uso {
  background-color: #0a2540;
}

.col-diagrama {
  background-color: #0a2f52;
}

/* Cards */
.doc-minimundo {
  background-color: #0f172a;
  /* border: 1px solid #334155; */
  color: #e2e8f0;
}

.doc-requisitos {
  background-color: #08192e;
  /* border: 1px solid #1d4ed8; */
  color: #e2e8f0;
}

.doc-caso-uso {
  background-color: #0a2540;
  /* border: 1px solid #2563eb; */
  color: #e2e8f0;
}

.doc-diagrama {
  background-color: #0a2f52;
  /* border: 1px solid #60a5fa; */
  color: #e2e8f0;
}

/* Hover dos cards */
.doc-minimundo:hover {
  background-color: #111827;
}

.doc-requisitos:hover {
  background-color: #0a1f3a;
}

.doc-caso-uso:hover {
  background-color: #0b2d52;
}

.doc-diagrama:hover {
  background-color: #0c3a66;
}

article {
  transition: all 0.2s ease;
}

article:hover {
  transform: translateY(-2px);
}
</style>