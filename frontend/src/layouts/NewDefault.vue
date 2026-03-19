<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n() 

function changeLanguage(lang: string) {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const sair = async () => {
  const auth = useAuthStore()
  await auth.logout()
}
</script>

<template>
  <div class="flex flex-row w-screen h-screen">
    <nav class="fixed top-0 left-0 w-full h-14 bg-blue-800 border-b-2 border-blue-1000 flex items-center justify-between px-4 z-50 text-white">
      <!-- Nome do projeto -->
      <span class="text-lg font-semibold">
        RequirementsAI
      </span>
      <div>
        <div>
          <p-button class="bg-blue-950 mr-2 hover:bg-blue-900 transition cursor-pointer" @click="changeLanguage('en')">EN</p-button>
          <p-button class="bg-blue-950 mr-4 hover:bg-blue-900 transition cursor-pointer" @click="changeLanguage('pt')">PT</p-button>
        </div>
        <p-button class="bg-blue-950" @click="sair">SAIR</p-button>
      </div>
    </nav>
    <main class="flex justify-center items-center w-full">
      <router-view />
    </main>
  </div>
</template>