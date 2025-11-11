/**
 * arquivo controller trata da parte de erros e interface de usuario
 */
import {
  criarModulo as _criarModulo,
  listarModulo as _listarModulo,
  obterModulo as _obterModulo,
  atualizarModulo as _atualizarModulo,
  excluirModulo as _excluirModulo,
} from '../api/modulo'
import type { Modulo, ModuloCreateReq } from '../types/modulo'
import { useUiStore } from '@/stores/ui'
import { AxiosError } from 'axios'

export const listarModulo = async () => {
  try {
    const { data } = await _listarModulo()
    // O return é data.data mesmo
    return data.data
  } catch (error) {
    throw error
  }
}

export const criarModulo = async (modulo: ModuloCreateReq) => {
  const ui = useUiStore()

  try {
    const { data } = await _criarModulo(modulo)

    ui.exibirAlerta({
      text: data.message,
      color: 'success'
    })

    return true

  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.status === 400 &&
      error.response.data.errors
    ) {
      ui.exibirAlertas(
        error.response.data.errors
          .map((err: { mensagem: string }) => ({ text: err.mensagem, color: 'error' }))
      )

      return false

    } else {
      throw error
    }
  }
}

export const obterModulo = async (id: string) => {
  try {
    const data = await _obterModulo(id)
    return data
  } catch (error) {
    throw error
  }
}

export const atualizarModulo = async (modulo: Modulo) => {
  try {
    const { data } = await _atualizarModulo(modulo)
    return true
  } catch (error) {
    throw error
  }
}

export const excluirModulo = async (id: string) => {
  try {
    const { data } = await _excluirModulo(id)
    return true
  } catch (error) {
    throw error
  }
}

export const excluirModulos = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const sucesso = await excluirModulo(id)
    }
    return true
  } catch (error) {
    throw error
  }
}    