import type { RouteRecordRaw } from 'vue-router'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'
import Detalhes from '../views/Detalhe.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'documento-home',
    path: 'home',
    component: Listar,
  },
  {
    name: 'documento-criar',
    path: 'criar/:id?',
    component: Criar,
  },
  {
    name: 'documento-detalhe',
    path: ':id',
    component: Detalhes
  }
]