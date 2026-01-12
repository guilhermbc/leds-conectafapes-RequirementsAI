<script setup lang="ts">
import { ref, watch} from "vue"
import { excluirProjeto } from "../controllers/projeto"
import type { Projeto } from "../types/projeto"

const props = defineProps<{
  modelValue: boolean
  projeto?: Projeto
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "excluido"): void
}>()

const close = () => emit("update:modelValue", false)

// Campos
const id = ref("")
const nome = ref("")

// Quando receber um projeto, carregar os dados
watch(
  () => props.projeto,
  (novo) => {
    if (novo) {
      id.value = novo.id
      nome.value = novo.nome
    } 
  },
  { immediate: true }
)

const carregando = ref(false)

// Métodos ------------------------------------------------------

const excluir = async () => {
  if (carregando.value) return

  carregando.value = true

  try{
    let sucesso = false

    sucesso = await excluirProjeto(id.value)
   
    if (sucesso) {
      emit("excluido")
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
      Excluir Projeto
    </h2>

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        Deseja mesmo excluir "{{ projeto?.nome }}"?
      </h3>
    </div>


    <div class="flex justify-end gap-3">
      <p-button
      @click="close"
      >
        Cancelar
      </p-button>

      <p-button :disabled="carregando" @click="excluir" class="bg-red-700">
        Excluir
      </p-button>
    </div>
  </modal>
</template>
