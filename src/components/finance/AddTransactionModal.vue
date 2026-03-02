<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Nová transakce</h3>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <!-- Transaction Type -->
        <div class="type-selector">
          <button 
            type="button" 
            class="type-btn income" 
            :class="{ active: form.type === 'income' }"
            @click="form.type = 'income'"
          >
            <span class="material-icons">trending_up</span> Příjem
          </button>
          <button 
            type="button" 
            class="type-btn expense" 
            :class="{ active: form.type === 'expense' }"
            @click="form.type = 'expense'"
          >
            <span class="material-icons">trending_down</span> Výdaj
          </button>
        </div>

        <div class="form-grid">
          <AppInput 
            v-model="form.description" 
            label="Popis" 
            placeholder="Např. Nájem 03/2024"
            help
          />

          <div class="form-row">
            <AppInput 
              v-model.number="form.amount" 
              label="Částka"
              type="number"
              help
            />
            <AppInput 
              v-model="form.date" 
              label="Datum splatnosti"
              type="date"
              help
            />
          </div>
        </div>

        <AppSelect 
          v-model="form.category" 
          label="Kategorie"
          help
        >
          <template v-if="form.type === 'income'">
            <option value="Nájemné">Nájemné</option>
            <option value="Služby">Služby</option>
            <option value="Jiné">Jiné</option>
          </template>
          <template v-else>
            <option value="Opravy">Opravy</option>
            <option value="Energie">Energie</option>
            <option value="Služby">Služby</option>
            <option value="Pojištění">Pojištění</option>
            <option value="Daně">Daně</option>
            <option value="Jiné">Jiné</option>
          </template>
        </AppSelect>
        
        <AppSelect 
          v-model="form.propertyId" 
          label="Nemovitost (nepovinné)"
          help
        >
            <option value="">-- Žádná --</option>
            <option value="P0001">Bytový dům Centrum</option>
            <option value="P0002">Kanceláře Nová Karolina</option>
            <option value="P0003">Skladový areál Poruba</option>
        </AppSelect>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">Zrušit</button>
        <button class="btn-primary" @click="handleSave" :disabled="!isValid">
          Uložit transakci
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  type: 'expense',
  description: '',
  amount: null,
  date: new Date().toISOString().split('T')[0],
  category: 'Opravy',
  propertyId: ''
});

// Reset form when opened
watch(() => props.isOpen, (val) => {
  if (val) {
    form.value = {
      type: 'expense',
      description: '',
      amount: null,
      date: new Date().toISOString().split('T')[0],
      category: 'Opravy',
      propertyId: ''
    };
  }
});

watch(() => form.value.type, (newType) => {
    // Reset category default based on type
    form.value.category = newType === 'income' ? 'Nájemné' : 'Opravy';
});

const isValid = computed(() => {
  return form.value.description && form.value.amount > 0 && form.value.date;
});

const handleSave = () => {
  emit('save', { ...form.value });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
   backdrop-filter: blur(4px);
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

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

.type-selector {
    display: flex; gap: 1rem; border-radius: 8px; background: #f8fafc; padding: 0.5rem;
}
.type-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.75rem; border: 1px solid transparent; border-radius: 6px; cursor: pointer; font-weight: 600; color: #64748b; background: transparent; transition: all 0.2s;
}
.type-btn.active { background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.type-btn.active.income { color: #166534; border-color: #bbf7d0; }
.type-btn.active.expense { color: #991b1b; border-color: #fecaca; }

.form-grid { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; gap: 1rem; }

.modal-footer { padding: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; font-weight: 600; color: #475569; border-radius: 6px; cursor: pointer; }
.btn-primary { background: var(--save-color); color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
.btn-primary:hover { background: var(--save-color-hover); }

.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
