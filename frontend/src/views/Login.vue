<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { chaveModal } from '@/types/ui'
import {
  campoNecessario,
  minimo3caracteres,
  caracteresEspeciais
} from '@/utils/regras'


const modal = inject(chaveModal)
const esqueciSenha = () => {
  modal?.abrirModal("Não implementado.")
}


const usuario = ref('')
const regrasUsuario = [campoNecessario, minimo3caracteres]
const usuarioValido = ref(false)
const updateUsuarioValido = (novoValor: boolean) => {
  usuarioValido.value = novoValor
}

const senha = ref('')
const regrasSenha = [campoNecessario, minimo3caracteres, caracteresEspeciais]
const senhaValida = ref(false)
const updateSenhaValida = (novoValor: boolean) => {
  senhaValida.value = novoValor
}


const podeEntrar = computed(() => {
  return usuarioValido.value && senhaValida.value
})

const entrar = async () => {
  if (podeEntrar.value) {
    const auth = useAuthStore()
    return await auth.login(usuario.value, senha.value)
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <!-- Título -->
    <div class="text-[80px] text-blue-800 font-bold text-shadow-md my-auto mb-10">
      <h1>RequirementsAI</h1>
    </div>

    <!-- Card de Login -->
    <div>
      <card class="w-md">
        <text-input
          class="w-full"
          placeholder="exemplo123"
          v-model="usuario"
          :rules="regrasUsuario"
          @validationUpdate="updateUsuarioValido"
          @keyup-enter="entrar"
        >
          Nome de Usuário
        </text-input>

        <text-input
          class="w-full"
          v-model="senha"
          :rules="regrasSenha"
          @validationUpdate="updateSenhaValida"
          @keyup-enter="entrar"
          type="password"
        >
          Senha
        </text-input>

        <div class="flex justify-end">
          <button
            class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 
            transition cursor-pointer"
            @click="entrar"
          >
            Entrar
          </button>
        </div>
      </card>
    </div>
  </div>
</template>