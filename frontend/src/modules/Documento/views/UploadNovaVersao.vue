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

const close = () => {
  if (carregando.value) return
  emit("update:modelValue", false)
}

const closeForced = () => {
  emit("update:modelValue", false)
}

// Campos do documento
const id = ref('')
const vMajor = ref()
const vMinor = ref()
const arquivoAudio = ref<File | null>(null)
const TipoDocumento = ref('')
const Modulo = ref('')
const DocumentoAnterior = ref('')
const DocumentoOrigem = ref<number[]>([])
const parUC_CDId = ref('')
const parUC_CDArquivo = ref('')
const TipoDocumentoAction = ref<'ATUALIZAR' | 'SIMPLES'>('ATUALIZAR')

const arquivoSelecionado = ref<File | null>(null)
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
  DocumentoAnterior.value = typeof documento.DocumentoAnterior === 'object'
    ? documento.DocumentoAnterior?.id ?? ''
    : documento.DocumentoAnterior ?? ''
  DocumentoOrigem.value = []
  parUC_CDId.value = typeof documento.parUC_CD === 'object' && documento.parUC_CD !== null
    ? (documento.parUC_CD as any).id ?? ''
    : documento.parUC_CD ?? ''
  parUC_CDArquivo.value = typeof documento.parUC_CD === 'object' && documento.parUC_CD !== null
    ? (documento.parUC_CD as any).arquivo ?? ''
    : ''
  TipoDocumentoAction.value = 'ATUALIZAR'

  for (const docOrigem of documento.DocumentoOrigem) {
    DocumentoOrigem.value.push(docOrigem.id)
  }
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return

  const isTexto =
    file.type.startsWith('text/') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.markdown') ||
    file.name.endsWith('.txt')

  if (!isTexto) {
    alert('Selecione um arquivo de texto válido')
    return
  }

  arquivoSelecionado.value = file

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
  let TipoDocumentoParaEnviar = TipoDocumento.value

  try {
    if (TipoDocumento.value === 'CASO_USO' || TipoDocumento.value === 'DIAGRAMA_CLASSE') {
      TipoDocumentoParaEnviar = `${TipoDocumento.value}_${TipoDocumentoAction.value}`
    }
    // Upload de Nova Versão
    let formDataToSend = criarFormDataDocumento({
      vMajor: vMajor.value,
      vMinor: vMinor.value,
      geradoIA: false,
      arquivo: conteudoMarkdown.value,
      // arquivoAudio: arquivoAudio.value,
      
      // CASO_USO_ATUALIZAR, CASO_USO_SIMPLES, DIAGRAMA_CLASSE_ATUALIZAR, DIAGRAMA_CLASSE_SIMPLES
      // ATUALIZAR = usar IA para atualizar o par UC/CD relacionado, SIMPLES = não usar IA, apenas incrementar a versão do par UC/CD relacionado
      TipoDocumento: TipoDocumentoParaEnviar,
      DocumentoAnterior: id.value,
      Modulo: Modulo.value,
      DocumentoOrigem: DocumentoOrigem.value,
    })

    let response = await criarDocumento(formDataToSend)
    console.log('Resposta da criação de documento:', response)

    // if (response && response.status === 201) {
    //   // Atualização do par UC/CD relacionado, caso seja um documento de Caso de Uso ou Diagrama de Classe
    //   if (TipoDocumento.value === 'CASO_USO' || TipoDocumento.value === 'DIAGRAMA_CLASSE') {
    //     let arquivoParaEnviar = conteudoMarkdown.value
    //     let tipoDocumentoParaEnviar = ''

    //     let geradoIAEnviar = false
    //     // Usar IA para atualizar o par UC/CD relacionado
    //     if (TipoDocumentoAction.value === 'ATUALIZAR') {
    //       arquivoParaEnviar = ''
    //       geradoIAEnviar = true
    //     }
    //     // Não usar IA, apenas incrementar a versão do par UC/CD relacionado
    //     else {
    //       arquivoParaEnviar = parUC_CDArquivo.value
    //       geradoIAEnviar = false
    //     }

    //     // Definir o tipo do documento a ser enviado
    //     if (TipoDocumento.value === 'CASO_USO') {
    //       tipoDocumentoParaEnviar = 'DIAGRAMA_CLASSE'
    //     } else {
    //       tipoDocumentoParaEnviar = 'CASO_USO'
    //     }

    //     const parId = parUC_CDId.value

    //     if (TipoDocumento.value === 'CASO_USO') {
    //       tipoDocumentoParaEnviar = 'DIAGRAMA_CLASSE'
    //     } else {
    //       tipoDocumentoParaEnviar = 'CASO_USO'
    //     }

    //     formDataToSend = criarFormDataDocumento({
    //     vMajor: vMajor.value,
    //     vMinor: vMinor.value,
    //     geradoIA: geradoIAEnviar,
    //     arquivo: arquivoParaEnviar,
    //     // arquivoAudio: arquivoAudio.value,
    //     TipoDocumento: tipoDocumentoParaEnviar,
    //     DocumentoAnterior: parId,
    //     parUC_CD: response.data.id,
    //     Modulo: Modulo.value,
    //     DocumentoOrigem: DocumentoOrigem.value,
    //   })
    // }

    if (response) {
      emit("salvo")
      closeForced()
    }
  }
  finally {
    carregando.value = false
  }
}
</script>

<template>
<modal v-model="props.modelValue" @close="close" :disableClose="carregando">
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
      <div v-if="!conteudoMarkdown" class="text-center">
        <p class="text-gray-700 font-medium"> {{ $t('document.editModal.contentLabel') }} </p >
        <p  class="text-xs text-gray-500">({{ $t('document.editModal.contentLabel2') }}) </p >
      </div>

      <div v-else>
        <p class="text-gray-700 font-medium">{{ arquivoSelecionado?.name }}</p>
      </div>

      <input
        type="file"
        class="hidden"
        accept=".md,.markdown,text/markdown"
        @change="onFileSelected"
      />
    </label>

    <div v-if="TipoDocumento === 'CASO_USO' || TipoDocumento === 'DIAGRAMA_CLASSE'" class="mb-4 rounded-lg border border-gray-300 p-4 bg-gray-50">
      <p v-if="TipoDocumento === 'CASO_USO'" class="font-medium mb-3"> {{ $t('document.editModal.updateCDChoicesTitle') }}</p>
      <p v-else="TipoDocumento === 'DIAGRAMA_CLASSE'" class="font-medium mb-3"> {{ $t('document.editModal.updateUCChoicesTitle') }}</p>
      <label class="block mb-4 cursor-pointer">
        <input type="radio" value="ATUALIZAR" v-model="TipoDocumentoAction" class="mr-3 mt-1 float-left" />
        
        <span class="text-base leading-relaxed">
          {{ $t('document.editModal.updateAI') }}
          <span class="font-bold">{{ $t('document.editModal.updateAIBold') }}</span>
        </span>
      </label>

      <label class="block cursor-pointer">
        <input type="radio" value="SIMPLES" v-model="TipoDocumentoAction" class="mr-3 mt-1 float-left" />
        
        <span class="text-base leading-relaxed">
          {{ $t('document.editModal.updateSimple') }}
          <span class="font-bold">{{ $t('document.editModal.updateSimpleBold') }}</span>
        </span>
      </label>
    </div>

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