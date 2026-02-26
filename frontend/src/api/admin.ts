import axios from 'axios'
import { useUiStore } from '@/stores/ui'


// api para backend-admin, por isso adminApi.
export const adminApiConfig = {
  baseURL: import.meta.env.VITE_BACKEND_ADMIN_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_ADMIN_AUTH_TOKEN}`
  }
}

const adminApi = axios.create(adminApiConfig)

adminApi.interceptors.request.use((config) => {
  const ui = useUiStore()
  ui.carregando = true
  return config
}, (error) => {
  const ui = useUiStore()
  ui.carregando = false
  throw error
})

adminApi.interceptors.response.use((config) => {
  const ui = useUiStore()
  ui.carregando = false
  return config
}, (error) => {
  const ui = useUiStore()
  ui.carregando = false
  throw error
})

export default adminApi

import { useAuthStore } from '@/stores/auth'

export async function apiFetch(url: string, options: RequestInit = {}) {
  const auth = useAuthStore()

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${auth.accessToken}`
  }

  let response = await fetch(url, options)

  if (response.status === 401) {
    try {
      await auth.refresh()

      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${auth.accessToken}`
      }

      response = await fetch(url, options)
    } catch {
      auth.logout()
      window.location.href = '/login'
    }
  }

  return response
}