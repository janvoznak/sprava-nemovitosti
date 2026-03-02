<template>
  <div 
    class="app-select-container" 
    :class="{ 
      'is-focused': isFocused,
      'has-help': help,
      'is-readonly': disabled
    }"
  >
    <label 
      class="app-select-label" 
      :class="{ 'required': required }"
    >
      {{ label }}
    </label>
    
    <div class="app-select-wrapper">
      <select
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :required="required"
        :disabled="disabled"
        class="app-select-field"
      >
        <slot></slot>
      </select>

      <div v-if="help" class="help-section" :title="typeof help === 'string' ? help : 'Nápověda'">
        <span class="help-icon">?</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  disabled: Boolean,
  help: [Boolean, String]
});

defineEmits(['update:modelValue']);

const isFocused = ref(false);
</script>

<style scoped>
.app-select-container {
  position: relative;
  margin-top: 0.75rem;
  width: 100%;
}

.app-select-label {
  position: absolute;
  top: -0.65rem;
  left: 0.75rem;
  padding: 0 0.4rem;
  background: white;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  z-index: 1;
  pointer-events: none;
  transition: color 0.2s;
}

.app-select-label.required {
  color: #ef4444;
}

.app-select-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  min-height: 48px;
  transition: all 0.2s;
  overflow: hidden;
}

.is-focused .app-select-wrapper {
  border-color: var(--save-color, #00C853);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.is-readonly .app-select-wrapper {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.app-select-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #1e293b;
  outline: none;
  width: 100%;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.25rem;
}

.help-section {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  cursor: help;
}

.help-icon {
  font-weight: 800;
  font-size: 1.1rem;
  color: #000;
}
</style>
