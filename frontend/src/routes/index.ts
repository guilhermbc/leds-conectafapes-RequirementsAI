import { type RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { routes as projetoRoutes } from '../modules/Projeto/routes'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/',
    component: Login,
  },
  {
    name: 'register',
    path: '/register',
    component: Register,
  },
  {
    path: '/app',
    component: RouterView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'projetos',
        component: RouterView,
        children: projetoRoutes
      }
    ]
  }
]