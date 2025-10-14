<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarDocumento,
  excluirDocumentos,
} from '../controllers/documento'
import type { Documento } from '../types/documento'



const ui = useUiStore()
const headers = [
    { value: 'versao', title: 'versao' },
    { value: 'arquivo', title: 'arquivo' }

]
const items = ref<Documento[]>([])

const carregarDocumentos = async () => {
  const documento = await listarDocumento()
  items.value = documento
}

const router = useRouter()
const editarDocumento = (cls: Documento) => {
  router.push({ name: 'documento-criar', params: { id: cls.Id }})
}

const excluirdocumento = async (cls: Documento[]) => {
  const ids = cls.map((a) => a.Id)
  await excluirDocumentos(ids)
  await carregarDocumentos()
}

onBeforeMount(carregarDocumentos)
</script>

<template>
  <data-table
    :headers="headers"
    :items="items"
    @editar="editarDocumento"
    @excluir="excluirdocumento"
  />
</template>