<template>
  <div 
    class="app-textarea-container" 
    :class="{ 
      'is-focused': isFocused,
      'has-help': help,
      'is-readonly': readonly
    }"
  >
    <label 
      class="app-textarea-label" 
      :class="{ 'required': required }"
    >
      {{ label }}
    </label>
    
    <div class="app-textarea-wrapper">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :placeholder="placeholder"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        class="app-textarea-field"
      ></textarea>

      <div v-if="help" class="help-section" :title="typeof help === 'string' ? help : 'Nápověda'">
        <span class="help-icon">?</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  required: Boolean,
  readonly: Boolean,
  help: [Boolean, String],
  rows: {
    type: Number,
    default: 3
  }
});

defineEmits(['update:modelValue']);

const isFocused = ref(false);
</script>

<style scoped>
.app-textarea-container {
  position: relative;
  margin-top: 0.75rem;
  width: 100%;
}

.app-textarea-label {
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

.app-textarea-label.required {
  color: #ef4444;
}

.app-textarea-wrapper {
  display: flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
  overflow: hidden;
  align-items: stretch;
}

.is-focused .app-textarea-wrapper {
  border-color: var(--save-color, #00C853);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.is-readonly .app-textarea-wrapper {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.app-textarea-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #1e293b;
  outline: none;
  width: 100%;
  resize: vertical;
  font-family: inherit;
}

.help-section {
  width: 48px;
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
