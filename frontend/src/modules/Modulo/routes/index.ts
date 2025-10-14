import type { RouteRecordRaw } from 'vue-router'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'modulo-home',
    path: 'home',
    component: Listar,
  },
  {
    name: 'modulo-criar',
    path: 'criar/:id?',
    component: Criar,
  }
]