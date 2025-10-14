<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarProjeto,
  excluirProjetos,
} from '../controllers/projeto'
import type { Projeto } from '../types/projeto'



const ui = useUiStore()
const headers = [
    { value: 'nome', title: 'nome' },
    { value: 'descricao', title: 'descricao' }

]
const items = ref<Projeto[]>([])

const carregarProjetos = async () => {
  const projeto = await listarProjeto()
  items.value = projeto
}

const router = useRouter()
const editarProjeto = (cls: Projeto) => {
  router.push({ name: 'projeto-criar', params: { id: cls.Id }})
}

const excluirprojeto = async (cls: Projeto[]) => {
  const ids = cls.map((a) => a.Id)
  await excluirProjetos(ids)
  await carregarProjetos()
}

onBeforeMount(carregarProjetos)
</script>

<template>
  <data-table
    :headers="headers"
    :items="items"
    @editar="editarProjeto"
    @excluir="excluirprojeto"
  />
</template>