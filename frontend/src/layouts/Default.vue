<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'



const auth = useAuthStore()

const sair = async () => {
  await auth.logout()
}

const ui = useUiStore()
const tooltipBarra = computed(() => {
  if (ui.mostrarBarraLateral) {
    return 'Esconder barra lateral'
  }
  return 'Mostrar barra lateral'
})
</script>

<template>
  <v-app>

    <v-app-bar>
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="ui.mostrarBarraLateral = !ui.mostrarBarraLateral"
        v-tooltip:end="tooltipBarra"
      />

      <v-snackbar-queue
        :model-value="ui.mensagensAlerta"
        @update:model-value="ui.fecharAlerta"
        max-width="400px" timer
      >
      </v-snackbar-queue>
    </v-app-bar>

    <v-navigation-drawer
      v-model="ui.mostrarBarraLateral"
    >

<v-list-item title="Projeto" />

<v-divider />

<v-list-item link title="Mostrar lista" :to="{ name: 'projeto-home' }"/>
<v-list-item link title="Registrar nova" :to="{ name: 'projeto-criar' }" />

<v-divider /><v-list-item title="Modulo" />

<v-divider />

<v-list-item link title="Mostrar lista" :to="{ name: 'modulo-home' }"/>
<v-list-item link title="Registrar nova" :to="{ name: 'modulo-criar' }" />

<v-divider /><v-list-item title="Documento" />

<v-divider />

<v-list-item link title="Mostrar lista" :to="{ name: 'documento-home' }"/>
<v-list-item link title="Registrar nova" :to="{ name: 'documento-criar' }" />

      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="sair" color="red" block>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <RouterView></RouterView>
      </v-container>
    </v-main>
  </v-app>
</template>