<template>
  <div class="unit-detail-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav v-if="unit" :items="breadcrumbs" />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání údajů o jednotce...</p>
    </div>

    <div v-else-if="unit" class="content-wrapper">
      <!-- Header -->
      <div class="unit-header-card">
        <div class="header-main">
          <div class="title-row">
            <span class="type-badge">{{ unit.type }}</span>
            <h1 class="page-title">{{ unit.label }}</h1>
          </div>
          <div class="property-link">
             <span class="material-icons">apartment</span>
             <router-link :to="{ name: 'PropertyDetail', params: { id: unit.propertyId }}">{{ unit.propertyName }}</router-link>
          </div>
        </div>

        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">Stav</span>
            <span class="status-badge" :class="getStatusClass(unit.status)">{{ unit.status }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Dispozice</span>
            <span class="stat-value">{{ unit.disposition }}</span>
          </div>
           <div class="stat-item">
            <span class="stat-label">Plocha</span>
            <span class="stat-value">{{ unit.totalArea }} m²</span>
          </div>
           <div class="stat-item">
            <span class="stat-label">Nájemné</span>
            <span class="stat-value">{{ formatCurrency(unit.rent) }}</span>
          </div>
        </div>

        <div class="header-actions">
           <button v-if="unit.status === 'Volné'" class="btn-primary" @click="showTenantModal = true">
             <span class="material-icons">person_add</span> Přidat nájemníka
           </button>
           
           <button class="btn-secondary" @click="showEditModal = true">
             <span class="material-icons">edit</span> Upravit
           </button>

           <button class="btn-secondary" @click="$router.back()">
             <span class="material-icons">arrow_back</span> Zpět
           </button>
        </div>
      </div>

      <!-- Detail Panel Reuse -->
      <UnitDetailPanel :unit="unit" @print-settlement="handlePrintSettlement" />

    </div>

    <div v-else class="error-state">
      <span class="material-icons error-icon">error_outline</span>
      <h3>Jednotka nenalezena</h3>
      <button class="btn-primary" @click="$router.push({ name: 'PropertyList' })">Zpět na přehled</button>
    </div>

    <!-- Modals -->
    <AddUnitModal 
      :isOpen="showEditModal"
      :unit="unit"
      @close="showEditModal = false"
      @save="handleUpdateUnit"
    />

    <AddTenantModal
      :isOpen="showTenantModal"
      :unitName="unit?.label"
      :unitId="unit?.id"
      @close="showTenantModal = false"
      @save="handleAddTenant"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { unitService } from '@/services/unitService';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import UnitDetailPanel from '@/components/property/UnitDetailPanel.vue';
import AddUnitModal from '@/components/property/AddUnitModal.vue';
import AddTenantModal from '@/components/property/AddTenantModal.vue';
import { useNotification } from '@/composables/useNotification';

const route = useRoute();
const router = useRouter();
const unit = ref(null);
const loading = ref(true);
const showEditModal = ref(false);
const showTenantModal = ref(false);

const { showSuccess, showInfo } = useNotification();

const breadcrumbs = computed(() => {
  if (!unit.value) return [];
  return [
    { label: 'Dashboard', to: '/' },
    { label: 'Nemovitosti', to: { name: 'PropertyList' } },
    { label: unit.value.propertyName, to: { name: 'PropertyDetail', params: { id: unit.value.propertyId } } },
    { label: unit.value.label }
  ];
});

onMounted(async () => {
  await loadUnit();
});

const loadUnit = async () => {
  const unitId = route.params.unitId;
  if (unitId) {
    loading.value = true;
    // Simulate API call
    setTimeout(() => {
      unit.value = unitService.getUnitDetail(unitId);
      loading.value = false;
    }, 200);
  }
};

const getStatusClass = (status) => {
  const classMap = {
    'Pronajato': 'status-occupied',
    'Volné': 'status-vacant',
    'Výpověď': 'status-notice',
    'Rezervováno': 'status-reserved'
  };
  return classMap[status] || '';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(amount);
};

const handlePrintSettlement = (settlement) => {
  console.log('Print settlement', settlement);
  showInfo('Tisk vyúčtování...');
};

const handleUpdateUnit = async (updatedData) => {
  if (!unit.value) return;
  const updated = await unitService.updateUnit(unit.value.id, updatedData);
  if (updated) {
    unit.value = { ...unit.value, ...updated }; // Update local state
    showSuccess('Jednotka byla úspěšně upravena');
  }
};

const handleAddTenant = async (tenantData) => {
  // Mock implementation for assigning tenant
  // In a real app this would call unitService.assignTenant or similar
  showInfo('Funkce přiřazení nájemníka bude implementována v unitService');
  console.log('Assigning tenant:', tenantData);
  
  // Optimistic update for demo
  unit.value.status = 'Pronajato';
  unit.value.tenant = tenantData.tenant; // 'Jméno Příjmení'
  unit.value.rent = tenantData.rent;
  // Reload full data to get proper structure
  // await loadUnit(); 
};
</script>

<style scoped>
.unit-detail-view {
  padding: 1.5rem 0;
  max-width: 1600px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}
.content-wrapper {
  padding: 0 2rem;
}

.unit-header-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.type-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.property-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.property-link a {
  color: #2563eb;
  text-decoration: none;
}

.property-link a:hover {
  text-decoration: underline;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-occupied { background: #dcfce7; color: #166534; }
.status-vacant { background: #fee2e2; color: #991b1b; }
.status-notice { background: #fef3c7; color: #92400e; }
.status-reserved { background: #dbeafe; color: #1e40af; }

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #64748b;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
