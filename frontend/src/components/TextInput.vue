<script lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericTextInputProps } from './GenericTextInput.vue'
import type { ValidationResult, ValidationResultFunction } from '@/utils/regras'

export interface TextInputProps extends Omit<GenericTextInputProps, 'variant'> {
  rules?: ValidationResultFunction[];
  showValidation?: boolean;
}
</script>

<script setup lang="ts">

const value = defineModel()

const {
  type,
  placeholder,
  rules,
  showValidation = false,
} = defineProps<TextInputProps>()

const { t } = useI18n()

const hasRules = computed(() => {
  return rules !== undefined && rules.length > 0
})

const validationMessages = computed<ValidationResult[]>(() => {
  if (!hasRules.value) {
    return []
  }
  return (rules as ((value: any) => ValidationResult)[]).map((validarRegra) => {
    return validarRegra(value.value)
  })
})

const validationMessage = computed<string>(() => {
  const msg = validationMessages.value.find((message) => {
    return typeof message === 'string'
  })
  return msg ? t(msg as string) : ''
})

const isValid = computed<boolean>(() => {
  return validationMessages.value.every((valid) => {
    return valid === true
  })
})

const variant = computed(() => {
  if (!showValidation) {
    return 'default'
  }
  return isValid.value ? 'default' : 'error'
})

const emit = defineEmits<{
  validationUpdate: [valid: boolean];
  keyupEnter: [];
}>()

const emitEnter = () => {
  emit('keyupEnter')
}

// pode ser feito tbm como v-model, expose
watch(isValid, (newValue) => {
  emit('validationUpdate', newValue)
})
</script>

<template>
  <div class="w-[280px] mb-0">
    <div class="m-1">
      <label class="">
        <slot />
      </label>
    </div>
    <generic-text-input
      class=""
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :variant="variant"
      @keyup-enter="emitEnter"
    />

    <div class="h-(--text-2xl) my-1 overflow-auto text-red-400">
      <span v-if="showValidation">{{ validationMessage }}</span>
    </div>
  </div>
</template>