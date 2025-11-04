import { type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/',
    beforeEnter: () => {
      const auth = useAuthStore()
      if (auth.estaLogado()) {
        return { name: 'projeto-home' }
      }
      return true
    },
    component: Login
  },
  {
    name: 'projeto-detalhe',
    path: '/projeto/:id',
    component: () => import('@/modules/Projeto/views/Detalhe.vue'),
    beforeEnter: () => {
      const auth = useAuthStore()
      if (!auth.estaLogado()) {
        return { name: 'login' }
      }
      return true
    }
  }
]