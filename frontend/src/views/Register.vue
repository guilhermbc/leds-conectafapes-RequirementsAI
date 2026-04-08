<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

import { register as registerService } from '@/api/authservice'

const router = useRouter()
const auth = useAuthStore()
const { locale, t } = useI18n()

function changeLanguage(lang: string) {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const erro = ref('')
const success = ref('')
const loading = ref(false)
const submitted = ref(false)

// Mensagens de erro para cada campo
const erroUsername = ref('')
const erroEmail = ref('')
const erroPassword = ref('')
const erroConfirmPassword = ref('')

// Validar username: não vazio e mínimo 3 caracteres
const validarUsername = (): string => {
  if (!username.value) {
    return 'validation.required'
  }
  if (username.value.length < 3) {
    return 'validation.minLength'
  }
  return ''
}

// Validar email: não vazio
const validarEmail = (): string => {
  if (!email.value) {
    return 'validation.required'
  }
  return ''
}

// Validar password: não vazio, mínimo 3 caracteres e caractere especial
const validarPassword = (): string => {
  if (!password.value) {
    return 'validation.required'
  }
  if (password.value.length < 3) {
    return 'validation.minLength'
  }
  if (!/[!@#$%^]/.test(password.value)) {
    return 'validation.specialChars'
  }
  return ''
}

// Validar confirmPassword: não vazio e deve bater com password
const validarConfirmPassword = (): string => {
  if (!confirmPassword.value) {
    return 'validation.required'
  }
  if (confirmPassword.value !== password.value) {
    return 'validation.passwordMismatch'
  }
  return ''
}

// Atualizar erros em tempo real
watch([username, email, password, confirmPassword], () => {
  if (submitted.value) {
    erroUsername.value = validarUsername()
    erroEmail.value = validarEmail()
    erroPassword.value = validarPassword()
    erroConfirmPassword.value = validarConfirmPassword()
  }
})

const registrar = async () => {
  submitted.value = true

  // Validar todos os campos
  erroUsername.value = validarUsername()
  erroEmail.value = validarEmail()
  erroPassword.value = validarPassword()
  erroConfirmPassword.value = validarConfirmPassword()

  // Se houver erros, não prosseguir
  if (erroUsername.value || erroEmail.value || erroPassword.value || erroConfirmPassword.value) {
    return
  }

  try {
    loading.value = true
    erro.value = ''
    success.value = ''

    await registerService(username.value, email.value, password.value)

    success.value = String(t('register.success'))

    // opcional: logar automaticamente
    await auth.login(username.value, password.value)

    // mostra mensagem rápida antes de redirecionar
    await new Promise((resolve) => setTimeout(resolve, 1100))

    router.push({ name: 'projeto-home' })
  } catch (e: any) {
    const errorMessage = e?.message || 'Erro ao cadastrar usuário.'
    // Verificar se é uma chave de tradução
    if (errorMessage.startsWith('validation.')) {
      erro.value = t(errorMessage)
    } else {
      erro.value = errorMessage
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="absolute top-4 right-4">
    <button 
      class="px-5 py-2 mr-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer"
      @click="changeLanguage('en')"
    >EN</button>
    <button
      class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer"
      @click="changeLanguage('pt')"
    >PT</button>
  </div>

  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="text-[60px] text-blue-800 font-bold mb-10">
      <h1>RequirementsAI</h1>
    </div>

    <card class="w-md p-6">
      <text-input
        class="w-full mb-1"
        placeholder=""
        v-model="username"
      >{{ $t('register.username') }}</text-input>
      <p v-if="submitted && erroUsername" class="text-red-500 text-xs mb-4">
        {{ t(erroUsername) }}
      </p>

      <text-input
        class="w-full mb-1"
        placeholder=""
        v-model="email"
      >{{ $t('register.email') }}</text-input>
      <p v-if="submitted && erroEmail" class="text-red-500 text-xs mb-4">
        {{ t(erroEmail) }}
      </p>

      <text-input
        class="w-full mb-1"
        v-model="password"
        type="password"
      >{{ $t('register.password') }}</text-input>
      <p v-if="submitted && erroPassword" class="text-red-500 text-xs mb-4">
        {{ t(erroPassword) }}
      </p>

      <text-input
        class="w-full mb-1"
        v-model="confirmPassword"
        type="password"
      >{{ $t('register.confirmPassword') }}</text-input>
      <p v-if="submitted && erroConfirmPassword" class="text-red-500 text-xs mb-4">
        {{ t(erroConfirmPassword) }}
      </p>

      <p v-if="erro" class="text-red-500 text-sm mb-3">{{ erro }}</p>
      <p v-if="success" class="text-green-500 text-sm mb-3">{{ success }}</p>

      <div class="flex justify-between items-center">
        <button
          class="text-sm text-blue-700 hover:underline transition cursor-pointer"
          @click="router.push({ name: 'login' })"
        >{{ $t('register.back')}}</button>

        <button
          class="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition cursor-pointer"
          @click="registrar"
        >
          <span v-if="!loading">{{ $t('register.button') }}</span>
          <span v-else>{{ $t('register.loading') }}</span>
        </button>
      </div>
    </card>
  </div>
</template>