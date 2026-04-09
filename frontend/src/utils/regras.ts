export type ValidationResult = string | boolean;
export type ValidationResultFunction = (value: any) => ValidationResult
// type ValidationResultFunction = (value: any) => ValidationResult


export const campoNecessario: ValidationResultFunction = (campo) => {
  if (!!campo) {
    return true
  }
  return 'validation.required'
}

export const minimo3caracteres: ValidationResultFunction = (texto) => {
  if (texto.length >= 3) {
    return true
  }
  return 'validation.minLength'
}
// Note que cada regra é responsável por um tipo de validação, sem interseção.
export const caracteresEspeciais: ValidationResultFunction = (senha) => {
  if (/[!@#\\$%\\^]/.test(senha)) {
    return true
  }
  return 'validation.specialChars'
}

export const confirmaSenha: ValidationResultFunction = (confirmPassword, password?: string) => {
  if (!confirmPassword) {
    return 'validation.required'
  }
  if (password && confirmPassword !== password) {
    return 'validation.passwordMismatch'
  }
  return true
}