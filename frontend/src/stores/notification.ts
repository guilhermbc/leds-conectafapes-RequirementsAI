// stores/notification.ts
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    messageKey: null as string | null,
    params: {} as Record<string, any>
  }),

  actions: {
    notify(key: string, params = {}) {
      this.messageKey = key
      this.params = params
    },

    clear() {
      this.messageKey = null
      this.params = {}
    }
  }
})