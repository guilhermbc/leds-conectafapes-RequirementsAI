import { type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // Login desabilitado temporariamente - redireciona para home
  // {
  //   name: 'login',
  //   path: '/',
  //   component: Login,
  //   beforeEnter: () => {
  //     const auth = useAuthStore()
  //     if (auth.estaLogado()) {
  //       return { name: 'projeto-home' }
  //     }
  //     return true
  //   }
  // },
  {
    name: 'login',
    path: '/',
    redirect: { name: 'projeto-home' },
  },
]
