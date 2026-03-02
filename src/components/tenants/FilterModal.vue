<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Filtr nájemníků</h2>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="filter-group">
          <label>Status nájemníka</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Všechny stavy</option>
            <option value="Pronajato">Pronajato</option>
            <option value="Volné">Volné</option>
            <option value="Rezervováno">Rezervováno</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Nemovitost</label>
          <select v-model="filters.propertyId" class="filter-select">
            <option value="">Všechny nemovitosti</option>
            <option v-for="prop in properties" :key="prop.id" :value="prop.id">
              {{ prop.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="resetFilters">
          Resetovat
        </button>
        <button class="btn-primary" @click="applyFilters">
          Zobrazit výsledky
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  properties: {
    type: Array,
    default: () => []
  },
  activeFilters: {
    type: Object,
    default: () => ({ status: '', propertyId: '' })
  }
});

const emit = defineEmits(['close', 'apply']);

const filters = reactive({
  status: '',
  propertyId: ''
});

// Sync local state with props when modal opens
watch(() => props.isOpen, (val) => {
  if (val) {
    filters.status = props.activeFilters.status;
    filters.propertyId = props.activeFilters.propertyId;
  }
});

const resetFilters = () => {
  filters.status = '';
  filters.propertyId = '';
  applyFilters();
};

const applyFilters = () => {
  emit('apply', { ...filters });
  emit('close');
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

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center; justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
}

.filter-select:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
</style>
