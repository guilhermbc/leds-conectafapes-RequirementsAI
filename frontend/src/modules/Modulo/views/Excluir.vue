<script setup lang="ts">
import { ref, watch} from "vue"
import { excluirModulo } from "../controllers/modulo"
import type { Modulo } from "@/modules/Modulo/types/modulo"

const props = defineProps<{
  modelValue: boolean
  modulo?: Modulo
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value:boolean): void
  (e: "excluido"): void
}>()

const close = () => emit("update:modelValue", false)

// Campos
const id = ref("")
const nome = ref("")

// Quando receber um modulo, carregar os dados
watch(
  () => props.modulo,
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

    sucesso = await excluirModulo(id.value)
   
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
      Excluir Módulo
    </h2>

    <div>
      <h3 class="text-lg text-center font-semibold my-4"> 
        Deseja mesmo excluir "{{ modulo?.nome }}"?
      </h3>
    </div>

    <div class="flex justify-end gap-3">
      <button 
        class="px-4 py-2 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white 
        transition cursor-pointer" 
        @click="close"
      >
        Cancelar
      </button>

      <button
        class="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 
        transition cursor-pointer"
        :disabled="carregando" 
        @click="excluir" 
      >
        Excluir
      </button>
    </div>
  </modal>
</template>
