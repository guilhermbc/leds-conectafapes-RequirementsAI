<script setup lang="ts">
import { computed, ref, watch} from 'vue'
import {
  criarDocumento,
  obterDocumento,
} from '../controllers/documento'
import { formatarTipoDocumento, formatarVersao, getNomeArquivo, criarFormDataDocumento } from '@/utils/formatacoesDocumentos'

import { useLoadingStore } from '@/stores/loading'
import { useDocumentGenerationStore } from '@/stores/documentGeneration'

const loading = useLoadingStore()
const stores = useDocumentGenerationStore()

const props = defineProps<{
  modelValue: boolean
  documentoId?: string | number
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const close = () => emit("update:modelValue", false)

const fileInput = ref<HTMLInputElement | null>(null)

// Campos do documento
const id = ref('')
const vMajor = ref()
const vMinor = ref()
const arquivoAudio = ref<File | null>(null)
const TipoDocumento = ref('')
const Modulo = ref('')
const DocumentoOrigem = ref<number[]>([])

const carregando = ref(false)

const isDisabled = computed(() => {
  return carregando.value
    || (arquivoAudio.value === null && TipoDocumento.value === 'MINIMUNDO')
})

// Recarrega a lista de documentos ao abrir o modal
watch(
  () => props.modelValue,
  (novoValor) => {
    if (novoValor) {
      carregarDocumento()
    }
  }
)

// Métodos ------------------------------------------------------

const carregarDocumento = async () => {
  const documento = await obterDocumento(props.documentoId as string)

  // Campos necessários para a nova versão
  id.value = documento.id ?? ''
  vMajor.value = documento.vMajor
  vMinor.value = documento.vMinor
  arquivoAudio.value = documento.arquivoAudio
  TipoDocumento.value = documento.TipoDocumento
  Modulo.value = typeof documento.Modulo === 'object' && documento.Modulo !== null
    ? documento.Modulo.id
    : documento.Modulo

  for (const docOrigem of documento.DocumentoOrigem) {
    DocumentoOrigem.value.push(docOrigem.id)
  }
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true
  loading.start('document.notification.loading')
  
  try{
    const formDataToSend = criarFormDataDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: true,
      arquivo: '',
      arquivoAudio: arquivoAudio.value,
      TipoDocumento: TipoDocumento.value,
      DocumentoAnterior: id.value,
      Modulo: Modulo.value,
      DocumentoOrigem: DocumentoOrigem.value,
    })
    const response = await stores.generate(formDataToSend)

    if (response && response.status === 201) {
      emit("salvo")
    }
    close() 
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
    <h2 class="text-xl font-bold mb-4">{{ $t('document.newAIVersionModal.title') }}</h2>

    <div v-if="TipoDocumento == 'MINIMUNDO'" class="">
      <h3 class="font-semibold">{{ $t('document.newAIVersionModal.sourceAudioTitle') }}</h3>
      <!-- Drag & Drop de áudio -->
        <div
          class="drop-zone"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <div v-if="!arquivoAudio">
            <p class="text-gray-700 font-medium"> {{ $t('document.createModal.audioLabel') }}</p>
            <p class="text-xs text-gray-500"> {{ $t('document.createModal.audioLabel2') }}</p>
          </div>
          
          <div v-else>
            <p class="text-gray-700 font-medium">{{ getNomeArquivo(arquivoAudio) }}</p>
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

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        {{ $t('document.newAIVersionModal.confirmationMessage') }} {{ $t(formatarTipoDocumento(TipoDocumento)) }}?
      </h3>
    </div>

    <div class="flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        {{ $t('document.cancel') }}
      </button>

      <button
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer
        disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
        :disabled="isDisabled"  
        @click="salvar"
      >
        {{ $t('document.newAIVersionModal.generateButton') }}
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