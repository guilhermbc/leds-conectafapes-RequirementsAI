<script setup lang="ts">
import { ref, watch} from 'vue'
import {
  criarDocumento,
  obterDocumento,
} from '../controllers/documento'
import { formatarTipoDocumento } from '@/utils/formatacoesDocumentos'

const props = defineProps<{
  modelValue: boolean
  documentoId?: string | number
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
const DocumentoOrigem = ref<number[]>([])

const carregando = ref(false)

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
  id.value = documento.id
  vMajor.value = documento.vMajor
  vMinor.value = documento.vMinor
  origemAudio.value = documento.origemAudio
  TipoDocumento.value = documento.TipoDocumento
  Modulo.value = documento.Modulo.id
  DocumentoOrigem.value = documento.DocumentoOrigem
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

    sucesso = await criarDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: true,
      arquivo: '',
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
    <h2 class="text-xl font-bold mb-4">Gerar Nova Versão do Documento</h2>

    <div v-if="TipoDocumento == 'MINIMUNDO'" class="">
      <h3 class="font-semibold">Áudio de origem (mudança opcional):</h3>
      <generic-text-input
      class="w-full mt-1"
      placeholder="Áudio de origem"
      v-model="origemAudio"
      />
    </div>

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