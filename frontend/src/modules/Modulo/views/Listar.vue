<script setup lang="ts">
import { ref, onBeforeMount, watch, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listarModulo,
  excluirModulos,
} from '../controllers/modulo'
import type { Modulo } from '../types/modulo'

// Permite receber o id do projeto como prop (opcional)
const props = defineProps<{
  projetoId?: string | number
}>()

const ui = useUiStore()
const headers = [
    { value: 'nome', title: 'nome' },
    { value: 'descricao', title: 'descricao' }
]
const items = ref<Modulo[]>([])

const carregarModulos = async () => {
  const modulos = await listarModulo()
  for (const modulo of modulos){
    if (modulo.Projeto.id == props.projetoId){
      items.value.push(modulo)
    }
  }
}

const router = useRouter()
const editarModulo = (cls: Modulo) => {
  router.push({ name: 'modulo-criar', params: { id: cls.id }})
}

const excluirmodulo = async (cls: Modulo[]) => {
  const ids = cls.map((a) => a.id)
  await excluirModulos(ids)
  await carregarModulos()
}

// Recarrega ao montar e se o projetoId mudar
onBeforeMount(carregarModulos)
watch(() => props.projetoId, carregarModulos)

</script>

<template>
  <div>
    <div v-if="items.length === 0" class="text-center text-gray-500 py-12">
      Nenhum módulo encontrado.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link
        v-for="modulo in items"
        :key="modulo.id"
        :to="{ name: 'modulo-home', params: { id: modulo.id }}"
        class="block group h-48"
      >
        <article
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col h-full"
        >
          <header class="mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 break-words">{{ modulo.nome }}</h2>
          </header>
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 overflow-hidden">
            {{ modulo.descricao || 'Sem descrição' }}
          </p>
        </article>
      </router-link>
    </div>
  </div>
</template>