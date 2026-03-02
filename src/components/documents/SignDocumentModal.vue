<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Elektronický podpis</h3>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="document-summary">
          <span class="material-icons doc-icon">description</span>
          <div class="doc-info">
            <span class="doc-name">{{ documentName }}</span>
            <span class="doc-type">Dokument k podpisu</span>
          </div>
        </div>

        <div class="signature-section">
          <label class="input-label">Podpis (celé jméno)</label>
          <input 
            v-model="signatureName" 
            type="text" 
            class="signature-input"
            placeholder="Jan Novák"
            autofocus
          >
          <p class="signature-hint">Napište své jméno tak, jak bude uvedeno v podpisu.</p>
        </div>

        <div class="legal-consent">
          <label class="checkbox-container">
            <input v-model="consent" type="checkbox">
            <span class="checkmark"></span>
            <span class="consent-text">
              Souhlasím s použitím elektronického podpisu a potvrzuji, že jsem se seznámil/a s obsahem dokumentu.
            </span>
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">Zrušit</button>
        <button 
          class="btn-primary" 
          @click="handleSign"
          :disabled="!isValid"
        >
          <span class="material-icons">draw</span>
          Podepsat dokument
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  documentName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'sign']);

const signatureName = ref('');
const consent = ref(false);

const isValid = computed(() => {
  return signatureName.value.length >= 3 && consent.value;
});

const handleSign = () => {
  if (isValid.value) {
    emit('sign', {
      name: signatureName.value,
      date: new Date().toISOString()
    });
    // Reset state
    signatureName.value = '';
    consent.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.2s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.document-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.doc-icon {
  font-size: 2rem;
  color: #3b82f6;
}

.doc-info {
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-weight: 600;
  color: #0f172a;
}

.doc-type {
  font-size: 0.875rem;
  color: #64748b;
}

.signature-section {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.signature-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Dancing Script', cursive, sans-serif; /* Simulate handwriting style if available, fallback to sans */
  font-size: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;
  color: #1e293b;
}

.signature-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.signature-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.legal-consent {
  margin-top: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-container input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
}

.consent-text {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-primary {
  padding: 0.75rem 1.25rem;
  background: #2563eb;
  border: 1px solid #2563eb;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background: #1d4ed8;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
