<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "close"): void
}>()

const close = () => {
  emit("update:modelValue", false)
  emit("close")
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") close()
}

onMounted(() => document.addEventListener("keydown", onKeydown))
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown))

watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)
</script>

<template>
  <!-- Wrapper geral -->
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 flex justify-center items-center z-50"
    >
      <!-- Fundo escurecido -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="close"
      ></div>

      <!-- Conteúdo do modal -->
      <transition name="scale">
        <div
          class="relative bg-white rounded-xl shadow-xl p-6 w-[500px] max-w-[90%] z-50"
        >
          <slot />
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  animation: scaleIn 0.25s ease;
}
.scale-leave-active {
  animation: scaleOut 0.2s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>