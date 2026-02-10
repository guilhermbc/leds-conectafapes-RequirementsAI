import { type RouteRecordRaw } from 'vue-router'
import { routes as _routes } from './routes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/Modulo',
    children: _routes,
    meta: {
      requiresAuth: true
    }
  }
]