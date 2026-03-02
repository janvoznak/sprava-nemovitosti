<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Přidat nájemníka - {{ unitName }}</h3>
        <button class="close-btn" @click="handleClose">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <AppInput 
            v-model="form.firstName" 
            label="Jméno" 
            placeholder="Jan"
            required
            help
          />
          <AppInput 
            v-model="form.lastName" 
            label="Příjmení" 
            placeholder="Novák"
            required
            help
          />
        </div>

        <div class="form-row">
          <AppInput 
            v-model="form.phone" 
            label="Telefon" 
            type="tel"
            placeholder="+420 777 666 555"
            help
          />
          <AppInput 
            v-model="form.email" 
            label="Email" 
            type="email"
            placeholder="jan.novak@example.com"
            help
          />
        </div>


        <div class="divider"></div>

        <div class="form-row">
          <AppInput 
            v-model="form.startDate" 
            label="Platnost smlouvy od" 
            type="date"
            required
            help
          />
          <AppInput 
            v-model="form.endDate" 
            label="Platnost smlouvy do" 
            type="date"
            help
          />
        </div>

        <div class="form-row">
          <AppInput 
            v-model.number="form.rent" 
            label="Nájemné (Kč)" 
            type="number"
            required
            help
          />
          <AppInput 
            v-model.number="form.deposit" 
            label="Kauce (Kč)" 
            type="number"
            help
          />
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">Zrušit</button>
        <button class="btn-primary" @click="handleSave" :disabled="!isValid">
          <span class="material-icons">person_add</span>
          Uložit nájemníka
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import AppInput from '@/components/common/AppInput.vue';


const props = defineProps({
  isOpen: Boolean,
  unitId: String,
  unitName: String,
  tenant: Object // Add tenant prop for editing
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  startDate: '',
  endDate: '',
  rent: null,
  deposit: null
});

watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.tenant) {
      // Pre-fill for editing
      const nameParts = props.tenant.tenant ? props.tenant.tenant.split(' ') : ['', ''];
      form.value = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: props.tenant.phone || '',
        email: props.tenant.email || '',
        startDate: formatDateForInput(props.tenant.contractStart),
        endDate: formatDateForInput(props.tenant.contractEnd),
        rent: props.tenant.rent || null,
        deposit: props.tenant.depositAmount || null
      };
    } else {
      // Reset for new tenant
      form.value = { 
        firstName: '', 
        lastName: '', 
        phone: '', 
        email: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: '', 
        rent: null, 
        deposit: null 
      };
    }
  }
});

// Helper to format "DD.MM.YYYY" to "YYYY-MM-DD"
const formatDateForInput = (dateStr) => {
  if (!dateStr || dateStr === '-') return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
};

// Helper to format "YYYY-MM-DD" back to "DD.MM.YYYY"
const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

const isValid = computed(() => {
  return form.value.firstName && form.value.lastName && form.value.rent && form.value.startDate;
});

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  const fullName = `${form.value.firstName} ${form.value.lastName}`;
  const data = {
    ...form.value,
    tenant: fullName, // Map back to 'tenant' field used in units
    contractStart: formatDateForDisplay(form.value.startDate),
    contractEnd: formatDateForDisplay(form.value.endDate),
    depositAmount: form.value.deposit,
    fullName // Keep for backward compatibility if needed
  };
  emit('save', data);
  handleClose();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}
.modal-content {
  background: white; border-radius: 12px; width: 100%; max-width: 550px;
  display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0;
}
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.close-btn { background: transparent; border: none; cursor: pointer; color: #64748b; font-size: 1.2rem; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; width: 100%; transition: border 0.2s; }
.form-input:focus { border-color: var(--save-color); outline: none; }
.divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
.modal-footer { padding: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; font-weight: 600; color: #475569; border-radius: 6px; cursor: pointer; }
.btn-primary { background: var(--save-color); color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-primary:hover { background: var(--save-color-hover); }

.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
