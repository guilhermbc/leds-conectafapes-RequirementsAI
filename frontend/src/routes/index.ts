import { type RouteRecordRaw } from 'vue-router'
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
]
