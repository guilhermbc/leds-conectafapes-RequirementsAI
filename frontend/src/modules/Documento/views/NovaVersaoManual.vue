<script setup lang="ts">
import { ref, watch} from 'vue'
import {
  criarDocumento,
  obterDocumento,
} from '../controllers/documento'
import { formatarTipoDocumento, formatarVersao} from '@/utils/formatacoesDocumentos';

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
const origemAudio = ref('')
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
  id.value = documento.id
  vMajor.value = documento.vMajor
  vMinor.value = documento.vMinor
  origemAudio.value = documento.origemAudio
  TipoDocumento.value = documento.TipoDocumento
  Modulo.value = documento.Modulo.id
  DocumentoAnterior.value = documento.DocumentoAnterior
  DocumentoOrigem.value = documento.DocumentoOrigem
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const result = e.target?.result
    conteudoMarkdown.value = typeof result === 'string' ? result : ''
    console.log("MD carregado:", conteudoMarkdown.value)
  }

  reader.readAsText(file)
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

    sucesso = await criarDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: false,
      arquivo: conteudoMarkdown.value,
      origemAudio: origemAudio.value,
      TipoDocumento: TipoDocumento.value,
      DocumentoAnterior: id.value,
      Modulo: Modulo.value,
      DocumentoOrigem: DocumentoOrigem.value,
    })

    emit("salvo")
    close()
    
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 class="text-xl font-bold mb-4"> Editar Documento </h2>

    <h3 class="font-semibold">
      Novo conteúdo do documento: 
    </h3>

    <!-- INPUT ESTILIZADO -->
    <label
      class="my-4 flex flex-col items-center justify-center w-full h-32 px-4 
             border-2 border-dashed border-gray-400 rounded-xl cursor-pointer 
             hover:bg-gray-100 transition"
    >
      <span class="text-gray-700 font-medium">Clique para selecionar um arquivo Markdown</span>
      <span class="text-xs text-gray-500">(.md ou .markdown)</span>

      <input
        type="file"
        class="hidden"
        accept=".md,.markdown,text/markdown"
        @change="onFileSelected"
      />
    </label>

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        Deseja mesmo gerar uma nova versão de {{ formatarTipoDocumento(TipoDocumento) }}?
      </h3>
    </div>

    <div class="flex justify-end gap-3">
      <p-button class="bg-red-700" color="secondary" @click="close">
        Cancelar
      </p-button>

      <p-button :disabled="carregando" @click="salvar">
        Confirmar
      </p-button>
    </div>
    
  </modal>
</template>