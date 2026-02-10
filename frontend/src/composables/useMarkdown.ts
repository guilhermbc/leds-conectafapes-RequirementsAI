import MarkdownIt from 'markdown-it'
import table from 'markdown-it-multimd-table'
import DOMPurify from 'dompurify'
import { encode } from 'plantuml-encoder'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

md.use(table)

const defaultFence =
  md.renderer.rules.fence ||
  ((tokens: any, idx: any, options: any, env: any, self: any) =>
    self.renderToken(tokens, idx, options))

  md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
    const token = tokens[idx]
    const info = token.info.trim()

  if (info === 'mermaid') {
    return `<div class="mermaid">${token.content}</div>`
  }

  if (info === 'plantuml') {
    const encoded = encode(token.content)
    const url = `https://www.plantuml.com/plantuml/svg/${encoded}`

    return `
      <div class="plantuml">
        <img src="${url}" alt="PlantUML diagram" />
      </div>
    `
  }

  return defaultFence(tokens, idx, options, env, self)
}

export function useMarkdown() {
  const render = (source: string): string => {
    const html = md.render(source)
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['div'],
      ADD_ATTR: ['class'],
    })
  }

  return { render }
}
