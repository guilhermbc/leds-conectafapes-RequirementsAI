<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { criarModulo, atualizarModulo } from "../controllers/modulo"
import type { Modulo } from "../types/modulo"
import type { Documento } from "@/modules/Documento/types/documento"
import { useUiStore } from "@/stores/ui"

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

const ui = useUiStore()

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

const updateNomeValido = (v: boolean) => (nomeValido.value = v)

// Quando receber um modulo, carregar os dados
watch(
  () => props.modulo,
  (novo) => {
    if (novo) {
      id.value = novo.id
      nome.value = novo.nome
      descricao.value = novo.descricao
      modulo_documento.value = novo.modulo_documento
      projeto.value = novo.projeto as string
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
        projeto: props.projetoId as string
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
      {{ modo === "criar" ? "Criar Módulo" : "Editar Módulo" }}
    </h2>

    <h3 class="font-semibold">Nome:</h3>
    <text-input
      class="w-full"
      placeholder="Nome"
      v-model="nome"
    />

    <h3 class="font-semibold">Descrição:</h3>
    <text-input
      class="w-full"
      placeholder="Descrição"
      v-model="descricao"
    />

    <div class="flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        Cancelar
      </button>

      <button
        class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 
        transition cursor-pointer"
        :disabled="carregando" 
        @click="salvar"
      >
        {{ modo === "criar" ? "Criar" : "Atualizar" }}
      </button>
    </div>
  </modal>
</template>
