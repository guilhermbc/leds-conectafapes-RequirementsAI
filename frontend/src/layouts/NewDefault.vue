<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

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
      <p-button class="bg-blue-950" @click="sair">SAIR</p-button>
    </nav>
    <main class="flex justify-center items-center w-full">
      <router-view />
    </main>
  </div>
</template>