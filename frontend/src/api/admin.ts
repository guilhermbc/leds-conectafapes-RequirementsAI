import axios from 'axios'
import { useUiStore } from '@/stores/ui'


export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ADMIN_BASE_URL,
})

// Interceptor para adicionar access token automaticamente
adminApi.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

adminApi.interceptors.request.use((config) => {
  const ui = useUiStore()
  ui.carregando = true
  return config
}, (error) => {
  const ui = useUiStore()
  ui.carregando = false
  throw error
})

// Refresh automático em caso de 401
adminApi.interceptors.response.use(
  response => response,
  async (error) => {
    const auth = useAuthStore()

    if (error.response?.status === 401 && auth.refreshToken) {
      await auth.refresh()

      error.config.headers.Authorization = `Bearer ${auth.accessToken}`
      return adminApi(error.config)
    }

    return Promise.reject(error)
  }
)

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