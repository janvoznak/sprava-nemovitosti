<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <button class="close-btn" @click="handleClose">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <AppInput 
            v-model="form.label" 
            label="Označení jednotky" 
            placeholder="např. Byt č. 1"
            required
            help
          />
          <AppSelect 
            v-model="form.type" 
            label="Typ" 
            required
            help
          >
            <option value="Byt">Byt</option>
            <option value="Kancelář">Kancelář</option>
            <option value="Nebytový prostor">Nebytový prostor</option>
            <option value="Garáž">Garáž</option>
            <option value="Sklad">Sklad</option>
          </AppSelect>
        </div>

        <div class="form-row">
          <AppSelect 
            v-model="form.disposition" 
            label="Dispozice" 
            required
            help
          >
            <option value="1+kk">1+kk</option>
            <option value="1+1">1+1</option>
            <option value="2+kk">2+kk</option>
            <option value="2+1">2+1</option>
            <option value="3+kk">3+kk</option>
            <option value="3+1">3+1</option>
            <option value="4+kk">4+kk</option>
            <option value="garáž">Garáž / Stání</option>
            <option value="jiné">Jiné</option>
          </AppSelect>
          <AppInput 
            v-model.number="form.floor" 
            label="Patro" 
            type="number"
            help
          />
        </div>

        <div class="form-row">
          <AppInput 
            v-model.number="form.totalArea" 
            label="Celková plocha (m²)" 
            type="number"
            required
            help
          />
          <AppInput 
            v-model.number="form.livingArea" 
            label="Obytná plocha (m²)" 
            type="number"
            help
          />
        </div>

        <div class="divider"></div>

        <div class="form-row">
          <AppInput 
            v-model.number="form.rent" 
            label="Předpokládané nájemné (Kč)" 
            type="number"
            help
          />
          <AppInput 
            v-model.number="form.serviceCharges" 
            label="Zálohy na služby (Kč)" 
            type="number"
            help
          />
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">Zrušit</button>
        <button class="btn-primary" @click="handleSave" :disabled="!isValid">
          <span class="material-icons">save</span>
          {{ submitButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';

const props = defineProps({
  isOpen: Boolean,
  unit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  label: '',
  type: 'Byt',
  disposition: '2+kk',
  floor: 1,
  totalArea: null,
  livingArea: null,
  rent: null,
  serviceCharges: null
});

const isEditMode = computed(() => !!props.unit);
const modalTitle = computed(() => isEditMode.value ? 'Upravit jednotku' : 'Přidat novou jednotku');
const submitButtonText = computed(() => isEditMode.value ? 'Uložit změny' : 'Přidat jednotku');

watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.unit) {
      // Edit mode - populate form
      form.value = {
        label: props.unit.label,
        type: props.unit.type || 'Byt',
        disposition: props.unit.disposition,
        floor: props.unit.floor,
        totalArea: props.unit.totalArea,
        livingArea: props.unit.livingArea,
        rent: props.unit.rent,
        serviceCharges: props.unit.serviceCharges
      };
    } else {
      // Create mode - reset form
      form.value = {
        label: '',
        type: 'Byt',
        disposition: '2+kk',
        floor: 1,
        totalArea: null,
        livingArea: null,
        rent: null,
        serviceCharges: null
      };
    }
  }
});

const isValid = computed(() => {
  return form.value.label && form.value.totalArea;
});

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  emit('save', { ...form.value });
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
.divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
.modal-footer { padding: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; font-weight: 600; color: #475569; border-radius: 6px; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
