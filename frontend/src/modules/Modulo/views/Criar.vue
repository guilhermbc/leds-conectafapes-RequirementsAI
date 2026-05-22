<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { criarModulo, atualizarModulo } from "../controllers/modulo"
import type { Modulo } from "../types/modulo"
import type { Documento } from "@/modules/Documento/types/documento"

const props = defineProps<{
  modelValue: boolean
  modulo?: Modulo
  projetoId?: string | number
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "salvo"): void
}>()

const close = () => emit("update:modelValue", false)

// Campos
const id = ref("")
const nome = ref("")
const descricao = ref("")
const modulo_documento = ref<Documento[]>([])
const projeto = ref(props.projetoId as string)

const nomeValido = ref(false)

// Regras
const primeiraMaiuscula = (valor: string) =>
  /^[A-Z]/.test(valor) || "O nome deve começar com letra maiúscula"

const regrasNome = [primeiraMaiuscula]

// Quando receber um modulo, carregar os dados
watch(
  () => props.modulo,
  (novo) => {
    if (novo) {
      id.value = novo.id
      nome.value = novo.nome
      descricao.value = novo.descricao
      modulo_documento.value = novo.modulo_documento
      projeto.value = novo.Projeto as string
      // Validar o nome carregado
      nomeValido.value = regrasNome.every((regra) => regra(novo.nome) === true)
    } else {
      // Modo criar → limpar campos
      id.value = ""
      nome.value = ""
      descricao.value = ""
      modulo_documento.value = []
      projeto.value = props.projetoId as string
      nomeValido.value = false
    }
  },
  { immediate: true }
)

const modo = computed(() => (props.modulo ? "editar" : "criar"))

const carregando = ref(false)

const podeSalvar = computed(() => nome.value.trim().length > 0 && !carregando.value)

// Métodos ------------------------------------------------------

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

    if (modo.value === "criar") {
      sucesso = await criarModulo({
        nome: nome.value,
        descricao: descricao.value,
        Projeto: props.projetoId as string
      })
    } else {
      sucesso = await atualizarModulo({
        id: id.value,
        nome: nome.value,
        descricao: descricao.value,
        modulo_documento: modulo_documento.value,
        Projeto: props.projetoId as string
      })
    }

    if (sucesso) {
      emit("salvo")
      close()
    }
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <modal v-model="props.modelValue" @close="close">
    <h2 class="text-xl font-bold mb-4">
      {{ modo === "criar" ? $t('module.createModal.title') : $t('module.editModal.title') }}
    </h2>

    <h3 class="font-semibold">{{ $t('module.createModal.name') }}:</h3>
    <text-input
      class="w-full"
      :placeholder="$t('module.createModal.name')"
      v-model="nome"
    />

    <h3 class="font-semibold">{{ $t('module.createModal.description') }}:</h3>
    <text-input
      class="w-full"
      :placeholder="$t('module.createModal.description')"
      v-model="descricao"
    />

    <div class="flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        {{ $t('module.cancel') }}
      </button>

      <button
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 
        transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!podeSalvar" 
        @click="salvar"
      >
        {{ modo === "criar" ? $t('module.createModal.createButton') : $t('module.editModal.editButton') }}
      </button>
    </div>
  </modal>
</template>
