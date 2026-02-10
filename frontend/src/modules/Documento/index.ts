import { type RouteRecordRaw } from 'vue-router'
import { routes as _routes } from './routes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/Documento',
    children: _routes,
    meta: {
      requiresAuth: true
    }
  }
]