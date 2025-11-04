/**
 * arquivo controller trata da parte de erros e interface de usuario
 */
import {
  criarProjeto as _criarProjeto,
  listarProjeto as _listarProjeto,
  obterProjeto as _obterProjeto,
  atualizarProjeto as _atualizarProjeto,
  excluirProjeto as _excluirProjeto,
} from '../api/projeto'
import type { Projeto, ProjetoCreateReq } from '../types/projeto'
import { useUiStore } from '@/stores/ui'
import { AxiosError } from 'axios'

// export const listarProjeto = async () => {
//   try {
//     const { data } = await _listarProjeto()
//     return data.value
//   } catch (error) {
//     throw error
//   }
// }

// Mock em memória com alguns projetos de exemplo
let mockProjects: Projeto[] = [
  {
    Id: 'proj_1',
    nome: 'Portal de Tarefas',
    descricao: 'Sistema para gerenciar tarefas, projetos e notificações.',
  },
  {
    Id: 'proj_2',
    nome: 'Agenda Escolar',
    descricao: 'Gerenciamento de turmas, aulas e avaliações.',
  },
]

// Retorna a lista de projetos (simula latência)
export const listarProjeto = async (): Promise<Projeto[]> => {
  await new Promise((r) => setTimeout(r, 200)) // 200ms de simulação
  return mockProjects
}

// Exclui projetos por ids (atualiza mock em memória)
export const excluirProjetos = async (ids: string[]): Promise<void> => {
  mockProjects = mockProjects.filter((p) => !ids.includes(p.Id))
  await new Promise((r) => setTimeout(r, 100))
}

// Cria ou atualiza um projeto no mock (útil para testar criação/edição)
export const salvarProjeto = async (proj: Partial<Projeto> & { Id?: string }): Promise<Projeto> => {
  if (proj.Id) {
    const idx = mockProjects.findIndex((p) => p.Id === proj.Id)
    if (idx >= 0) {
      mockProjects[idx] = { ...mockProjects[idx], ...proj } as Projeto
      return mockProjects[idx]
    }
  }
  const novo: Projeto = {
    Id: `proj_${Date.now()}`,
    nome: proj.nome ?? 'Novo Projeto',
    descricao: proj.descricao ?? '',
  }
  mockProjects.unshift(novo)
  return novo
}
// ...existing code...
export const criarProjeto = async (projeto: ProjetoCreateReq) => {
  const ui = useUiStore()

  try {
    const { data } = await _criarProjeto(projeto)

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

export const obterProjeto = async (id: string) => {
  try {
    const data = await _obterProjeto(id)
    return data
  } catch (error) {
    throw error
  }
}

export const atualizarProjeto = async (projeto: Projeto) => {
  try {
    const { data } = await _atualizarProjeto(projeto)
    return true
  } catch (error) {
    throw error
  }
}

export const excluirProjeto = async (id: string) => {
  try {
    const { data } = await _excluirProjeto(id)
    return true
  } catch (error) {
    throw error
  }
}

// export const excluirProjetos = async (ids: string[]) => {
//   try {
//     for (const id of ids) {
//       const sucesso = await excluirProjeto(id)
//     }
//     return true
//   } catch (error) {
//     throw error
//   }
// }    