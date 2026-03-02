<template>
  <div class="new-tenant-view">
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <router-link to="/">Dashboard</router-link>
      <span class="separator">›</span>
      <router-link to="/tenants">Adresář</router-link>
      <span class="separator">›</span>
      <span class="current">Nový nájemce</span>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Nový nájemce</h1>
        <p class="page-subtitle">Přidání nového nájemce do systému</p>
      </div>
    </div>

    <!-- Form -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- Personal Information -->
        <div class="form-section">
          <h3 class="section-title">Osobní údaje</h3>
          <div class="form-grid">
            <AppInput 
              v-model="form.name"
              label="Jméno a příjmení"
              placeholder="Jan Novák"
              required
              help
            />

            <AppInput 
              v-model="form.email"
              label="E-mail"
              type="email"
              placeholder="jan.novak@example.com"
              required
              help
            />

            <AppInput 
              v-model="form.phone"
              label="Telefon"
              type="tel"
              placeholder="+420 123 456 789"
              required
              help
            />

            <AppInput 
              v-model="form.birthDate"
              label="Datum narození"
              type="date"
              help
            />


            <AppInput 
              v-model="form.idNumber"
              label="Číslo OP / Pasu"
              placeholder="123456789"
              help
            />

            <AppInput 
              v-model="form.permanentAddress"
              label="Trvalé bydliště"
              placeholder="Ulice, Město, PSČ"
              class="full-width"
              help
            />

            <AppInput 
              v-model="form.employer"
              label="Zaměstnavatel"
              placeholder="Název firmy"
              help
            />

            <AppInput 
              v-model="form.bankAccount"
              label="Bankovní spojení"
              placeholder="123456-1234567890/0100"
              help
            />


            <AppSelect 
              v-model="form.referral" 
              label="Zdroj / Doporučení"
              help
            >
              <option value="Walk in">Walk in</option>
              <option value="Email">Email</option>
              <option value="Phone call">Phone call</option>
              <option value="Web">Web</option>
              <option value="Doporučení">Doporučení</option>
            </AppSelect>

          </div>
        </div>

        <!-- Household Members -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">Další členové domácnosti</h3>
            <button type="button" class="btn-secondary btn-sm" @click="addHouseholdMember">
              <span class="material-icons">add</span>
              Přidat člena
            </button>
          </div>
          
          <div v-if="form.householdMembers.length === 0" class="empty-members">
             <span class="text-muted">Žádní další členové domácnosti</span>
          </div>

          <div class="members-list">
            <div 
              v-for="(member, index) in form.householdMembers" 
              :key="index"
              class="member-row animate-fade-in"
            >
              <div class="member-inputs">
                <input 
                  v-model="member.name"
                  type="text" 
                  class="form-input"
                  placeholder="Jméno a příjmení"
                >
                <input 
                  v-model="member.relation"
                  type="text" 
                  class="form-input"
                  placeholder="Vztah (např. Manželka)"
                >
                <input 
                  v-model="member.birthDate"
                  type="date" 
                  class="form-input"
                >
              </div>
              <button type="button" class="btn-icon remove" @click="removeHouseholdMember(index)" title="Odstranit">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Property Assignment -->
        <div class="form-section">
          <h3 class="section-title">Přiřazení nemovitosti</h3>
          <div class="form-grid">
            <AppSelect 
              v-model="form.propertyId"
              label="Nemovitost"
              @change="onPropertyChange"
              required
              class="full-width"
              help
            >
              <option value="">Vyberte nemovitost...</option>
              <option 
                v-for="property in properties" 
                :key="property.id" 
                :value="property.id"
              >
                {{ property.name }}
              </option>
            </AppSelect>

            <AppSelect 
              v-model="form.unitId"
              label="Jednotka"
              :disabled="!form.propertyId || availableUnits.length === 0"
              required
              class="full-width"
              help
            >
              <option value="">Vyberte jednotku...</option>
              <option 
                v-for="unit in availableUnits" 
                :key="unit.id" 
                :value="unit.id"
              >
                {{ unit.label }} - {{ unit.status }}
              </option>
            </AppSelect>

          </div>
        </div>

        <!-- Contract Details -->
        <div class="form-section">
          <h3 class="section-title">Detaily smlouvy</h3>
          <div class="form-grid">
            <AppInput 
              v-model="form.contractStart"
              label="Začátek smlouvy"
              type="date"
              required
              help
            />

            <AppInput 
              v-model="form.contractEnd"
              label="Konec smlouvy"
              type="date"
              help
            />

            <AppInput 
              v-model.number="form.rent"
              label="Měsíční nájem (Kč)"
              type="number"
              placeholder="15000"
              required
              help
            />

            <AppInput 
              v-model.number="form.deposit"
              label="Kauce (Kč)"
              type="number"
              placeholder="45000"
              help
            />


            <AppSelect 
              v-model="form.status" 
              label="Stav"
              required
              help
            >
              <option value="Pronajato">Pronajato</option>
              <option value="Rezervováno">Rezervováno</option>
            </AppSelect>

          </div>
        </div>

        <!-- Insurance -->
        <div class="form-section">
          <h3 class="section-title">Pojištění</h3>
          <div class="form-grid">
            <AppInput 
              v-model="form.insurance.provider"
              label="Pojišťovna"
              placeholder="Např. Allianz"
              help
            />
            <AppInput 
              v-model="form.insurance.number"
              label="Číslo smlouvy"
              help
            />
            <AppInput 
              v-model="form.insurance.validUntil"
              label="Platnost do"
              type="date"
              help
            />

          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="handleCancel">
            Zrušit
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid">
            <span class="material-icons">save</span>
            Uložit nájemce
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { propertyService } from '@/services/propertyService';
import { useNotification } from '@/composables/useNotification';
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';

const router = useRouter();
const { showSuccess, showError } = useNotification();

// Data
const properties = ref([]);
const selectedProperty = ref(null);

const form = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  idNumber: '',
  permanentAddress: '',
  employer: '',
  bankAccount: '',
  referral: 'Walk in',
  propertyId: '',
  unitId: '',
  contractStart: '',
  contractEnd: '',
  rent: 0,
  deposit: 0,
  status: 'Pronajato',
  joinedDate: new Date().toISOString().split('T')[0],
  householdMembers: [],
  insurance: {
    provider: '',
    number: '',
    validUntil: ''
  }
});

// Load properties
onMounted(async () => {
  try {
    properties.value = await propertyService.getProperties();
  } catch (error) {
    console.error('Failed to load properties:', error);
    showError('Nepodařilo se načíst nemovitosti');
  }
});

// Computed
const availableUnits = computed(() => {
  if (!selectedProperty.value || !selectedProperty.value.units) {
    return [];
  }
  // Show all units, but mark which are available
  return selectedProperty.value.units;
});

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.email &&
    form.value.phone &&
    form.value.propertyId &&
    form.value.unitId &&
    form.value.contractStart &&
    form.value.rent > 0 &&
    form.value.status
  );
});

// Methods
const onPropertyChange = () => {
  selectedProperty.value = properties.value.find(
    p => p.id === form.value.propertyId
  );
  form.value.unitId = ''; // Reset unit selection
};

const addHouseholdMember = () => {
  form.value.householdMembers.push({
    name: '',
    relation: '',
    birthDate: ''
  });
};

const removeHouseholdMember = (index) => {
  form.value.householdMembers.splice(index, 1);
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    showError('Vyplňte prosím všechna povinná pole');
    return;
  }

  try {
    // Find the property and unit
    const property = properties.value.find(p => p.id === form.value.propertyId);
    if (!property) {
      showError('Nemovitost nenalezena');
      return;
    }

    const unitIndex = property.units.findIndex(u => u.id === form.value.unitId);
    if (unitIndex === -1) {
      showError('Jednotka nenalezena');
      return;
    }

    // Update the unit with tenant information
    const updatedUnit = {
      ...property.units[unitIndex],
      tenant: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      birthDate: form.value.birthDate,
      idNumber: form.value.idNumber,
      permanentAddress: form.value.permanentAddress,
      employer: form.value.employer,
      bankAccount: form.value.bankAccount,
      contractStart: formatDateToCzech(form.value.contractStart),
      contractEnd: form.value.contractEnd ? formatDateToCzech(form.value.contractEnd) : null,
      rent: form.value.rent,
      depositAmount: form.value.deposit,
      status: form.value.status,
      isDeposited: form.value.deposit > 0,
      joinedDate: formatDateToCzech(form.value.joinedDate),
      householdMembers: form.value.householdMembers.filter(m => m.name),
      insurancePolicy: form.value.insurance.provider ? { ...form.value.insurance } : null
    };

    // Create updated units array
    const updatedUnits = [...property.units];
    updatedUnits[unitIndex] = updatedUnit;

    // Update property
    await propertyService.updateProperty(property.id, {
      units: updatedUnits
    });

    showSuccess(`Nájemce ${form.value.name} byl úspěšně přidán`);
    router.push('/tenants');
  } catch (error) {
    console.error('Failed to add tenant:', error);
    showError('Nepodařilo se přidat nájemce');
  }
};

const formatDateToCzech = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const handleCancel = () => {
  router.push('/tenants');
};
</script>

<style scoped>
.new-tenant-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Breadcrumbs */
.breadcrumbs {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumbs a {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.separator {
  color: #cbd5e1;
}

.current {
  color: #0f172a;
  font-weight: 500;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
}

/* Form */
.form-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--save-color);
}

.form-input:disabled,
.form-select:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

.form-hint.error {
  color: #ef4444;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-submit {
  background: var(--save-color);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--save-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
}

.btn-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.btn-submit .material-icons {
  font-size: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.member-inputs {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  flex: 1;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-icon.remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

.empty-members {
  text-align: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
