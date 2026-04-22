import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { routes as moduloRoutes } from '../../Modulo/routes'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'
import Detalhes from '../views/Detalhe.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'projeto-home',
    path: '',
    component: Listar,
    meta: { breadcrumb: 'Projetos' }
  },
  {
    name: 'projeto-criar',
    path: 'criar/:projetoId?',
    component: Criar,
    meta: { breadcrumb: 'Criar Projeto' }
  },
  {
    name: 'projeto-detalhe',
    path: ':projetoId',
    component: Detalhes,
    meta: { breadcrumb: 'Projeto' },
    children: [
      {
        path: 'modulos',
        component: RouterView,
        children: moduloRoutes
      }
    ]
  }
]