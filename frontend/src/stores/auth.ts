import { defineStore } from 'pinia'
import { login as loginService, refreshToken } from '@/api/authservice'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  }),

  actions: {
    async login(username: string, password: string) {
      const data = await loginService(username, password)

      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('Sem refresh token')

      const data = await refreshToken(this.refreshToken)

      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
    }
  }
})