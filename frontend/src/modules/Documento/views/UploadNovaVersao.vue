<script setup lang="ts">
import { ref, watch} from 'vue'
import {
  criarDocumento,
  obterDocumento,
} from '../controllers/documento'
import { criarFormDataDocumento, formatarTipoDocumento} from '@/utils/formatacoesDocumentos';

const props = defineProps<{
  modelValue: boolean
  documentoId: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const close = () => emit("update:modelValue", false)

// Campos do documento
const id = ref('')
const vMajor = ref()
const vMinor = ref()
const arquivoAudio = ref<File | null>(null)
const TipoDocumento = ref('')
const Modulo = ref('')
const DocumentoAnterior = ref('')
const DocumentoOrigem = ref<number[]>([])

const conteudoMarkdown = ref('')

const carregando = ref(false)

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
  DocumentoAnterior.value = documento.DocumentoAnterior

  for (const docOrigem of documento.DocumentoOrigem) {
    DocumentoOrigem.value.push(docOrigem.id)
  }
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const result = e.target?.result
    conteudoMarkdown.value = typeof result === 'string' ? result : ''
  }

  reader.readAsText(file)
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    const formDataToSend = criarFormDataDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: false,
      arquivo: conteudoMarkdown.value,
      // arquivoAudio: arquivoAudio.value,
      TipoDocumento: TipoDocumento.value,
      DocumentoAnterior: id.value,
      Modulo: Modulo.value,
      DocumentoOrigem: DocumentoOrigem.value,
    })
    
    const response = await criarDocumento(formDataToSend)

    emit("salvo")
    close()

  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 class="text-xl font-bold mb-4"> {{ $t('document.editModal.title') }} </h2>

    <h3 class="font-semibold">
      {{ $t('document.editModal.subtitle') }}: 
    </h3>

    <!-- INPUT ESTILIZADO -->
    <label
      class="my-4 flex flex-col items-center justify-center w-full h-32 px-4 
             border-2 border-dashed border-gray-400 rounded-xl cursor-pointer 
             hover:bg-gray-100 transition"
    >
      <span class="text-gray-700 font-medium"> {{ $t('document.editModal.contentLabel') }} </span>
      <span class="text-xs text-gray-500">({{ $t('document.editModal.contentLabel2') }})</span>

      <input
        type="file"
        class="hidden"
        accept=".md,.markdown,text/markdown"
        @change="onFileSelected"
      />
    </label>

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        {{ $t('document.editModal.confirmationMessage') }} {{ $t(formatarTipoDocumento(TipoDocumento)) }}?
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
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 
        transition cursor-pointer"
        :disabled="carregando" 
        @click="salvar"
      >
        {{ $t('document.editModal.editButton') }}
      </button>
    </div>
    
  </modal>
</template>