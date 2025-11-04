import { type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/',
    component: Login,
    beforeEnter: () => {
      const auth = useAuthStore()
      if (auth.estaLogado()) {
        return { name: 'projeto-home' }
      }
      return true
    }
  },
]