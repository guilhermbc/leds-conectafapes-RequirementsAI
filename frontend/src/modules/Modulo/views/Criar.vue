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
    if (!nomeValido.value) {
      console.log("Passei aqui")
      ui.exibirAlerta({
        color: "error",
        text: "Por favor corrija os campos inválidos."
      })
      return
    }

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

    <text-input
      class="w-full mb-2"
      placeholder="Nome"
      v-model="nome"
      :rules="regrasNome"
      @validationUpdate="updateNomeValido"
    />

    <text-input
      class="w-full mb-4"
      placeholder="Descrição"
      v-model="descricao"
    />

    <div class="flex justify-end gap-3">
      <p-button class="bg-red-700" color="secondary" @click="close">Cancelar</p-button>

      <p-button :disabled="carregando" @click="salvar">
        {{ modo === "criar" ? "Registrar" : "Atualizar" }}
      </p-button>
    </div>
  </modal>
</template>
