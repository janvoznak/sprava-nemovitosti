<template>
  <div class="form-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Nemovitosti', to: '/properties' },
      { label: 'Přidat nemovitost' }
    ]" />

    <div class="form-container">
      <h1 class="page-title">Nová nemovitost</h1>
      
      <!-- Wizard Steps -->
      <div class="wizard-steps">
        <div class="step" :class="{ active: step >= 1, completed: step > 1, error: stepErrors[0] }">
          <div class="step-circle">1</div>
          <span class="step-label">Základní & Adresa</span>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: step >= 2, completed: step > 2, error: stepErrors[1] }">
          <div class="step-circle">2</div>
          <span class="step-label">Technické & Energie</span>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: step >= 3, completed: step > 3, error: stepErrors[2] }">
          <div class="step-circle">3</div>
          <span class="step-label">Jednotky & Dokumenty</span>
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-card">
        <!-- Step 1: Basic Info & Address -->
        <div v-if="step === 1" class="step-content">
          <div class="step-header">
            <h3><span class="material-icons">info</span> Základní údaje a adresa</h3>
            <p class="step-desc">Identifikační údaje objektu a jeho přesné umístění v katastru.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Název nemovitosti*</label>
              <input type="text" v-model="form.name" :class="{ 'input-error': errors.name }" placeholder="Např. Villa Rezidence">
              <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
            </div>
            <div class="form-group">
              <label>Vnitřní označení (ID)</label>
              <input type="text" v-model="form.internalRef" placeholder="Např. P0001">
            </div>
            <div class="form-group">
              <label>Typ nemovitosti*</label>
              <select v-model="form.type">
                <option value="Bytový dům">Bytový dům</option>
                <option value="Rodinný dům">Rodinný dům</option>
                <option value="Kancelářská budova">Kancelářská budova</option>
                <option value="Průmyslový objekt">Průmyslový objekt</option>
              </select>
            </div>
            <div class="form-group">
              <label>Typ vlastnictví</label>
              <select v-model="form.ownershipType">
                <option value="vlastni">Vlastní</option>
                <option value="pronajem">Pronájem</option>
                <option value="sprava">Správa</option>
              </select>
            </div>

            <div class="divider span-2">Adresa a lokalizace</div>

            <div class="form-group">
              <label>Ulice*</label>
              <input type="text" v-model="form.street" :class="{ 'input-error': errors.street }">
              <span v-if="errors.street" class="error-msg">{{ errors.street }}</span>
            </div>
            <div class="form-group">
              <label>Číslo popisné/evidenční*</label>
              <input type="text" v-model="form.houseNumber" :class="{ 'input-error': errors.houseNumber }">
              <span v-if="errors.houseNumber" class="error-msg">{{ errors.houseNumber }}</span>
            </div>
            <div class="form-group">
              <label>Město*</label>
              <input type="text" v-model="form.city" :class="{ 'input-error': errors.city }">
              <span v-if="errors.city" class="error-msg">{{ errors.city }}</span>
            </div>
            <div class="form-group">
              <label>PSČ*</label>
              <input type="text" v-model="form.zipCode" :class="{ 'input-error': errors.zipCode }">
              <span v-if="errors.zipCode" class="error-msg">{{ errors.zipCode }}</span>
            </div>
            <div class="form-group">
              <label>Kraj</label>
              <input type="text" v-model="form.region">
            </div>
            <div class="form-group">
              <label>Katastrální území</label>
              <input type="text" v-model="form.cadastralArea">
            </div>
          </div>
        </div>

        <!-- Step 2: Technical & Energy -->
        <div v-if="step === 2" class="step-content">
          <div class="step-header">
            <h3><span class="material-icons">architecture</span> Technické parametry a energie</h3>
            <p class="step-desc">Technický stav objektu a energetické přípojky.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Výměra pozemku (m²)</label>
              <input type="number" v-model="form.tech_land_area">
            </div>
            <div class="form-group">
              <label>Užitná plocha (m²)*</label>
              <input type="number" v-model="form.vymera_m2" :class="{ 'input-error': errors.vymera_m2 }">
              <span v-if="errors.vymera_m2" class="error-msg">{{ errors.vymera_m2 }}</span>
            </div>
            <div class="form-group">
              <label>Stav objektu</label>
              <select v-model="form.tech_state">
                <option>Velmi dobrý</option>
                <option>Dobrý</option>
                <option>Udržovaný</option>
                <option>Novostavba</option>
                <option>Před rekonstrukcí</option>
              </select>
            </div>
            <div class="form-group">
              <label>Počet podlaží</label>
              <input type="number" v-model="form.tech_floors">
            </div>

            <div class="divider span-2">Energetické údaje</div>

            <div class="form-group">
              <label>EAN kód (elektřina)</label>
              <input type="text" v-model="form.ean_kod" placeholder="18místný kód">
            </div>
            <div class="form-group">
              <label>EIC kód (plyn)</label>
              <input type="text" v-model="form.eic_kod" placeholder="16místný kód">
            </div>
            <div class="form-group">
              <label>Energetická třída</label>
              <select v-model="form.energy_class">
                <option v-for="c in ['A', 'B', 'C', 'D', 'E', 'F', 'G']" :key="c">{{ c }} - energetická třída</option>
              </select>
            </div>
            <div class="form-group">
              <label>Vytápění</label>
              <input type="text" v-model="form.energy_heating" placeholder="Např. Plynový kotel">
            </div>
          </div>
        </div>

        <!-- Step 3: Units & Documents -->
        <div v-if="step === 3" class="step-content">
          <div class="step-header">
            <h3><span class="material-icons">business</span> Jednotky a dokumenty</h3>
            <p class="step-desc">Počet jednotek a nahrání souvisejících dokumentů.</p>
          </div>

          <div class="form-grid">
            <div class="form-group full">
              <label>Počet jednotek (bytových/nebytových)*</label>
              <input type="number" v-model="unitCount" min="1" :class="{ 'input-error': errors.unitCount }">
              <span v-if="errors.unitCount" class="error-msg">{{ errors.unitCount }}</span>
            </div>
            
            <div class="form-group span-2">
               <label>Vybavenost a služby</label>
               <div class="checkbox-group">
                 <label><input type="checkbox" v-model="form.features.parking"> Parkování</label>
                 <label><input type="checkbox" v-model="form.features.elevator"> Výtah</label>
                 <label><input type="checkbox" v-model="form.features.garden"> Zahrada</label>
                 <label><input type="checkbox" v-model="form.features.security"> Zabezpečení</label>
               </div>
            </div>
          </div>

          <div class="divider">Přílohy</div>
          <div class="file-upload-area">
            <span class="material-icons">cloud_upload</span>
            <p>Nahrajte fotografie nebo list vlastnictví</p>
            <button class="btn-outline">Vybrat soubory</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button v-if="step > 1" @click="step--" class="btn-secondary">Zpět</button>
          <div class="spacer"></div>
          <button v-if="step < 3" @click="nextStep" class="btn-primary">
            Pokračovat <span class="material-icons">arrow_forward</span>
          </button>
          <button v-if="step === 3" @click="submit" class="btn-success">
            <span class="material-icons">check</span> Dokončit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { propertyService } from '@/services/propertyService';
import { useNotification } from '@/composables/useNotification';

const router = useRouter();
const { showSuccess, showError } = useNotification();
const step = ref(1);
const unitCount = ref(1);
const stepErrors = ref([false, false, false]);
const errors = reactive({});

const form = reactive({
  name: '',
  internalRef: '',
  type: 'Bytový dům',
  ownershipType: 'vlastni',
  listingDate: new Date().toISOString().split('T')[0],
  
  // Address
  street: '',
  houseNumber: '',
  city: '',
  zipCode: '',
  region: '',
  cadastralArea: '',
  country: 'cz',
  
  // Technical
  vymera_m2: null,
  tech_state: 'Dobrý',
  tech_floors: 1,
  tech_floors_under: 0,
  tech_land_area: null,
  tech_construction: 'Zděná',
  
  // Energy
  ean_kod: '',
  eic_kod: '',
  energy_class: 'C - energetická třída',
  energy_indicator: null,
  energy_heating: '',
  cislo_odberneho_mist: '',
  
  features: {
    parking: false,
    elevator: false,
    garden: false,
    security: false
  },
  
  units: [],
  revisions: [],
  meters: [],
  occupancyPercentage: 0,
  hasDebt: false,
  debtAmount: 0
});

const validateStep = (s) => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);
  let isValid = true;

  if (s === 1) {
    if (!form.name) { errors.name = 'Název nemovitosti je povinný'; isValid = false; }
    if (!form.street) { errors.street = 'Ulice je povinná'; isValid = false; }
    if (!form.houseNumber) { errors.houseNumber = 'Číslo popisné je povinné'; isValid = false; }
    if (!form.city) { errors.city = 'Město je povinné'; isValid = false; }
    if (!form.zipCode) { errors.zipCode = 'PSČ je povinné'; isValid = false; }
  } else if (s === 2) {
    if (!form.vymera_m2) { errors.vymera_m2 = 'Užitná plocha je povinná'; isValid = false; }
  } else if (s === 3) {
    if (!unitCount.value || unitCount.value < 1) { errors.unitCount = 'Zadejte platný počet jednotek'; isValid = false; }
  }

  stepErrors.value[s - 1] = !isValid;
  return isValid;
};

const nextStep = () => {
  if (validateStep(step.value)) {
    step.value++;
  } else {
    showError('Prosím opravte chyby ve formuláři');
  }
};

const submit = async () => {
  if (!validateStep(3)) {
    showError('Prosím opravte chyby ve formuláři');
    return;
  }

  try {
    // Generate empty units based on count
    form.units = Array.from({ length: unitCount.value }, (_, i) => ({
      id: `U${(i + 1).toString().padStart(3, '0')}`,
      label: `Jednotka ${i + 1}`,
      status: 'Volné',
      disposition: '2+kk',
      area: 50,
      rent: 0
    }));

    await propertyService.addProperty({...form});
    showSuccess('Nemovitost byla úspěšně přidána');
    router.push('/properties');
  } catch (error) {
    showError('Nepodařilo se uložit nemovitost');
    console.error(error);
  }
};
</script>

<style scoped>
.form-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

/* Wizard */
.wizard-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 4rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  transition: all 0.3s;
}

.step.active .step-circle {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.step.error .step-circle {
  border-color: #ef4444;
  color: #ef4444;
}

.step.completed .step-circle {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  position: absolute;
  top: 50px;
  width: max-content;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.step.active .step-label {
  color: #0f172a;
}

.step.error .step-label {
  color: #ef4444;
}

.step-line {
  height: 2px;
  width: 100px;
  background: #e2e8f0;
  margin: 0;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  margin-bottom: 2rem;
}

.step-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
}

.step-header .material-icons {
  color: #3b82f6;
}

.step-desc {
  color: #64748b;
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.divider {
  grid-column: span 2;
  font-weight: 700;
  font-size: 0.8125rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  padding: 1.5rem 0 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.span-2 { grid-column: span 2; }
.form-group.full { grid-column: span 2; }

.form-group label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: #475569;
}

.form-group input, .form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
  background: #fffcfc !important;
}

.error-msg {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

/* Step 3 specific */
.file-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  margin-bottom: 2rem;
  transition: all 0.2s;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background: #f1f7ff;
}

.file-upload-area .material-icons { font-size: 3.5rem; color: #94a3b8; }

/* Actions */
.form-actions {
  display: flex;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
  gap: 1rem;
}

.spacer { flex: 1; }

.btn-primary, .btn-secondary, .btn-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
