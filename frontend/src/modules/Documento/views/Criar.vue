<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import type { Documento } from '../types/documento'
import {
  criarDocumento,
  obterDocumento,
  atualizarDocumento,
  listarDocumento
} from '../controllers/documento'
import { formatarTipoDocumento, formatarVersao, incrementarVersaoMaior } from '@/utils/formatacoesDocumentos';

const props = defineProps<{
  modelValue: boolean
  moduloId?: string | number
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

// Arrays p/ armazenarem as versões dos documentos p/ escolha nos dropdowns
const minimundos = ref<Documento[]>([])
const requisitos = ref<Documento[]>([])
const casosDeUso = ref<Documento[]>([])
const diagramasDeClasses = ref<Documento[]>([])
const prototiposDeInterface = ref<Documento[]>([])

// Refs p/ armazenarem os documentos de origem escolhidos
const minimundo_origem = ref('')
const requisito_origem = ref('')
const casoDeUso_origem = ref('')
const diagramaDeClasse_origem = ref('')
// const prototipoDeInterface_origem = ref('')

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

// Recarrega a lista de documentos ao abrir o modal
watch(
  () => props.modelValue,
  (novoValor) => {
    if (novoValor) {
      carregarDocumentos()
    }
  }
)

// Reseta os campos ao mudar a categoria
watch(
  () => categoriaEscolhida.value,
  () => {
    origemAudio.value = ''
    minimundo_origem.value = ''
    requisito_origem.value = ''
    casoDeUso_origem.value = ''
    diagramaDeClasse_origem.value = ''
  }
)

// Métodos ------------------------------------------------------

const carregarDocumentos = async () => {
  const documentos = await listarDocumento()

  minimundos.value = []
  requisitos.value = []
  casosDeUso.value = []
  diagramasDeClasses.value = []
  prototiposDeInterface.value = []

  for (const documento of documentos) {
    if (documento.Modulo.id === props.moduloId) {
      if (documento.TipoDocumento === 'MINIMUNDO') {
        minimundos.value.unshift(documento)
      } else if (documento.TipoDocumento === 'REQUISITOS') {
        requisitos.value.unshift(documento)
      } else if (documento.TipoDocumento === 'CASO_USO') {
        casosDeUso.value.unshift(documento)
      } else if (documento.TipoDocumento === 'DIAGRAMA_CLASSE') {
        diagramasDeClasses.value.unshift(documento)
      } else if (documento.TipoDocumento === 'PROTOTIPO_INTERFACE') {
        prototiposDeInterface.value.unshift(documento)
      }
    }
  }
}

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

    if (minimundo_origem.value !== '') {
      DocumentoOrigem.value.push(Number(minimundo_origem.value))
    }
    if (requisito_origem.value !== '') {
      DocumentoOrigem.value.push(Number(requisito_origem.value))
    }
    if (casoDeUso_origem.value !== '') {
      DocumentoOrigem.value.push(Number(casoDeUso_origem.value))
    }
    if (diagramaDeClasse_origem.value !== '') {
      DocumentoOrigem.value.push(Number(diagramaDeClasse_origem.value))
    }

    sucesso = await criarDocumento({
      versao: '1.0',
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
      <select
        v-model="minimundo_origem"
        class="block w-full p-2 border rounded my-1 mb-3"
      >
        <option disabled value="">Selecione um tipo...</option>
        <option v-for="minimundo in minimundos" :key="minimundo.id" :value="minimundo.id">
          Minimundo (v{{ minimundo.versao }})
        </option>
      </select>
    </div>

    <!-- Seleção de Requisitos -->
    <div v-if="TipoDocumento === 'CASO_USO' || TipoDocumento === 'DIAGRAMA_CLASSE' || TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Requisitos de origem:</h3>
      <select
        v-model="requisito_origem"
        class="block w-full p-2 border rounded my-1 mb-3"
      >
        <option disabled value="">Selecione um tipo...</option>
        <option v-for="requisito in requisitos" :key="requisito.id" :value="requisito.id">
          Requisitos (v{{ requisito.versao }})
        </option>
      </select>
    </div>

    <!-- Seleção de Casos de Uso -->
    <div v-if="TipoDocumento === 'DIAGRAMA_CLASSE' || TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Casos de uso de origem:</h3>
      <select
        v-model="casoDeUso_origem"
        class="block w-full p-2 border rounded my-1 mb-3"
      >
        <option disabled value="">Selecione um tipo...</option>
        <option v-for="casoDeUso in casosDeUso" :key="casoDeUso.id" :value="casoDeUso.id">
          Casos de Uso (v{{ casoDeUso.versao }})
        </option>
      </select>
    </div>

    <!-- Seleção de Diagrama de Classe -->
    <div v-if="TipoDocumento === 'PROTOTIPO_INTERFACE'">
      <h3 class="font-semibold">Diagrama de classe de origem:</h3>
      <select
        v-model="diagramaDeClasse_origem"
        class="block w-full p-2 border rounded my-1 mb-3"
      >
        <option disabled value="">Selecione um tipo...</option>
        <option v-for="diagramaDeClasse in diagramasDeClasses" :key="diagramaDeClasse.id" :value="diagramaDeClasse.id">
          Casos de Uso (v{{ diagramaDeClasse.versao }})
        </option>
      </select>
    </div>

    <div class="flex justify-end gap-3">
      <p-button class="bg-red-700" color="secondary" @click="close">
        Cancelar
      </p-button>

      <p-button 
        :disabled="carregando
        || TipoDocumento === ''
        || TipoDocumento === 'MINIMUNDO' && origemAudio === '' 
        || (TipoDocumento === 'REQUISITOS' && minimundo_origem === '') 
        || (TipoDocumento === 'CASO_USO' && (minimundo_origem === '' || requisito_origem === '')) 
        || (TipoDocumento === 'DIAGRAMA_CLASSE' && (minimundo_origem === '' || requisito_origem === '' || casoDeUso_origem === '')) 
        || (TipoDocumento === 'PROTOTIPO_INTERFACE' && (requisito_origem === '' || casoDeUso_origem === '' || diagramaDeClasse_origem === '' ))" 
        @click="salvar"
      >
        Registrar
      </p-button>
    </div>
  </modal>
</template>