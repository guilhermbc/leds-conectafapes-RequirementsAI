<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obterDocumento } from '../controllers/documento'
import { listarUltimosDocumentos } from '@/modules/Modulo/controllers/modulo';
import { criarFormDataDocumento } from '@/utils/formatacoesDocumentos'
import type { Documento } from '../types/documento';
import { useLoadingStore } from '@/stores/loading'
import { useDocumentGenerationStore } from '@/stores/documentGeneration'

const loading = useLoadingStore()
const store = useDocumentGenerationStore()

const props = defineProps<{
  modelValue: boolean
  documentoId?: string | number
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const router = useRouter()
const close = () => emit("update:modelValue", false)

// Campos do documento
const id = ref('')
const vMajor = ref()
const vMinor = ref()
const arquivoAudio = ref<File | null>(null)
const TipoDocumento = ref('')
const Modulo = ref('')
const DocumentoOrigem = ref<number[]>([])

const ultimosDocumentosModulo = ref<Documento[]>([])

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

  DocumentoOrigem.value = []
  for (const docOrigem of documento.DocumentoOrigem) {
    if (docOrigem.id !== undefined) {
      DocumentoOrigem.value.push(Number(docOrigem.id))
    }
  }

  ultimosDocumentosModulo.value = await listarUltimosDocumentos(Modulo.value)
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true
  loading.start('document.notification.loading')

  try {
    let documentoAnteriorId: string | number | null = null
    let tipoDocumentoParaEnviar = TipoDocumento.value
    let documentoOrigemIds: Array<string | number> = DocumentoOrigem.value

    if (TipoDocumento.value === 'MINIMUNDO') {
      tipoDocumentoParaEnviar = 'REQUISITOS'
      documentoAnteriorId = ultimosDocumentosModulo.value.find(
        (documento) => documento.TipoDocumento === 'REQUISITOS'
      )?.id ?? null
      documentoOrigemIds = [id.value]
    } else if (TipoDocumento.value === 'REQUISITOS') {
      tipoDocumentoParaEnviar = 'CASO_USO_E_DIAGRAMA_CLASSE'
      const casoUso = ultimosDocumentosModulo.value.find(
        (documento) => documento.TipoDocumento === 'CASO_USO'
      )
      const diagramaClasse = ultimosDocumentosModulo.value.find(
        (documento) => documento.TipoDocumento === 'DIAGRAMA_CLASSE'
      )

      if (casoUso && diagramaClasse) {
        documentoAnteriorId = casoUso.id ?? null
      } else {
        documentoAnteriorId = null
      }
      documentoOrigemIds = [...DocumentoOrigem.value, id.value]
    }
    
    const formDataToSend = criarFormDataDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: true,
      arquivo: '',
      // arquivoAudio: arquivoAudio.value,
      TipoDocumento: tipoDocumentoParaEnviar,
      DocumentoAnterior: documentoAnteriorId,
      Modulo: Modulo.value,
      DocumentoOrigem: documentoOrigemIds,
    })

    await store.generate(formDataToSend)
    emit('salvo')
    close()

  } finally {
    carregando.value = false
    loading.stop()
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 v-if="TipoDocumento == 'MINIMUNDO'" class="text-xl font-bold mb-4">{{ $t('document.generateNewRequirements') }}</h2>
    <h2 v-if="TipoDocumento == 'REQUISITOS'" class="text-xl font-bold mb-4">{{ $t('document.generateNewUCandCD') }}</h2>

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        {{ $t('document.newAIVersionModal.confirmationMessage') }} 
        
        <span v-if="TipoDocumento == 'MINIMUNDO'">{{ $t('document.requirements') }}?</span>
        <span v-if="TipoDocumento == 'REQUISITOS'">{{ $t('document.UCandCD') }}?</span>
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