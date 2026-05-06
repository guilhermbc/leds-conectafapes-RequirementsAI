/**
 * Incrementa o número de versão principal (a primeira parte) de uma string 'X.Y'.
 * Se a versão for '2.4', retorna '3.4'.
 *
 * @param versao A string de versão no formato 'X.Y' (ex: '2.4', '12.13').
 * @returns A nova string de versão incrementada no formato 'X+1.Y'.
 */
export function incrementarVersaoMaior(versao: string): string {
    // 1. Divide a string na parte principal e secundária usando o ponto ('.')
    const partes = versao.split('.');

    // // 2. Validação: Verifica se há exatamente duas partes
    // if (partes.length !== 2) {
    //     throw new Error(`Formato de versão inválido. Esperado 'X.Y', mas recebido '${versao}'.`);
    // }

    const [majorStr, minorStr] = partes;

    // 3. Converte a primeira parte para um número e verifica se é um número válido
    const major = parseInt(majorStr, 10);

    // // O isNaN verifica se a conversão resultou em "Não é um Número".
    // if (isNaN(major)) {
    //     throw new Error(`O identificador principal da versão não é um número válido: '${majorStr}'.`);
    // }

    // 4. Incrementa o número principal
    const novoMajor = major + 1;

    // 5. Concatena o novo número principal com a parte secundária original
    // A parte secundária (minorStr) é mantida exatamente como estava.
    return `${novoMajor}.${minorStr}`;
}

/**
 * Incrementa o número de versão secundário (a segunda parte) de uma string 'X.Y'.
 * Se a versão for '2.4', retorna '2.5'.
 * Se a versão for '12.13', retorna '12.14'.
 *
 * @param versao A string de versão no formato 'X.Y' (ex: '2.4', '12.13').
 * @returns A nova string de versão incrementada no formato 'X.Y+1'.
 */
export function incrementarVersaoMenor(versao: string): string {
    // 1. Divide a string na parte principal (major) e secundária (minor)
    const partes = versao.split('.');

    // // 2. Validação básica de formato
    // if (partes.length !== 2) {
    //     throw new Error(`Formato de versão inválido. Esperado 'X.Y', mas recebido '${versao}'.`);
    // }

    const [majorStr, minorStr] = partes;

    // 3. Converte a segunda parte (minor) para um número e verifica se é um número válido
    const minor = parseInt(minorStr, 10);

    // if (isNaN(minor)) {
    //     throw new Error(`O identificador secundário da versão não é um número válido: '${minorStr}'.`);
    // }

    // 4. Incrementa o número secundário
    const novoMinor = minor + 1;

    // 5. Concatena a parte principal original com o novo número secundário
    // O minorStr precisou ser convertido para number e depois volta para string
    // O majorStr é mantido como string.
    return `${majorStr}.${novoMinor}`;
}

/**
 * Formata a versão de um documento dadas duas partes: vMajor e vMinor.
 *
 * @param vMajor O número da versão principal (major).
 * @param vMinor O número da versão secundária (minor).
 * @returns String de versão no formato 'X.Y'.
 */
export function formatarVersao(vMajor: number, vMinor: number): string {
  return `${vMajor}.${vMinor}`;
}

/**
 * Retorna o nome formatado do tipo de documento com base no identificador fornecido.
 *
 * @param tipo A string do tipo do documento (ex: CASO_USO).
 * @returns A string formatada do tipo do documento (ex: Casos de Uso).
 */
export function formatarTipoDocumento(tipo: string): string {
    if (tipo === 'MINIMUNDO') {
        return 'document.domainStorytelling'
    } else if (tipo === 'REQUISITOS') {
        return 'document.requirements'
    } else if (tipo === 'CASO_USO') {
        return 'document.useCases'
    } else if (tipo === 'DIAGRAMA_CLASSE') {
        return 'document.classDiagram'
    } else if (tipo === 'PROTOTIPO_INTERFACE') {
        return 'document.InterfacePrototype'
    } else {
        return ''
    }
}

// Função para extrair o nome do arquivo de uma URL
export const getNomeArquivo = (url: any) => {
  if (url instanceof File) {
    return url.name
  }

  if (!url || typeof url !== 'string') return ''

  return url.split('/').pop()
}

// Função para criar um FormData a partir dos dados do documento
export const criarFormDataDocumento = (dados: any): FormData => {
  const formData = new FormData()
  
  // Adicionar cada campo ao FormData
  formData.append('vMajor', dados.vMajor)
  formData.append('vMinor', dados.vMinor)
  formData.append('geradoIA', dados.geradoIA)
  formData.append('arquivo', dados.arquivo)
  formData.append('TipoDocumento', dados.TipoDocumento)
  if (dados.DocumentoAnterior) {
    formData.append('DocumentoAnterior', dados.DocumentoAnterior)
  }
  formData.append('Modulo', dados.Modulo)
  
  // Adicionar arquivo de áudio se presente
  if (dados.arquivoAudio) {
    formData.append('arquivoAudio', dados.arquivoAudio)
  }
  
  // Adicionar array de DocumentoOrigem
  dados.DocumentoOrigem.forEach((id: number) => {
    formData.append(`DocumentoOrigem`, id.toString())
  })
  
  return formData
}