/**
 * arquivo controller trata da parte de erros e interface de usuario
 */
import {
  criarDocumento as _criarDocumento,
  listarDocumento as _listarDocumento,
  obterDocumento as _obterDocumento,
  atualizarDocumento as _atualizarDocumento,
  excluirDocumento as _excluirDocumento,
} from '../api/documento'
import type { Documento, DocumentoCreateReq, DocumentoCreateRes } from '../types/documento'
import { useUiStore } from '@/stores/ui'
import { AxiosError } from 'axios'

export const listarDocumento = async () => {
  try {
    const { data } = await _listarDocumento()
    return data.data
  } catch (error) {
    throw error
  }
}

export const criarDocumento = async (documento: DocumentoCreateReq | FormData) => {
  const ui = useUiStore()

  try {
    // Retorno da response com status
    const data = await _criarDocumento(documento)

    ui.exibirAlerta({
      text: data.statusText,
      color: 'success'
    })

    return data as unknown as DocumentoCreateRes

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

export const obterDocumento = async (id: string) => {
  try {
    const { data } = await _obterDocumento(id)
    return data as unknown as Documento
  } catch (error) {
    throw error
  }
}

export const atualizarDocumento = async (documento: Documento) => {
  try {
    const { data } = await _atualizarDocumento(documento)
    return true
  } catch (error) {
    throw error
  }
}

export const excluirDocumento = async (id: string) => {
  try {
    const { data } = await _excluirDocumento(id)
    return true
  } catch (error) {
    throw error
  }
}

export const excluirDocumentos = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const sucesso = await excluirDocumento(id)
    }
    return true
  } catch (error) {
    throw error
  }
}    