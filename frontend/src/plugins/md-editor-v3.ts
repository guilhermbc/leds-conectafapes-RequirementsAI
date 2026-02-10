import { MdEditor, config } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

export function setupMdEditor() {
  config({
    editorConfig: {
      language: 'en-US'
    }
  })
}

export default MdEditor
