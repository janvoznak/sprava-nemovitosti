<template>
  <div 
    class="app-input-container" 
    :class="{ 
      'has-error': error,
      'is-readonly': readonly,
      'is-focused': isFocused,
      'has-help': help
    }"
  >
    <label 
      class="app-input-label" 
      :class="{ 'required': required }"
    >
      {{ label }}
    </label>
    
    <div class="app-input-wrapper">
      <span v-if="type === 'date'" class="material-icons field-icon">calendar_today</span>
      
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="type"
        :placeholder="placeholder"
        :readonly="readonly"
        :required="required"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="app-input-field"
      >

      <div v-if="help" class="help-section" :title="typeof help === 'string' ? help : 'Nápověda'">
        <span class="help-icon">?</span>
      </div>
    </div>
    
    <!-- Optional slot for suggestions/autocomplete dropdowns -->
    <slot name="suggestions"></slot>

    <p v-if="error" class="error-message">{{ error }}</p>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  required: Boolean,
  readonly: Boolean,
  help: [Boolean, String],
  error: String
});

const helpText = props.help === true ? '' : props.help;

defineEmits(['update:modelValue']);

const isFocused = ref(false);
</script>

<style scoped>
.app-input-container {
  position: relative;
  margin-top: 0.75rem;
  width: 100%;
}

.app-input-label {
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

.app-input-label.required {
  color: #ef4444; /* Standard red for required */
}

.app-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  min-height: 48px;
  transition: all 0.2s;
  overflow: hidden;
}

.is-focused .app-input-wrapper {
  border-color: var(--save-color, #00C853);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.is-readonly .app-input-wrapper {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.is-readonly .app-input-label {
  background: transparent;
  color: #64748b;
}

.field-icon {
  padding-left: 0.75rem;
  color: #64748b;
  font-size: 1.25rem;
}

.app-input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #1e293b;
  outline: none;
  width: 100%;
}

.app-input-field:read-only {
  cursor: default;
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

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  padding-left: 0.75rem;
}

/* Specific styling for date input to hide default icon if needed or align it */
input[type="date"] {
  position: relative;
}

/* Hide the default calendar icon in some browsers to use ours, or just style it */
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}
</style>
