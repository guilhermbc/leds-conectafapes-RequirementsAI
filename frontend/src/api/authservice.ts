const BASE_URL = import.meta.env.VITE_BACKEND_ADMIN_BASE_URL
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export async function login(username: string, password: string) {
  const body = new URLSearchParams()
  body.append('grant_type', 'password')
  body.append('username', username)
  body.append('password', password)
  body.append('client_id', CLIENT_ID)

  const response = await fetch(`${BASE_URL}o/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    throw new Error('Login inválido')
  }

  return response.json() as Promise<TokenResponse>
}

export async function refreshToken(refreshToken: string) {
  const body = new URLSearchParams()
  body.append('grant_type', 'refresh_token')
  body.append('refresh_token', refreshToken)
  body.append('client_id', CLIENT_ID)

  const response = await fetch(`${BASE_URL}o/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    throw new Error('Refresh inválido')
  }

  return response.json() as Promise<TokenResponse>
}

export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${BASE_URL}register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  console.log('Register response:', response)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    // Tratar erros de validação do Django (formato: {field: ["message"]})
    if (errorBody && typeof errorBody === 'object') {
      // Verificar se é erro de username já existente
      if (errorBody.username && Array.isArray(errorBody.username)) {
        throw new Error('validation.usernameExists')
      }
      // Verificar se é erro de email já existente
      if (errorBody.email && Array.isArray(errorBody.email)) {
        throw new Error('validation.emailExists')
      }
      // Outros erros de campo
      const firstField = Object.keys(errorBody)[0]
      if (firstField && Array.isArray(errorBody[firstField])) {
        throw new Error(errorBody[firstField][0])
      }
    }

    const message = errorBody?.detail || JSON.stringify(errorBody) || 'Erro ao registrar usuário'
    throw new Error(message)
  }

  return response.json()
}