import type { RouteRecordRaw } from 'vue-router'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'
import Detalhes from '../views/Detalhe.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'projeto-home',
    path: 'home',
    component: Listar,
    meta: { requiresAuth: true }
  },
  {
    name: 'projeto-criar',
    path: 'criar/:id?',
    component: Criar,
    meta: { requiresAuth: true }
  },
  {
    name: 'projeto-detalhe',
    path: ':id',
    component: Detalhes,
    meta: { requiresAuth: true }
  }
]