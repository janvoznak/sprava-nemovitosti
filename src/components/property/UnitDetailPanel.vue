<template>
  <div class="unit-detail-panel">
    <div class="detail-grid">
      <!-- Basic Information -->
      <div class="detail-section">
        <h3 class="section-title">
          <span class="material-icons">info</span>
          Základní údaje
        </h3>
        <div class="detail-row">
          <span class="label">Označení:</span>
          <span class="value">{{ unit.label }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Dispozice:</span>
          <span class="value">{{ unit.disposition }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Celková plocha:</span>
          <span class="value">{{ unit.totalArea }} m²</span>
        </div>
        <div class="detail-row">
          <span class="label">Obytná plocha:</span>
          <span class="value">{{ unit.livingArea }} m²</span>
        </div>
        <div class="detail-row">
          <span class="label">Patro:</span>
          <span class="value">{{ unit.floor }}. patro</span>
        </div>
        <div class="detail-row">
          <span class="label">Orientace:</span>
          <span class="value">{{ unit.orientation }}</span>
        </div>
      </div>

      <!-- Equipment and Condition -->
      <div class="detail-section">
        <h3 class="section-title">
          <span class="material-icons">home</span>
          Stav a vybavení
        </h3>
        <div class="detail-row">
          <span class="label">Stav:</span>
          <span class="value badge" :class="getConditionClass(unit.condition)">
            {{ unit.condition }}
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Podlahová krytina:</span>
          <span class="value">{{ unit.flooring }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Okna:</span>
          <span class="value">{{ unit.windows }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Vybavení:</span>
          <div class="equipment-list">
            <span class="equipment-badge" v-if="unit.hasKitchen">
              <span class="material-icons">kitchen</span>
              Kuchyňská linka
            </span>
            <span class="equipment-badge" v-if="unit.hasBalcony">
              <span class="material-icons">balcony</span>
              Balkon
            </span>
            <span class="equipment-badge" v-if="unit.hasCellar">
              <span class="material-icons">warehouse</span>
              Sklep
            </span>
          </div>
        </div>
        <div class="detail-row" v-if="unit.appliances && unit.appliances.length > 0">
          <span class="label">Spotřebiče:</span>
          <div class="appliances-list">
            <span v-for="appliance in unit.appliances" :key="appliance" class="appliance-tag">
              {{ appliance }}
            </span>
          </div>
        </div>
      </div>

      <!-- Financial Information -->
      <div class="detail-section">
        <h3 class="section-title">
          <span class="material-icons">payments</span>
          Finanční informace
        </h3>
        <div class="detail-row">
          <span class="label">Nájemné:</span>
          <span class="value strong">{{ formatCurrency(unit.rent) }}/měsíc</span>
        </div>
        
        <div class="detail-row services-row">
          <div class="services-header" @click="toggleServices" :class="{ 'is-open': showServices }">
            <span class="label">Zálohy na služby:</span>
            <div class="services-value-wrapper">
              <span class="value">{{ formatCurrency(unit.serviceCharges) }}/měsíc</span>
              <span class="material-icons expand-icon">expand_more</span>
            </div>
          </div>
          
          <div v-if="showServices && unit.serviceBreakdown" class="services-breakdown">
            <div class="breakdown-item" v-for="(amount, type) in unit.serviceBreakdown" :key="type">
              <span class="breakdown-label">{{ getServiceLabel(type) }}</span>
              <span class="breakdown-value">{{ formatCurrency(amount) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-row total-row">
          <span class="label">Celkem měsíčně:</span>
          <span class="value strong highlight">{{ formatCurrency(unit.totalMonthlyPayment) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Kauce:</span>
          <span class="value">
            {{ formatCurrency(unit.depositAmount) }}
            <span v-if="unit.isDeposited" class="deposit-status paid">✓ Zaplacena</span>
            <span v-else-if="unit.status === 'Pronajato'" class="deposit-status unpaid">⚠ Nezaplacena</span>
          </span>
        </div>

        <div v-if="unit.settlements && unit.settlements.length > 0" class="detail-row settlements-row">
          <span class="label">Roční vyúčtování:</span>
          <div class="settlements-list">
            <div v-for="settlement in unit.settlements" :key="settlement.id" class="settlement-item">
              <div class="settlement-info">
                <span class="settlement-period">{{ settlement.period }}</span>
                <span class="settlement-result" :class="settlement.result > 0 ? 'text-red' : 'text-green'">
                  {{ formatCurrency(Math.abs(settlement.result)) }} 
                  {{ settlement.result > 0 ? 'Nedoplatek' : 'Přeplatek' }}
                </span>
                <span class="settlement-status" :class="settlement.status === 'Vyrovnáno' ? 'paid' : 'unpaid'">
                  {{ settlement.status }}
                </span>
              </div>
              <button class="btn-icon-small" @click="$emit('print-settlement', settlement)" title="Generovat vyúčtování v PDF">
                <span class="material-icons">picture_as_pdf</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tenant Information (if occupied) -->
      <div v-if="unit.status === 'Pronajato'" class="detail-section">
        <h3 class="section-title">
          <span class="material-icons">person</span>
          Informace o nájemci
        </h3>
        <div class="detail-row">
          <span class="label">Jméno:</span>
          <span class="value strong tenant-name-cell">
            <router-link 
              v-if="resolvedPropertyId"
              :to="{ name: 'TenantDetail', params: { propertyId: resolvedPropertyId, tenantId: unit.id }}"
              class="tenant-link"
            >
              {{ unit.tenant }}
            </router-link>
            <span v-else>{{ unit.tenant }}</span>
            <span 
              v-if="tenantDebt" 
              class="debtor-badge" 
              @click.prevent="navigateToDebtor"
              title="Klikněte pro zobrazení přehledu dluhů"
            >
              <span class="material-icons">money_off</span>
              Dlužník
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Telefon:</span>
          <span class="value">
            <a :href="`tel:${unit.phone}`" class="contact-link">{{ unit.phone }}</a>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">E-mail:</span>
          <span class="value">
            <a :href="`mailto:${unit.email}`" class="contact-link">{{ unit.email }}</a>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Smlouva od:</span>
          <span class="value">{{ unit.contractStart }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Smlouva do:</span>
          <span class="value">{{ unit.contractEnd }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Splatnost nájemného:</span>
          <span class="value">{{ unit.rentDueDay }}. den v měsíci</span>
        </div>
      </div>

      <!-- Meters -->
      <div v-if="unit.meters && unit.meters.length > 0" class="detail-section">
        <h3 class="section-title">
          <span class="material-icons">speed</span>
          Měřidla
        </h3>
        <div class="meters-table">
          <div v-for="meter in unit.meters" :key="meter.serialNumber" class="meter-row">
            <div class="meter-type">{{ meter.type }}</div>
            <div class="meter-info">
              <span class="meter-serial">{{ meter.serialNumber }}</span>
              <span class="meter-reading">{{ meter.lastReading }} ({{ meter.lastReadingDate }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- History and Notes -->
      <div class="detail-section full-width">
        <h3 class="section-title">
          <span class="material-icons">history</span>
          Historie a poznámky
        </h3>
        <div v-if="unit.lastRenovation" class="detail-row">
          <span class="label">Poslední renovace:</span>
          <span class="value">{{ unit.lastRenovation }}</span>
        </div>
        <div v-if="unit.renovationNotes" class="detail-row">
          <span class="label">Poznámky k renovaci:</span>
          <span class="value">{{ unit.renovationNotes }}</span>
        </div>
        <div v-if="unit.tenantHistory && unit.tenantHistory.length > 0" class="detail-row">
          <span class="label">Předchozí nájemci:</span>
          <div class="tenant-history">
            <div v-for="(history, idx) in unit.tenantHistory" :key="idx" class="history-item">
              <strong>{{ history.tenant }}</strong>
              <span class="date-range">({{ history.from }} - {{ history.to }})</span>
            </div>
          </div>
        </div>
        <div v-if="unit.internalNotes" class="detail-row notes-row">
          <span class="label">Interní poznámky:</span>
          <div class="notes-content">{{ unit.internalNotes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  unit: {
    type: Object,
    required: true
  },
  propertyId: {
    type: String,
    default: null
  }
});

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { calculateDebtSummary } from '@/utils/debtCalculations';
import { mockIncomes } from '@/mock/finance';

const router = useRouter();

const resolvedPropertyId = computed(() => {
  return props.propertyId || props.unit.propertyId;
});

const tenantDebt = computed(() => {
  if (!props.unit.tenant || props.unit.tenant === '-' || !resolvedPropertyId.value) return null;
  return calculateDebtSummary(mockIncomes, props.unit.tenant, resolvedPropertyId.value);
});

const navigateToDebtor = () => {
  router.push({ path: '/debtors', query: { search: props.unit.tenant } });
};

const showServices = ref(false);

const toggleServices = () => {
  showServices.value = !showServices.value;
};

const getServiceLabel = (key) => {
  const labels = {
    coldWater: 'Studená voda',
    hotWater: 'Teplá voda',
    heating: 'Topení',
    waste: 'Odpad',
    electricityCommon: 'Společná elektřina',
    elevator: 'Výtah',
    cleaning: 'Úklid'
  };
  return labels[key] || key;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(amount);
};

const getConditionClass = (condition) => {
  const classMap = {
    'Výborný': 'condition-excellent',
    'Velmi dobrý': 'condition-very-good',
    'Dobrý': 'condition-good',
    'Uspokojivý': 'condition-fair'
  };
  return classMap[condition] || '';
};
</script>

<style scoped>
.unit-detail-panel {
  padding: 2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.detail-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-title .material-icons {
  font-size: 1.25rem;
  color: #2563eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8fafc;
}

.detail-row:last-child {
  border-bottom: none;
}

/* Services Breakdown */
.services-row {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-bottom: 1px solid #f8fafc;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  cursor: pointer;
  user-select: none;
}

.services-value-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  color: #94a3b8;
  transition: transform 0.2s;
}

.services-header.is-open .expand-icon {
  transform: rotate(180deg);
}

.services-breakdown {
  padding: 0 1rem 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.8rem;
  color: #64748b;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-value {
  font-weight: 500;
  color: #475569;
}

/* Settlement History */
.settlements-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.settlements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.85rem;
}

.settlement-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
}

.btn-icon-small {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-icon-small .material-icons {
  font-size: 18px;
}

.settlement-period {
  font-weight: 600;
  color: #1e293b;
}

.settlement-result {
  font-weight: 500;
}

.text-red { color: #dc2626; }
.text-green { color: #16a34a; }

.settlement-status {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.settlement-status.paid {
  background: #dcfce7;
  color: #166534;
}

.settlement-status.unpaid {
  background: #fee2e2;
  color: #991b1b;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 0.875rem;
  color: #0f172a;
  text-align: right;
}

.value.strong {
  font-weight: 600;
}

.value.highlight {
  color: #2563eb;
}

.total-row {
  background: #f8fafc;
  padding: 1rem;
  margin: 0.5rem -1.5rem 0.5rem;
  border: none;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.condition-excellent {
  background: #dcfce7;
  color: #166534;
}

.condition-very-good {
  background: #d1fae5;
  color: #047857;
}

.condition-good {
  background: #dbeafe;
  color: #1e40af;
}

.condition-fair {
  background: #fef3c7;
  color: #92400e;
}

.equipment-list, .appliances-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.equipment-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.equipment-badge .material-icons {
  font-size: 16px;
}

.appliance-tag {
  padding: 0.25rem 0.625rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.75rem;
}

.deposit-status {
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.deposit-status.paid {
  color: #166534;
}

.deposit-status.unpaid {
  color: #92400e;
}

.contact-link {
  color: #2563eb;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

.meters-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meter-row {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meter-type {
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
}

.meter-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.meter-serial {
  font-size: 0.75rem;
  color: #64748b;
}

.meter-reading {
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

.tenant-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 4px;
}

.date-range {
  color: #64748b;
  font-size: 0.875rem;
}

.notes-row {
  flex-direction: column;
  gap: 0.75rem;
}

.notes-content {
  padding: 1rem;
  background: #fffbeb;
  border-left: 3px solid #fbbf24;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #78350f;
  line-height: 1.6;
}

.tenant-link {
  color: #2563eb;
  text-decoration: none;
}

.tenant-link:hover {
  text-decoration: underline;
}

.tenant-name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.debtor-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.debtor-badge:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.debtor-badge .material-icons {
  font-size: 14px;
}
</style>
