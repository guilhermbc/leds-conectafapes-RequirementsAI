<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarModulo,
  excluirModulos,
} from '../controllers/modulo'
import type { Modulo } from '../types/modulo'



const ui = useUiStore()
const headers = [
    { value: 'nome', title: 'nome' },
    { value: 'descricao', title: 'descricao' }

]
const items = ref<Modulo[]>([])

const carregarModulos = async () => {
  const modulo = await listarModulo()
  items.value = modulo
}

const router = useRouter()
const editarModulo = (cls: Modulo) => {
  router.push({ name: 'modulo-criar', params: { id: cls.Id }})
}

const excluirmodulo = async (cls: Modulo[]) => {
  const ids = cls.map((a) => a.Id)
  await excluirModulos(ids)
  await carregarModulos()
}

onBeforeMount(carregarModulos)
</script>

<template>
  <data-table
    :headers="headers"
    :items="items"
    @editar="editarModulo"
    @excluir="excluirmodulo"
  />
</template>