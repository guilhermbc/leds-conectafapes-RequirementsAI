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