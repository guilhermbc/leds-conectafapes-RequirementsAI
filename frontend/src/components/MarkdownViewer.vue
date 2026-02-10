<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import mermaid from 'mermaid'
import { useMarkdown } from '@/composables/useMarkdown'

const props = defineProps<{ source: string }>()

const html = ref('')
const { render } = useMarkdown()

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
})

watch(
  () => props.source,
  async (value) => {
    html.value = render(value)
    await nextTick()

    // Renderiza os diagramas Mermaid
    mermaid.run({
      querySelector: '.mermaid',
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="markdown-body" v-html="html" />
</template>

<style>.markdown-body .plantuml,
.markdown-body .mermaid {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.markdown-body .plantuml img {
  max-width: 100%;
}
</style>
