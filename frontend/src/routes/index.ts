import { type RouteRecordRaw } from 'vue-router'
import Login from '@/views/Login.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/',
    component: Login,
  },
]
