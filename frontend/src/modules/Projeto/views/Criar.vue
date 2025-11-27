<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { criarProjeto, atualizarProjeto } from "../controllers/projeto"
import type { Projeto } from "../types/projeto"
import type { Modulo } from "@/modules/Modulo/types/modulo"
import { useUiStore } from "@/stores/ui"

const props = defineProps<{
  modelValue: boolean
  projeto?: Projeto
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
const projeto_modulo = ref<Modulo[]>([])

const nomeValido = ref(false)

// Regras
const primeiraMaiuscula = (valor: string) =>
  /^[A-Z]/.test(valor) || "O nome deve começar com letra maiúscula"

const regrasNome = [primeiraMaiuscula]

const updateNomeValido = (v: boolean) => (nomeValido.value = v)

// Quando receber um projeto, carregar os dados
watch(
  () => props.projeto,
  (novo) => {
    if (novo) {
      id.value = novo.id
      nome.value = novo.nome
      descricao.value = novo.descricao
      projeto_modulo.value = novo.projeto_modulo
    } else {
      // Modo criar → limpar campos
      id.value = ""
      nome.value = ""
      descricao.value = ""
      projeto_modulo.value = []
    }
  },
  { immediate: true }
)

const modo = computed(() => (props.projeto ? "editar" : "criar"))

const carregando = ref(false)

// Métodos ------------------------------------------------------

const salvar = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    if (!nomeValido.value) {
      ui.exibirAlerta({
        color: "error",
        text: "Por favor corrija os campos inválidos."
      })
      return
    }

    let sucesso = false

    if (modo.value === "criar") {
      sucesso = await criarProjeto({
        nome: nome.value,
        descricao: descricao.value,
        projeto_modulo: projeto_modulo.value
      })
    } else {
      sucesso = await atualizarProjeto({
        id: id.value,
        nome: nome.value,
        descricao: descricao.value,
        projeto_modulo: projeto_modulo.value
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
      {{ modo === "criar" ? "Criar Projeto" : "Editar Projeto" }}
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
      <p-button class= "bg-red-700 "color="secondary" @click="close">Cancelar</p-button>

      <p-button :disabled="carregando" @click="salvar">
        {{ modo === "criar" ? "Registrar" : "Atualizar" }}
      </p-button>
    </div>
  </modal>
</template>
