<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import type { Documento } from '../types/documento'
import { criarDocumento } from '../controllers/documento'
import { listarUltimosDocumentos } from '@/modules/Modulo/controllers/modulo';
import { formatarTipoDocumento, formatarVersao, criarFormDataDocumento } from '@/utils/formatacoesDocumentos';

import { useLoadingStore } from '@/stores/loading'
import { useDocumentGenerationStore } from '@/stores/documentGeneration'

const loading = useLoadingStore()
const store = useDocumentGenerationStore()

const props = defineProps<{
  modelValue: boolean
  moduloId: number | string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const close = () => emit("update:modelValue", false)

// Modo de criação
const modoCriacao = ref('individual')

const fileInput = ref<HTMLInputElement | null>(null)

// Campos do documento
// const id = ref('')
// const versao = ref('1.0')
// const geradoIA = ref<boolean>(true)
// const arquivo = ref('')
const arquivoAudio = ref<File | null>(null)
// TipoDocumento será computed
// const DocumentoAnterior = ref('')
// const Modulo = ref(props.moduloId as string)
const DocumentoOrigem = ref<number[]>([])

const categoriasDropdown = ref<string[]>([
  "document.domainStorytelling",
  "document.requirements",
  "document.UCandCD",
])

// Tipo de documento (categoria) escolhido na hora de criar
const categoriaEscolhida = ref('')

// Refs p/ armazenarem os documentos de origem escolhidos
const minimundo_origem = ref<Documento | null>(null)
const requisito_origem = ref<Documento | null>(null)
const casoDeUso_origem = ref<Documento | null>(null)
const diagramaDeClasse_origem = ref<Documento | null>(null)
const prototipoDeInterface_origem = ref<Documento | null>(null)

const carregando = ref(false)

const TipoDocumento = computed(() => {
  switch (categoriaEscolhida.value) {
    case 'document.domainStorytelling':
      return 'MINIMUNDO'
    case 'document.requirements':
      return 'REQUISITOS'
    case 'document.UCandCD':
      return 'CASO_USO_E_DIAGRAMA_CLASSE'
    // case 'Protótipo de Interface':
    //   return 'PROTOTIPO_INTERFACE'
    default:
      return ''
  }
})

const isDisabled = computed(() => {
  if (modoCriacao.value === 'todos' && categoriasDropdown.value.length < 3) {
    return true
  }
  else if (modoCriacao.value === 'todos' && categoriasDropdown.value.length === 3) {
    return carregando.value || arquivoAudio.value === null 
  }

  if (modoCriacao.value === 'individual' && categoriasDropdown.value.length === 0) {
    return true
  }
  return carregando.value
    || (TipoDocumento.value === '')
    || (TipoDocumento.value === 'MINIMUNDO' && arquivoAudio.value === null)
    || (TipoDocumento.value === 'REQUISITOS' && minimundo_origem.value === null) 
    || (TipoDocumento.value === 'CASO_USO_E_DIAGRAMA_CLASSE' && (minimundo_origem.value === null || requisito_origem.value === null)) 
    // || (TipoDocumento.value === 'DIAGRAMA_CLASSE' && (minimundo_origem.value === null || requisito_origem.value === null || casoDeUso_origem.value === null)) 
    // || (TipoDocumento.value === 'PROTOTIPO_INTERFACE' && (requisito_origem.value === null || casoDeUso_origem.value === null || diagramaDeClasse_origem.value === null))
})

// Recarrega a lista de documentos ao abrir o modal
watch(
  () => props.modelValue,
  (novoValor) => {
    if (novoValor) { carregarDocumentos() }
  }
)

// Reseta os campos ao mudar a categoria
watch(
  () => categoriaEscolhida.value,
  () => { carregarDocumentos() }
)

// Métodos ------------------------------------------------------

const carregarDocumentos = async () => {
  // Reseta os campos
  arquivoAudio.value = null
  minimundo_origem.value = null
  requisito_origem.value = null
  casoDeUso_origem.value = null
  diagramaDeClasse_origem.value = null
  // prototipoDeInterface_origem.value = null

  categoriasDropdown.value = [
    "document.domainStorytelling",
    "document.requirements",
    "document.UCandCD",
    // "document.classDiagram",
    // "document.prototypeInterface"
  ]

  const ultimosDocumentos = await listarUltimosDocumentos(props.moduloId as string)

  for (const documento of ultimosDocumentos) {
     if (documento.TipoDocumento === 'MINIMUNDO') {
      minimundo_origem.value = documento
      categoriasDropdown.value.splice(0, 1)
    } else if (documento.TipoDocumento === 'REQUISITOS') {
      requisito_origem.value = documento
      categoriasDropdown.value.splice(0, 1)
    } else if (documento.TipoDocumento === 'CASO_USO') {
      casoDeUso_origem.value = documento
      categoriasDropdown.value.splice(0, 1)
    } else if (documento.TipoDocumento === 'DIAGRAMA_CLASSE') {
      diagramaDeClasse_origem.value = documento
      categoriasDropdown.value.splice(0, 1)
    } else if (documento.TipoDocumento === 'PROTOTIPO_INTERFACE') {
      prototipoDeInterface_origem.value = documento
      categoriasDropdown.value.splice(0, 1)
    }
  }
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try {
    if (modoCriacao.value === 'individual') {
      if (minimundo_origem.value !== null) {
        DocumentoOrigem.value.push(Number(minimundo_origem.value.id))
      }
      if (requisito_origem.value !== null) {
        DocumentoOrigem.value.push(Number(requisito_origem.value.id))
      }
      if (casoDeUso_origem.value !== null) {
        DocumentoOrigem.value.push(Number(casoDeUso_origem.value.id))
      }
      if (diagramaDeClasse_origem.value !== null) {
        DocumentoOrigem.value.push(Number(diagramaDeClasse_origem.value.id))
      }

      loading.start('document.notification.loading')
      const formDataToSend = criarFormDataDocumento({
        vMajor: 1,
        vMinor: 0,
        geradoIA: true,
        arquivo: '',
        arquivoAudio: arquivoAudio.value,
        TipoDocumento: TipoDocumento.value,
        DocumentoAnterior: null,
        Modulo: props.moduloId as string,
        DocumentoOrigem: DocumentoOrigem.value,
      })
      
      const response = await store.generate(formDataToSend)
      
      if (response && response.status === 201) {
        close()
      }
    } else {
      // Criar todos os documentos

      const idsDocumentosCriados: number[] = []
      
      let formData = criarFormDataDocumento({
        vMajor: 1,
        vMinor: 0,
        geradoIA: true,
        arquivo: '',
        arquivoAudio: arquivoAudio.value,
        TipoDocumento: 'MINIMUNDO',
        DocumentoAnterior: null,
        Modulo: props.moduloId as string,
        DocumentoOrigem: [],
      })
      
      let response = await criarDocumento(formData)

      if (response) {
        idsDocumentosCriados.push(Number(response.data.id))
        formData =  criarFormDataDocumento({
          vMajor: 1,
          vMinor: 0,
          geradoIA: true,
          arquivo: '',
          arquivoAudio: null,
          TipoDocumento: 'REQUISITOS',
          DocumentoAnterior: null,
          Modulo: props.moduloId as string,
          DocumentoOrigem: idsDocumentosCriados,
        })
        response = await criarDocumento(formData)
      }

      if (response) {
        idsDocumentosCriados.push(Number(response.data.id))
        formData = criarFormDataDocumento({
          vMajor: 1,
          vMinor: 0,
          geradoIA: true,
          arquivo: '',
          arquivoAudio: null,
          TipoDocumento: 'CASO_USO_E_DIAGRAMA_CLASSE',
          DocumentoAnterior: null,
          Modulo: props.moduloId as string,
          DocumentoOrigem: idsDocumentosCriados,
        })
        response = await criarDocumento(formData)
      }

      // if (response) {
      //   idsDocumentosCriados.push(Number(response.data.id))
      //   formData = criarFormDataDocumento({
      //     vMajor: 1,
      //     vMinor: 0,
      //     geradoIA: true,
      //     arquivo: '',
      //     arquivoAudio: null,
      //     TipoDocumento: 'CASO_USO',
      //     DocumentoAnterior: null,
      //     Modulo: props.moduloId as string,
      //     DocumentoOrigem: idsDocumentosCriados,
      //   })
      //   response = await criarDocumento(formData)
      // }

      
      // if (response) {
      //   idsDocumentosCriados.push(Number(response.data.id))
      //   formData = criarFormDataDocumento({
      //     vMajor: 1,
      //     vMinor: 0,
      //     geradoIA: true,
      //     arquivo: '',
      //     arquivoAudio: null,
      //     TipoDocumento: 'DIAGRAMA_CLASSE',
      //     DocumentoAnterior: null,
      //     Modulo: props.moduloId as string,
      //     DocumentoOrigem: idsDocumentosCriados,
      //   })
      //   response = await criarDocumento(formData)
      // }

      // if (response) {
      //   idsDocumentosCriados.push(Number(response.data.id))
      //   idsDocumentosCriados.shift()
      //   response = await criarDocumento({
      //     vMajor: 1,
      //     vMinor: 0,
      //     geradoIA: true,
      //     arquivo: '',
      //     arquivoAudio: '',
      //     TipoDocumento: 'PROTOTIPO_INTERFACE',
      //     DocumentoAnterior: null,
      //     Modulo: props.moduloId as string,
      //     DocumentoOrigem: idsDocumentosCriados,
      //   })
      // }
      emit('salvo')
      close()
    }
  } finally {
    carregando.value = false
    loading.stop()
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput?.value.click()
  }
}

const onFileChange = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    arquivoAudio.value = file
  }
}

const onDrop = (event: any) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    arquivoAudio.value = file
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 class="text-xl font-bold mb-4"> {{ $t('document.createModal.title') }} </h2>

    <!-- <div class="mb-4 font-semibold">
      <label class="mr-4">
        <input type="radio" v-model="modoCriacao" value="individual" />
        {{ $t('document.createModal.specificOption') }}
      </label>
      <label>
        <input type="radio" v-model="modoCriacao" value="todos" />
        {{ $t('document.createModal.allOption') }}
      </label>
    </div> -->

    <div v-if="modoCriacao === 'individual'">
      <h3 class="font-semibold"> {{ $t('document.createModal.dropdownTitle') }}:</h3>

      <!-- Dropdown com os tipos de documento -->
      <select
        v-model="categoriaEscolhida"
        :disabled="categoriasDropdown.length === 0"
        class="block w-full p-2 border rounded my-1 mb-3"
        :class="{ 'bg-gray-100 cursor-not-allowed': categoriasDropdown.length === 0 }"
      >
        <option disabled value="">
          {{ $t('document.createModal.dropdownLabel') }}...
        </option>
        <option v-for="item in categoriasDropdown" :key="item" :value="item">
          {{ $t(item) }}
        </option>
      </select>

      <p v-if="categoriasDropdown.length === 0" class="text-red-500 text-center text-sm italic">
        {{ $t('document.createModal.allDocumentsCreatedIndividual') }}
      </p>

      <!-- Escolha de áudio de origem para Minimundo -->
      <div v-if="TipoDocumento === 'MINIMUNDO'">
        <h3 class="font-semibold">{{ $t('document.createModal.audioSource') }}:</h3>

        <!-- Drag & Drop de áudio -->
        <div
          class="drop-zone"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <div v-if="!arquivoAudio">
            <p class="text-gray-700 font-medium"> {{ $t('document.createModal.audioLabel') }}</p>
            <p class="text-xs text-gray-500"> ({{ $t('document.createModal.audioLabel2') }})</p>
          </div>
          
          <div v-else>
            <p class="text-gray-700 font-medium">{{ arquivoAudio.name }}</p>
          </div>

          <input
            type="file"
            accept=".mp3, .wav, .mp4, .mkv"
            ref="fileInput"
            @change="onFileChange"
            hidden
          />
        </div>
      </div>

      <!-- Seleção de Minimundo -->
      <div v-if="TipoDocumento === 'REQUISITOS' || TipoDocumento === 'CASO_USO_E_DIAGRAMA_CLASSE'">
        <h3 class="font-semibold">{{ $t('document.createModal.sourcedDomainStorytelling') }}:</h3>
        <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
          <div v-if="minimundo_origem !== null">
            {{ $t(formatarTipoDocumento(minimundo_origem?.TipoDocumento)) }} (v{{ formatarVersao(minimundo_origem?.vMajor, minimundo_origem?.vMinor) }})
          </div>
          <div v-else class="text-gray-500 italic">
            {{ $t('document.createModal.noDocument') }}
          </div>
        </div>
      </div>

      <!-- Seleção de Requisitos -->
      <div v-if="TipoDocumento === 'CASO_USO_E_DIAGRAMA_CLASSE'">
        <h3 class="font-semibold">{{ $t('document.createModal.sourceRequirements') }}:</h3>
        <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
          <div v-if="requisito_origem !== null">
            {{ $t(formatarTipoDocumento(requisito_origem?.TipoDocumento)) }} (v{{ formatarVersao(requisito_origem?.vMajor, requisito_origem?.vMinor) }})
          </div>
          <div v-else class="text-gray-500 italic">
            {{ $t('document.createModal.noDocument') }}
          </div>
        </div>
      </div>

      <!-- Seleção de Casos de Uso -->
      <!-- <div v-if="TipoDocumento === 'DIAGRAMA_CLASSE'">
        <h3 class="font-semibold">{{ $t('document.createModal.sourceUseCases') }}:</h3>
        <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
          <div v-if="casoDeUso_origem !== null">
            {{ $t(formatarTipoDocumento(casoDeUso_origem?.TipoDocumento)) }} (v{{ formatarVersao(casoDeUso_origem?.vMajor, casoDeUso_origem?.vMinor) }})
          </div>
          <div v-else class="text-gray-500 italic">
            {{ $t('document.createModal.noDocument') }}
          </div>
        </div>
      </div> -->

      <!-- Seleção de Diagrama de Classe -->
      <!-- <div v-if="TipoDocumento === 'PROTOTIPO_INTERFACE'">
        <h3 class="font-semibold">Diagrama de classe de origem:</h3>
        <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
          <div v-if="diagramaDeClasse_origem !== null">
            {{ formatarTipoDocumento(diagramaDeClasse_origem?.TipoDocumento) }} (v{{ formatarVersao(diagramaDeClasse_origem?.vMajor, diagramaDeClasse_origem?.vMinor) }})
          </div>
          <div v-else class="text-gray-500 italic">
            Nenhum documento disponível.
          </div>
        </div>
      </div> -->
    </div>

    <!-- Criação de todos os documentos -->
    <div v-else>

      <!-- Oferece a opção de criar todos apenas quando ainda não tem nenhum documento -->
      <div v-if="categoriasDropdown.length === 3">
        <h3 class="font-semibold">{{ $t('document.createModal.audioSource') }}:</h3>
          <!-- Drag & Drop de áudio -->
          <div
            class="drop-zone"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="onDrop"
          >
            <div v-if="!arquivoAudio">
              <p class="text-gray-700 font-medium"> {{ $t('document.createModal.audioLabel') }}</p>
              <p class="text-xs text-gray-500"> ({{$t('document.createModal.audioLabel2') }})</p>
            </div>
            
            <div v-else>
              <p class="text-gray-700 font-medium">{{ arquivoAudio.name }}</p>
            </div>

            <input
              type="file"
              accept=".mp3,.wav,.mp4, .mkv"
              ref="fileInput"
              @change="onFileChange"
              hidden
            />
          </div>
      </div>

      <div v-else-if="categoriasDropdown.length === 0 && modoCriacao === 'todos'" class="text-center">
        <p class="text-red-500 text-sm italic">
          {{ $t('document.createModal.allDocumentsCreatedAll') }}
        </p>
      </div>
      
    </div>


    <div class="mt-4 flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        {{ $t('document.cancel')}}
      </button>

      <button
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer
        disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
        :disabled="isDisabled" 
        @click="salvar"
      >
        {{ $t('document.createModal.createButton') }}
      </button>
    </div>
  </modal>
</template>

<style>
.drop-zone {
  border: 2px dashed #aaa;
  margin-top: 8px;
  padding: 20px;
  cursor: pointer;
  border-radius: 8px;
  min-width: 200px;
  min-height: 100px;

  display: flex;
  justify-content: center;   /* horizontal */
  align-items: center;       /* vertical */
  text-align: center;
}

.drop-zone:hover {
  border-color: #666;
}
</style>