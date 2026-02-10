<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement | null>(null)
let view: EditorView

onMounted(() => {
  view = new EditorView({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      markdown(),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      })
    ],
    parent: editorRef.value!
  })
})

watch(
  () => props.modelValue,
  value => {
    if (value !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        }
      })
    }
  }
)
</script>

<template>
  <div ref="editorRef" class="editor" />
</template>

<style scoped>
.editor {
  border: 1px solid #ccc;
  min-height: 300px;
}
</style>
