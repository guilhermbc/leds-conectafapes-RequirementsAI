import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { routes as documentoRoutes} from '../../Documento/routes'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'
import Detalhes from '../views/Detalhe.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'modulo-home',
    path: '',
    component: Listar,
    meta: { breadcrumb: 'Módulos' }
  },
  {
    name: 'modulo-criar',
    path: 'criar/:moduloId?',
    component: Criar,
    meta: { breadcrumb: 'Criar Módulo' }
  },
  {
    name: 'modulo-detalhe',
    path: ':moduloId',
    component: Detalhes,
    meta: { breadcrumb: 'Módulo' },
    children: [
      {
        path: 'documentos',
        component: RouterView,
        children: documentoRoutes
      }
    ]
  }
]