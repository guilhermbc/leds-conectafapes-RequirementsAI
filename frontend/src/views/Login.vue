<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { chaveModal } from '@/types/ui'
import {
  campoNecessario,
  minimo3caracteres,
  caracteresEspeciais
} from '@/utils/regras'

const router = useRouter()
const auth = useAuthStore()

// Modal
const modal = inject(chaveModal)
const esqueciSenha = () => {
  modal?.abrirModal("Não implementado.")
}

// Estados
const usuario = ref('')
const senha = ref('')
const erro = ref('')
const loading = ref(false)

// Regras
const regrasUsuario = [campoNecessario, minimo3caracteres]
const regrasSenha = [campoNecessario, minimo3caracteres, caracteresEspeciais]

// Validação
const usuarioValido = ref(false)
const senhaValida = ref(false)

const updateUsuarioValido = (novoValor: boolean) => {
  usuarioValido.value = novoValor
}

const updateSenhaValida = (novoValor: boolean) => {
  senhaValida.value = novoValor
}

const podeEntrar = computed(() => {
  return usuarioValido.value && senhaValida.value && !loading.value
})

// Login
const entrar = async () => {
  if (!podeEntrar.value) return

  try {
    loading.value = true
    erro.value = ''

    await auth.login(usuario.value, senha.value)

    // Redireciona para página principal
    router.push({ name: 'home' })
  } catch (e) {
    erro.value = 'Usuário ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    
    <!-- Título -->
    <div class="text-[60px] text-blue-800 font-bold mb-10">
      <h1>RequirementsAI</h1>
    </div>

    <!-- Card -->
    <card class="w-md p-6">
      
      <text-input
        class="w-full mb-4"
        placeholder="exemplo123"
        v-model="usuario"
        :rules="regrasUsuario"
        @validationUpdate="updateUsuarioValido"
        @keyup-enter="entrar"
      >
        Nome de Usuário
      </text-input>

      <text-input
        class="w-full mb-4"
        v-model="senha"
        :rules="regrasSenha"
        @validationUpdate="updateSenhaValida"
        @keyup-enter="entrar"
        type="password"
      >
        Senha
      </text-input>

      <!-- Erro -->
      <p v-if="erro" class="text-red-500 text-sm mb-3">
        {{ erro }}
      </p>

      <!-- Botão -->
      <div class="flex justify-between items-center">
        <button
          class="text-sm text-blue-700 hover:underline"
          @click="esqueciSenha"
        >
          Esqueci a senha
        </button>

        <button
          class="px-5 py-2 bg-blue-800 text-white rounded-lg 
                 hover:bg-blue-900 transition"
          :class="{
            'opacity-50 cursor-not-allowed': !podeEntrar
          }"
          :disabled="!podeEntrar"
          @click="entrar"
        >
          <span v-if="!loading">Entrar</span>
          <span v-else>Entrando...</span>
        </button>
      </div>

    </card>
  </div>
</template>