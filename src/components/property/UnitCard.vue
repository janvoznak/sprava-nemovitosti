<template>
  <div class="unit-card" @click="$emit('click', unit)">
    <div class="card-header">
      <div class="unit-title">
        <router-link 
          :to="{ name: 'UnitDetail', params: { propertyId: propertyId, unitId: unit.id }}"
          class="hover:underline text-blue-600"
          @click.stop
        >
          {{ unit.label }}
        </router-link>
      </div>
      <button class="card-menu-btn" @click.stop="$emit('action', { type: 'menu', unit })">
        <span class="material-icons">more_vert</span>
      </button>
    </div>

    <div class="card-status">
      <span class="status-badge" :class="getStatusClass(unit.status)">
        {{ unit.status }}
      </span>
      <span class="unit-specs">{{ unit.disposition }} • {{ unit.totalArea }} m²</span>
    </div>

    <div v-if="unit.status === 'Pronajato'" class="card-tenant">
      <div class="tenant-avatar">{{ getInitials(unit.tenant) }}</div>
      <div class="tenant-info">
        <div class="tenant-name">{{ unit.tenant }}</div>
        <div class="tenant-contact">{{ unit.phone }}</div>
      </div>
    </div>

    <div v-else class="card-vacant">
      <span class="material-icons">home</span>
      <span>Volná jednotka</span>
    </div>

    <div class="card-financials">
      <div class="financial-item">
        <span class="financial-label">Nájemné:</span>
        <span class="financial-value">{{ formatCurrency(unit.rent) }}</span>
      </div>
      <div class="financial-item">
        <span class="financial-label">Smlouva do:</span>
        <span class="financial-value">{{ unit.contractEnd || '-' }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="deposit-status">
        <span v-if="unit.isDeposited" class="deposit-badge paid">
          ✓ Kauce zaplacena
        </span>
        <span v-else-if="unit.status === 'Pronajato'" class="deposit-badge unpaid">
          ⚠ Kauce nezaplacena
        </span>
        <span v-else class="deposit-badge vacant">
          - Čeká na nájemce
        </span>
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
    required: true
  }
});

defineEmits(['click', 'action']);

const getStatusClass = (status) => {
  const classMap = {
    'Pronajato': 'status-occupied',
    'Volné': 'status-vacant',
    'Výpověď': 'status-notice',
    'Rezervováno': 'status-reserved'
  };
  return classMap[status] || '';
};

const getInitials = (name) => {
  if (!name || name === '-') return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(amount);
};
</script>

<style scoped>
.unit-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.unit-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #2563eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.unit-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.card-menu-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.card-menu-btn:hover {
  background: #f1f5f9;
}

.card-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-occupied {
  background: #dcfce7;
  color: #166534;
}

.status-vacant {
  background: #fee2e2;
  color: #991b1b;
}

.status-notice {
  background: #fef3c7;
  color: #92400e;
}

.status-reserved {
  background: #dbeafe;
  color: #1e40af;
}

.unit-specs {
  font-size: 0.875rem;
  color: #64748b;
}

.card-tenant {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.tenant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
}

.tenant-info {
  flex: 1;
}

.tenant-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.tenant-contact {
  font-size: 0.8125rem;
  color: #64748b;
}

.card-vacant {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: #fef2f2;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.card-vacant .material-icons {
  font-size: 20px;
}

.card-financials {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.financial-label {
  font-size: 0.875rem;
  color: #64748b;
}

.financial-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.deposit-status {
  text-align: center;
}

.deposit-badge {
  font-size: 0.75rem;
  font-weight: 600;
}

.deposit-badge.paid {
  color: #166534;
}

.deposit-badge.unpaid {
  color: #92400e;
}

.deposit-badge.vacant {
  color: #64748b;
}
</style>
