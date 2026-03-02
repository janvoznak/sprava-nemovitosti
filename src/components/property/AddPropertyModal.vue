<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Přidat novou nemovitost</h3>
        <button class="close-btn" @click="handleClose">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <AppInput 
            v-model="form.name" 
            label="Název nemovitosti" 
            placeholder="Např. Bytový dům, Na Výsluní"
            required
            help
          />
        </div>

        <div class="form-row">
          <AppSelect 
            v-model="form.type" 
            label="Typ nemovitosti"
            help
          >
            <option value="Bytový dům">Bytový dům</option>
            <option value="Rodinný dům">Rodinný dům</option>
            <option value="Kancelářská budova">Kancelářská budova</option>
            <option value="Sklad">Sklad</option>
          </AppSelect>
        </div>

        <div class="divider"></div>
        <h4 class="section-title">Adresa</h4>

        <div class="form-row">
          <AppInput 
            v-model="form.street" 
            label="Ulice" 
            placeholder="Ulice"
            required
            help
          />
          <AppInput 
            v-model="form.houseNumber" 
            label="Číslo popisné" 
            placeholder="123"
            required
            help
          />
        </div>

        <div class="form-row">
          <AppInput 
            v-model="form.city" 
            label="Město" 
            placeholder="Město"
            required
            help
          />
          <AppInput 
            v-model="form.zip" 
            label="PSČ" 
            placeholder="123 00"
            help
          />
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">Zrušit</button>
        <button class="btn-primary" @click="handleSave" :disabled="!isValid">
          <span class="material-icons">add_business</span>
          Vytvořit nemovitost
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
  isOpen: Boolean
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  type: 'Bytový dům',
  street: '',
  houseNumber: '',
  city: '',
  zip: ''
});

watch(() => props.isOpen, (val) => {
  if (val) {
    // Reset form
    form.value = {
      name: '',
      type: 'Bytový dům',
      street: '',
      houseNumber: '',
      city: '',
      zip: ''
    };
  }
});

const isValid = computed(() => {
  return form.value.name && form.value.street && form.value.houseNumber && form.value.city;
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
  background: white; border-radius: 12px; width: 100%; max-width: 500px;
  display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0;
}
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.close-btn { background: transparent; border: none; cursor: pointer; color: #64748b; font-size: 1.2rem; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.form-group.full { width: 100%; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; width: 100%; transition: border 0.2s; }
.form-input:focus { border-color: var(--save-color); outline: none; }
.divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
.section-title { font-size: 0.9rem; font-weight: 600; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
.modal-footer { padding: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; font-weight: 600; color: #475569; border-radius: 6px; cursor: pointer; }
.btn-primary { background: var(--save-color); color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-primary:hover { background: var(--save-color-hover); }

.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
