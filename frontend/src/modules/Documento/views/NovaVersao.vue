<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import type { Documento } from '../types/documento'
import {
  criarDocumento,
  obterDocumento,
} from '../controllers/documento'
import { incrementarVersaoMaior, formatarTipoDocumento } from '@/utils/formatacoesDocumentos'

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
const versao = ref('')
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
      carregarDocumentos()
    }
  }
)

// Métodos ------------------------------------------------------

const carregarDocumentos = async () => {
  const documento = await obterDocumento(props.documentoId as string)

  // Campos necessários para a nova versão
  id.value = documento.id
  versao.value = documento.versao
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

    // Coloquei aqui para não travar a UI caso demore a criar o documento
    emit("salvo")
    close()

    sucesso = await criarDocumento({
      versao: incrementarVersaoMaior(versao.value),
      geradoIA: true,
      arquivo: '',
      origemAudio: origemAudio.value,
      TipoDocumento: TipoDocumento.value,
      DocumentoAnterior: id.value,
      Modulo: Modulo.value,
      DocumentoOrigem: DocumentoOrigem.value,
    })
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
        Gerando {{ formatarTipoDocumento(TipoDocumento) }} (v{{ incrementarVersaoMaior(versao) }}) </h3>
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