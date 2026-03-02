<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <span v-if="action === 'contact'">📧 Kontaktovat nájemníka</span>
          <span v-else-if="action === 'payment'">💰 Zaznamenat platbu</span>
          <span v-else-if="action === 'contract'">📄 Stáhnout smlouvu</span>
          <span v-else>Vybrat jednotku</span>
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="subtitle">Vyberte, pro kterou jednotku chcete akci provést:</p>
        
        <div class="units-list">
          <div v-for="unit in occupiedUnits" :key="unit.id" class="unit-item">
            <div class="unit-info">
              <span class="unit-label">{{ unit.label }}</span>
              <span class="tenant-name">{{ unit.tenant }}</span>
            </div>
            
            <div class="unit-actions">
              <template v-if="action === 'contact'">
                <a :href="'tel:' + unit.phone" class="action-link" title="Zavolat">
                  <span class="material-icons">phone</span> {{ unit.phone }}
                </a>
                <a :href="'mailto:' + unit.email" class="action-link" title="Napsat email">
                  <span class="material-icons">email</span> {{ unit.email }}
                </a>
              </template>
              
              <template v-else-if="action === 'payment'">
                <button class="btn-primary-small" @click="$emit('select-unit', unit)">
                  Zaznamenat
                </button>
              </template>

              <template v-else-if="action === 'contract'">
                <button class="btn-secondary-small" @click="downloadContract(unit)">
                  <span class="material-icons">download</span> Stáhnout
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="occupiedUnits.length === 0" class="empty-state">
          <span class="material-icons">people_outline</span>
          <p>Žádní aktivní nájemníci</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotification } from '@/composables/useNotification';

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  action: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'select-unit']);
const { showSuccess } = useNotification();

const occupiedUnits = computed(() => {
  return props.property.units.filter(u => u.tenant !== '-' && u.tenant);
});

const downloadContract = (unit) => {
  emit('generate-document', unit);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
}
.close-btn:hover { background: #f1f5f9; color: #1e293b; }

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.subtitle {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.units-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.unit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.unit-info {
  display: flex;
  flex-direction: column;
}

.unit-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
}

.unit-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #2563eb;
  text-decoration: none;
}
.action-link:hover { text-decoration: underline; }
.action-link .material-icons { font-size: 16px; }

.btn-primary-small {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary-small:hover { background: #1d4ed8; }

.btn-secondary-small {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-secondary-small:hover { background: #f1f5f9; }
.btn-secondary-small .material-icons { font-size: 16px; }

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 2rem;
}
.empty-state .material-icons { font-size: 48px; margin-bottom: 0.5rem; display: block; }
</style>
