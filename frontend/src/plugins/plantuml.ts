import MarkdownIt from 'markdown-it'
import plantumlEncoder from 'plantuml-encoder'

export function plantUmlPlugin(md: InstanceType<typeof MarkdownIt>) {
  md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
    const token = tokens[idx]

    if (token.info.trim() === 'plantuml') {
      const encoded = plantumlEncoder.encode(token.content)

      const url = `https://www.plantuml.com/plantuml/svg/${encoded}`

      return `
        <div class="plantuml-diagram">
          <img src="${url}" alt="PlantUML diagram" />
        </div>
      `
    }

    return self.renderToken(tokens, idx, options)
  }
}
