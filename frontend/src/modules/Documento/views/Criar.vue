<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import type { Documento } from '../types/documento'
import { criarDocumento } from '../controllers/documento'
import { listarUltimosDocumentos } from '@/modules/Modulo/controllers/modulo';
import { formatarTipoDocumento, formatarVersao } from '@/utils/formatacoesDocumentos';

const props = defineProps<{
  modelValue: boolean
  moduloId: Number | string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const close = () => emit("update:modelValue", false)

// Campos do documento
// const id = ref('')
// const versao = ref('1.0')
// const geradoIA = ref<boolean>(true)
// const arquivo = ref('')
const origemAudio = ref('')
// TipoDocumento será computed
// const DocumentoAnterior = ref('')
// const Modulo = ref(props.moduloId as string)
const DocumentoOrigem = ref<number[]>([])

const categoriasDropdown = [
  "Minimundo",
  "Requisitos",
  "Casos de Uso",
  "Diagrama de Classes",
  "Protótipo de Interface"
]

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
    case 'Minimundo':
      return 'MINIMUNDO'
    case 'Requisitos':
      return 'REQUISITOS'
    case 'Casos de Uso':
      return 'CASO_USO'
    case 'Diagrama de Classes':
      return 'DIAGRAMA_CLASSE'
    case 'Protótipo de Interface':
      return 'PROTOTIPO_INTERFACE'
    default:
      return ''
  }
})

const isDisabled = computed(() => {
  return carregando.value
    || (TipoDocumento.value === '')
    || (TipoDocumento.value === 'MINIMUNDO' && origemAudio.value === '')
    || (TipoDocumento.value === 'REQUISITOS' && minimundo_origem.value === null) 
    || (TipoDocumento.value === 'CASO_USO' && (minimundo_origem.value === null || requisito_origem.value === null)) 
    || (TipoDocumento.value === 'DIAGRAMA_CLASSE' && (minimundo_origem.value === null || requisito_origem.value === null || casoDeUso_origem.value === null)) 
    || (TipoDocumento.value === 'PROTOTIPO_INTERFACE' && (requisito_origem.value === null || casoDeUso_origem.value === null || diagramaDeClasse_origem.value === null))
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
  origemAudio.value = ''
  minimundo_origem.value = null
  requisito_origem.value = null
  casoDeUso_origem.value = null
  diagramaDeClasse_origem.value = null
  prototipoDeInterface_origem.value = null

  const ultimosDocumentos = await listarUltimosDocumentos(props.moduloId as string)

  for (const documento of ultimosDocumentos) {
     if (documento.TipoDocumento === 'MINIMUNDO') {
      minimundo_origem.value = documento
    } else if (documento.TipoDocumento === 'REQUISITOS') {
      requisito_origem.value = documento
    } else if (documento.TipoDocumento === 'CASO_USO') {
      casoDeUso_origem.value = documento
    } else if (documento.TipoDocumento === 'DIAGRAMA_CLASSE') {
      diagramaDeClasse_origem.value = documento
    } else if (documento.TipoDocumento === 'PROTOTIPO_INTERFACE') {
      prototipoDeInterface_origem.value = documento
    }
  }
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

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

    sucesso = await criarDocumento({
      vMajor: 1,
      vMinor: 0,
      geradoIA: true,
      arquivo: '',
      origemAudio: origemAudio.value,
      TipoDocumento: TipoDocumento.value,
      DocumentoAnterior: null,
      Modulo: props.moduloId as string,
      DocumentoOrigem: DocumentoOrigem.value,
    })
    emit('salvo')
    close()
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 class="text-xl font-bold mb-4"> Criar Documento </h2>

    <h3 class="font-semibold">Tipo do documento:</h3>

    <!-- Dropdown com os tipos de documento -->
    <select
      v-model="categoriaEscolhida"
      class="block w-full p-2 border rounded my-1 mb-3"
    >
      <option disabled value="">Selecione um tipo...</option>
      <option v-for="item in categoriasDropdown" :key="item" :value="item">
        {{ item }}
      </option>
    </select>

    <!-- Escolha de áudio de origem para Minimundo -->
    <div v-if="TipoDocumento === 'MINIMUNDO'">
      <h3 class="font-semibold">Áudio de origem:</h3>
      <text-input
      class="w-full"
      placeholder="Áudio de origem"
      v-model="origemAudio"
      />
    </div>

    <!-- Seleção de Minimundo -->
    <div v-if="TipoDocumento === 'REQUISITOS' || TipoDocumento === 'CASO_USO' || TipoDocumento === 'DIAGRAMA_CLASSE'">
      <h3 class="font-semibold">Minimundo de origem:</h3>
      <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
        <div v-if="minimundo_origem !== null">
          {{ formatarTipoDocumento(minimundo_origem?.TipoDocumento) }} (v{{ formatarVersao(minimundo_origem?.vMajor, minimundo_origem?.vMinor) }})
        </div>
        <div v-else class="text-gray-500 italic">
          Nenhum documento disponível.
        </div>
      </div>
    </div>

    <!-- Seleção de Requisitos -->
    <div v-if="TipoDocumento === 'CASO_USO' || TipoDocumento === 'DIAGRAMA_CLASSE' || TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Requisitos de origem:</h3>
      <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
        <div v-if="requisito_origem !== null">
          {{ formatarTipoDocumento(requisito_origem?.TipoDocumento) }} (v{{ formatarVersao(requisito_origem?.vMajor, requisito_origem?.vMinor) }})
        </div>
        <div v-else class="text-gray-500 italic">
          Nenhum documento disponível.
        </div>
      </div>
    </div>

    <!-- Seleção de Casos de Uso -->
    <div v-if="TipoDocumento === 'DIAGRAMA_CLASSE' || TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Casos de uso de origem:</h3>
      <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
        <div v-if="casoDeUso_origem !== null">
          {{ formatarTipoDocumento(casoDeUso_origem?.TipoDocumento) }} (v{{ formatarVersao(casoDeUso_origem?.vMajor, casoDeUso_origem?.vMinor) }})
        </div>
        <div v-else class="text-gray-500 italic">
          Nenhum documento disponível.
        </div>
      </div>
    </div>

    <!-- Seleção de Diagrama de Classe -->
    <div v-if="TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Diagrama de classe de origem:</h3>
      <div class="py-2 px-3 mt-1 mb-2 border border-gray-700 rounded">
        <div v-if="diagramaDeClasse_origem !== null">
          {{ formatarTipoDocumento(diagramaDeClasse_origem?.TipoDocumento) }} (v{{ formatarVersao(diagramaDeClasse_origem?.vMajor, diagramaDeClasse_origem?.vMinor) }})
        </div>
        <div v-else class="text-gray-500 italic">
          Nenhum documento disponível.
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        Cancelar
      </button>

      <button
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer
        disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:opacity-70"
        :disabled="isDisabled" 
        @click="salvar"
      >
        Criar
      </button>
    </div>
  </modal>
</template>