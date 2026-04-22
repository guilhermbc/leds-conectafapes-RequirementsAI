import type { RouteRecordRaw } from 'vue-router'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'
import Detalhes from '../views/Detalhe.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'documento-home',
    path: '',
    component: Listar,
    meta: { breadcrumb: 'Documentos' }
  },
  {
    name: 'documento-criar',
    path: 'criar/:documentoId?',
    component: Criar,
    meta: { breadcrumb: 'Criar Documento' }
  },
  {
    name: 'documento-detalhe',
    path: ':documentoId',
    component: Detalhes,
    meta: { breadcrumb: 'Documento' }
  }
]