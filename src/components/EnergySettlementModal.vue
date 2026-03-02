<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-text">
          <h3>Vyúčtování: {{ meter?.type }}</h3>
          <span class="meter-sn">{{ meter?.serialNumber }}</span>
        </div>
        <button class="close-btn" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-row split">
            <AppInput 
              :modelValue="cleanValue(meter?.lastValue)"
              label="Počáteční stav"
              readonly
              help
            />
             <AppInput 
              v-model.number="endValue"
              label="Konečný stav"
              type="number"
              placeholder="0"
              help
            />
          </div>


          <div class="consumption-info">
            <span>Spotřeba:</span>
            <strong>{{ consumption }} {{ unit }}</strong>
          </div>

          <div class="divider"></div>

          <div class="form-row split">
            <AppInput 
              v-model.number="unitPrice"
              label="Cena za jednotku (Kč)"
              type="number"
              help
            />
            <AppInput 
              v-model.number="advances"
              label="Zaplacené zálohy (Kč)"
              type="number"
              help
            />
          </div>

        </div>

        <!-- Result Box -->
        <div class="result-box" :class="resultClass">
           <div class="result-label">{{ resultLabel }}</div>
           <div class="result-amount">{{ formatCurrency(Math.abs(resultAmount)) }}</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Zrušit</button>
        <button class="btn-primary" @click="save">
          <span class="material-icons">save</span> Uložit vyúčtování
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppInput from '@/components/common/AppInput.vue';


const props = defineProps({
  isOpen: Boolean,
  meter: Object
});

const emit = defineEmits(['close', 'save']);

const endValue = ref(0);
const unitPrice = ref(6.5); // Default mock price
const advances = ref(20000); // Default mock advances

const cleanValue = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.]/g, ''));
};

const startValue = computed(() => {
    return cleanValue(props.meter?.lastValue);
});

const unit = computed(() => {
    if (!props.meter?.lastValue) return '';
    return props.meter.lastValue.replace(/[0-9.\s]/g, '');
});

const consumption = computed(() => {
    return Math.max(0, endValue.value - startValue.value);
});

const cost = computed(() => {
    return consumption.value * unitPrice.value;
});

const resultAmount = computed(() => {
    return cost.value - advances.value;
});

// If result > 0, cost is higher than advances -> NEDOPLATEK (User pays)
// If result < 0, cost is lower than advances -> PREPLATEK (Return to user)
const isUnderpayment = computed(() => resultAmount.value > 0);

const resultLabel = computed(() => {
    if (resultAmount.value === 0) return 'Vyrovnáno';
    return isUnderpayment.value ? 'NEDOPLATEK (Doplácí)' : 'PŘEPLATEK (Vrátit)';
});

const resultClass = computed(() => {
    if (resultAmount.value === 0) return 'neutral';
    return isUnderpayment.value ? 'negative' : 'positive';
});

const formatCurrency = (val) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(val);
};

// Reset fields when opening new meter
watch(() => props.meter, (newMeter) => {
    if (newMeter) {
        endValue.value = cleanValue(newMeter.lastValue) + 100; // Suggest a value
    }
});

const close = () => emit('close');
const save = () => {
    // In real app, we would emit data
    emit('save');
    close();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8fafc;
}

.header-text h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.meter-sn { font-size: 0.75rem; color: #64748b; font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; }

input.bg-gray {
  width: 100%;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

input.input-highlight {
  background: white;
  border-color: var(--save-color);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

input.disabled { color: #94a3b8; cursor: not-allowed; }

.consumption-info {
  display: flex;
  justify-content: space-between;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #475569;
}

.divider { height: 1px; background: #e2e8f0; margin: 0.5rem 0; }

/* Result Box */
.result-box {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid transparent;
}

.result-label { text-transform: uppercase; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
.result-amount { font-size: 2rem; font-weight: 800; }

.result-box.positive {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.result-box.negative {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

.result-box.neutral {
  background: #f1f5f9;
  color: #64748b;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--save-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--save-color-hover);
}


@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
