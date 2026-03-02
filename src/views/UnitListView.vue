<template>
  <div class="unit-list-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Jednotky' }
    ]" />

    <!-- Header -->
    <div class="list-header">
      <div class="title-group">
        <h1 class="page-title">Seznam jednotek</h1>
      </div>
      <div class="header-actions">
        <div class="filter-dropdown-container">
          <button @click="isFilterOpen = !isFilterOpen" class="btn-icon-secondary" :class="{ active: isFilterOpen || statusFilter || cityFilter }">
            <span class="material-icons">filter_list</span>
          </button>
          
          <div v-if="isFilterOpen" class="filter-dropdown-menu">
            <div class="filter-item">
              <label>Stav</label>
              <select v-model="statusFilter" class="filter-select">
                <option value="">Všechny stavy</option>
                <option value="Pronajato">Pronajato</option>
                <option value="Volné">Volné</option>
              </select>
            </div>
            <div class="filter-item">
              <label>Město</label>
              <select v-model="cityFilter" class="filter-select">
                <option value="">Všechna města</option>
                <option v-for="city in uniqueCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>
            <div v-if="statusFilter || cityFilter" class="filter-actions">
              <button @click="resetFilters" class="btn-text">Zrušit filtry</button>
            </div>
          </div>
        </div>
        <ViewModeToggle />
        <button @click="handleAddUnit" class="btn-primary">
          <span class="material-icons">add</span>
          Přidat jednotku
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <StatsSummaryBar 
      :totalUnits="totalUnits"
      :occupiedUnits="occupiedUnits"
      :vacantUnits="vacantUnits"
    />



    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání jednotek...</p>
    </div>

    <!-- Units Table -->
    <div v-else class="table-container">
      <table class="units-table">
        <thead>
          <tr>
            <th @click="sortBy('unitLabel')" style="width: 20%">
              Jednotka
              <span class="sort-icon" v-if="sortColumn === 'unitLabel'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('fullAddress')" style="width: 25%">
              Adresa nemovitosti
              <span class="sort-icon" v-if="sortColumn === 'fullAddress'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('tenant')" style="width: 20%">
              Nájemník
              <span class="sort-icon" v-if="sortColumn === 'tenant'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('status')" style="width: 120px">
              Stav
              <span class="sort-icon" v-if="sortColumn === 'status'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('rent')" style="width: 130px; text-align: right;">
              Nájemné
              <span class="sort-icon" v-if="sortColumn === 'rent'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th style="width: 100px; text-align: center;">Akce</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="unit in paginatedUnits" 
            :key="unit.id"
            class="unit-row"
            @click="navigateToUnit(unit)"
          >
            <td>
              <div class="unit-cell">
                <span class="material-icons unit-icon">meeting_room</span>
                <div class="unit-info">
                  <div class="unit-name">{{ unit.unitLabel }}</div>
                  <div class="unit-meta">{{ unit.floor }}. patro</div>
                </div>
              </div>
            </td>
            <td>
              <div class="address-cell">
                <div class="address-main">{{ unit.propertyName }}</div>
                <div class="address-city">{{ unit.propertyCity }}</div>
              </div>
            </td>
            <td>
              <div v-if="unit.tenant && unit.tenant !== '-'" class="tenant-cell">
                <div class="tenant-avatar">{{ getInitials(unit.tenant) }}</div>
                <div class="tenant-info">
                  <div class="tenant-name">{{ unit.tenant }}</div>
                  <div class="tenant-contact">{{ unit.email }}</div>
                </div>
              </div>
              <span v-else class="empty-tenant">—</span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(unit.status)">
                {{ unit.status }}
              </span>
            </td>
            <td style="text-align: right;">
              <span v-if="unit.rent" class="rent-amount">
                {{ formatCurrency(unit.rent) }}
              </span>
              <span v-else class="empty-rent">—</span>
            </td>
            <td @click.stop class="action-cell">
              <div class="action-wrapper">
                <button 
                  class="action-btn menu-btn" 
                  @click.stop="toggleMenu(unit.id)"
                  title="Více akcí"
                >
                  <span class="material-icons">more_vert</span>
                </button>
                <ActionMenu 
                  v-if="activeMenuId === unit.id"
                  @close="activeMenuId = null"
                  @action="(action) => {
                    activeMenuId = null;
                    if (action === 'preview' || action === 'edit') viewUnit(unit);
                    else if (action === 'quick-contact') contactTenant(unit);
                    else if (action === 'quick-contract') showInfo('Správa smluv bude brzy dostupná');
                    else if (action === 'quick-maintenance') showInfo('Hlášení závad bude brzy dostupné');
                    else if (action === 'quick-payment') showInfo('Příjem plateb bude brzy dostupný');
                    else if (action === 'delete') showInfo('Smazání jednotky bude brzy dostupné');
                  }"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredUnits.length === 0" class="empty-state">
        <span class="material-icons empty-icon">search_off</span>
        <p>Nebyly nalezeny žádné jednotky</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredUnits.length > 0" class="pagination-container">
      <div class="pagination-info">
        Zobrazeno <b>{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredUnits.length) }}</b> z <b>{{ filteredUnits.length }}</b> jednotek
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import ViewModeToggle from '@/components/ViewModeToggle.vue';
import StatsSummaryBar from '@/components/dashboard/StatsSummaryBar.vue';
import ActionMenu from '@/components/ActionMenu.vue';
import { propertyService } from '@/services/propertyService';
import { useNotification } from '@/composables/useNotification';

const router = useRouter();
const { showSuccess, showInfo } = useNotification();

// Data
const properties = ref([]);
const units = ref([]);
const loading = ref(true);
const activeMenuId = ref(null);

const toggleMenu = (unitId) => {
  if (activeMenuId.value === unitId) {
    activeMenuId.value = null;
  } else {
    activeMenuId.value = unitId;
  }
};
const statusFilter = ref('');
const cityFilter = ref('');
const sortColumn = ref('unitLabel');
const sortDirection = ref('asc');
const isFilterOpen = ref(false);

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.filter-dropdown-container')) {
    isFilterOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const resetFilters = () => {
  statusFilter.value = '';
  cityFilter.value = '';
  isFilterOpen.value = false;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15);

// Load data
onMounted(async () => {
  try {
    loading.value = true;
    properties.value = await propertyService.getProperties();
    units.value = extractUnitsFromProperties(properties.value);
  } catch (error) {
    console.error('Failed to load units:', error);
  } finally {
    loading.value = false;
  }
});

// Extract flat list of units from all properties
const extractUnitsFromProperties = (props) => {
  const unitList = [];
  
  props.forEach(property => {
    if (property.units && property.units.length > 0) {
      property.units.forEach(unit => {
        unitList.push({
          id: `${property.id}-${unit.id}`,
          unitId: unit.id,
          unitLabel: unit.label || `Jednotka ${unit.id}`,
          propertyId: property.id,
          propertyName: property.name,
          propertyCity: property.city,
          fullAddress: `${property.street} ${property.houseNumber}, ${property.city}`,
          tenant: unit.tenant || '-',
          email: unit.email || '-',
          phone: unit.phone || '-',
          status: unit.status || 'Volné',
          rent: unit.rent || 0,
          floor: unit.floor || 1,
          disposition: unit.disposition || 'N/A',
          area: unit.totalArea || unit.area || 0
        });
      });
    }
  });
  
  return unitList;
};

// Computed
const totalUnits = computed(() => filteredUnits.value.length);
const occupiedUnits = computed(() => filteredUnits.value.filter(u => u.status === 'Pronajato').length);
const vacantUnits = computed(() => filteredUnits.value.filter(u => u.status === 'Volné').length);

const uniqueCities = computed(() => {
  const cities = [...new Set(units.value.map(u => u.propertyCity))];
  return cities.sort();
});

const filteredUnits = computed(() => {
  let result = [...units.value];
  
  // Status filter
  if (statusFilter.value) {
    result = result.filter(u => u.status === statusFilter.value);
  }
  
  // City filter
  if (cityFilter.value) {
    result = result.filter(u => u.propertyCity === cityFilter.value);
  }
  
  // Sorting
  result.sort((a, b) => {
    let aVal = a[sortColumn.value];
    let bVal = b[sortColumn.value];
    
    // Handle numeric values
    if (sortColumn.value === 'rent') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredUnits.value.length / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const paginatedUnits = computed(() => filteredUnits.value.slice(startIndex.value, endIndex.value));

// Watchers
watch([statusFilter, cityFilter], () => {
  currentPage.value = 1;
});

// Methods
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const getStatusClass = (status) => {
  if (status === 'Pronajato') return 'status-active';
  if (status === 'Volné') return 'status-vacant';
  return 'status-reserved';
};

const getInitials = (name) => {
  if (!name || name === '-') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0] + (name[1] || '');
};

const navigateToUnit = (unit) => {
  router.push({
    name: 'PropertyDetail',
    params: { id: unit.propertyId },
    query: { tab: 'units', unit: unit.unitId }
  });
};

const viewUnit = (unit) => {
  navigateToUnit(unit);
};

const contactTenant = (unit) => {
  showInfo(`Kontaktovat: ${unit.tenant} (${unit.email})`);
};

const handleAddUnit = () => {
  showInfo('Funkce přidání jednotky přímo ze seznamu bude brzy dostupná. Nyní prosím přidejte jednotku v detailu konkrétní nemovitosti.');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<style scoped>
.unit-list-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-primary .material-icons {
  font-size: 20px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Stats Bar */
/* Replaced by StatsSummaryBar component */

.filter-dropdown-container {
  position: relative;
}

.btn-icon-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

.btn-icon-secondary.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
}

.filter-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 1rem;
  min-width: 240px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-actions {
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.btn-text {
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}

.filter-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  background-color: #f8fafc;
}

.filter-select:focus {
  border-color: #3b82f6;
  background-color: white;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table */
.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.units-table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.units-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  user-select: none;
}

.units-table th:hover {
  background: #f1f5f9;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.875rem;
}

.units-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  cursor: pointer;
}

.units-table tbody tr:hover {
  background: #f8fafc;
}

.units-table td {
  padding: 1.25rem 1.5rem;
  font-size: 0.9375rem;
  color: #334155;
  vertical-align: middle;
}

/* Unit Cell */
.unit-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.unit-icon {
  color: #64748b;
  font-size: 1.5rem;
}

.unit-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.unit-name {
  font-weight: 600;
  color: #0f172a;
}

.unit-meta {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Address Cell */
.address-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.address-main {
  color: #0f172a;
  font-weight: 500;
}

.address-city {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Tenant Cell */
.tenant-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.tenant-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
}

.tenant-contact {
  font-size: 0.8125rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-tenant {
  color: #cbd5e1;
  font-size: 1.25rem;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-vacant {
  background: #fee2e2;
  color: #991b1b;
}

.status-reserved {
  background: #fef3c7;
  color: #92400e;
}

/* Rent */
.rent-amount {
  font-weight: 600;
  color: #0f172a;
}

.empty-rent {
  color: #cbd5e1;
}

/* Actions */
.action-cell {
  position: relative;
  text-align: center;
}

.action-wrapper {
  display: flex;
  justify-content: center;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1976D2;
}

.action-btn .material-icons {
  font-size: 18px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.125rem;
  margin: 0;
}

/* Pagination */
.pagination-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  color: #475569;
  background: #f8fafc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f8fafc;
}

.page-number.active {
  background: #1976D2;
  color: white;
  font-weight: 600;
}
</style>
