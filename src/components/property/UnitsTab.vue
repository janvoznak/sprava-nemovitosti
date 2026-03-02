<template>
  <div class="units-tab">
    <!-- Header with actions -->
    <div class="tab-header">
      <div class="header-left">
        <span class="material-icons icon-blue">door_front</span>
        <h2 class="tab-title">Přehled jednotek</h2>
        <span class="unit-count">({{ filteredUnits.length }} z {{ units.length }})</span>
      </div>
      <div class="header-right">
        <button class="btn-view" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
          <span class="material-icons">view_list</span>
        </button>
        <button class="btn-view" :class="{ active: viewMode === 'cards' }" @click="viewMode = 'cards'">
          <span class="material-icons">grid_view</span>
        </button>
        <button class="btn-primary" @click="handleAddUnit">
          <span class="material-icons">add</span>
          Přidat jednotku
        </button>
      </div>
    </div>

    <!-- Filters and search -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Hledat jednotku nebo nájemce..."
          class="search-input"
        >
      </div>

      <div class="filter-group">
        <label>Stav:</label>
        <div class="checkbox-filters">
          <label class="checkbox-label" v-for="status in availableStatuses" :key="status">
            <input type="checkbox" :value="status" v-model="filters.status">
            <span>{{ status }}</span>
          </label>
        </div>
      </div>

      <div class="filter-group">
        <label>Dispozice:</label>
        <select v-model="filters.dispositionFilter" class="filter-select">
          <option value="">Všechny</option>
          <option value="1+kk">1+kk</option>
          <option value="1+1">1+1</option>
          <option value="2+kk">2+kk</option>
          <option value="2+1">2+1</option>
          <option value="3+kk">3+kk</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Patro:</label>
        <select v-model="filters.floorFilter" class="filter-select">
          <option value="">Všechna</option>
          <option v-for="floor in availableFloors" :key="floor" :value="floor">
            {{ floor }}. patro
          </option>
        </select>
      </div>

      <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear">
        <span class="material-icons">clear</span>
        Vymazat filtry
      </button>
    </div>

    <!-- Table view -->
    <div v-if="viewMode === 'table'" class="table-container">
      <table class="units-table">
        <thead>
          <tr>
            <th @click="sortBy('label')" class="sortable">
              Jednotka
              <span class="material-icons sort-icon">{{ getSortIcon('label') }}</span>
            </th>
            <th>Dispozice</th>
            <th @click="sortBy('area')" class="sortable">
              Plocha
              <span class="material-icons sort-icon">{{ getSortIcon('area') }}</span>
            </th>
            <th @click="sortBy('floor')" class="sortable">
              Patro
              <span class="material-icons sort-icon">{{ getSortIcon('floor') }}</span>
            </th>
            <th>Stav</th>
            <th>Nájemce</th>
            <th @click="sortBy('rent')" class="sortable">
              Nájemné
              <span class="material-icons sort-icon">{{ getSortIcon('rent') }}</span>
            </th>
            <th>Kauce</th>
            <th @click="sortBy('contractEnd')" class="sortable">
              Smlouva do
              <span class="material-icons sort-icon">{{ getSortIcon('contractEnd') }}</span>
            </th>
            <th class="actions-col">Akce</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="unit in sortedUnits" :key="unit.id">
            <tr class="unit-row" :class="{ expanded: expandedUnitId === unit.id }">
              <td class="unit-label-cell">
                <button @click="toggleExpand(unit.id)" class="expand-btn">
                  <span class="material-icons">{{ expandedUnitId === unit.id ? 'expand_less' : 'expand_more' }}</span>
                </button>
                <router-link 
                  :to="{ name: 'UnitDetail', params: { propertyId: propertyId, unitId: unit.id }}"
                  class="unit-label hover:underline text-blue-600"
                  @click.stop
                >
                  {{ unit.label }}
                </router-link>
              </td>
              <td>{{ unit.disposition }}</td>
              <td>{{ unit.totalArea }} m²</td>
              <td>{{ unit.floor }}. patro</td>
              <td>
                <span class="status-badge" :class="getStatusClass(unit.status)">
                  {{ unit.status }}
                </span>
              </td>
              <td class="tenant-cell">
                <template v-if="unit.status === 'Pronajato'">
                  <span>{{ unit.tenant }}</span>
                </template>
                <span v-else class="no-tenant">-</span>
              </td>
              <td class="rent-cell">{{ formatCurrency(unit.rent) }}</td>
              <td class="deposit-cell">
                <span v-if="unit.isDeposited" class="deposit-badge paid">
                  ✓ {{ formatCurrency(unit.depositAmount) }}
                </span>
                <span v-else-if="unit.status === 'Pronajato'" class="deposit-badge unpaid">
                  ⚠ Nezaplacena
                </span>
                <span v-else class="no-deposit">-</span>
              </td>
              <td>{{ unit.contractEnd || '-' }}</td>
              <td class="actions-cell">
                <button class="btn-action" @click.stop="openUnitMenu(unit, $event)">
                  <span class="material-icons">more_vert</span>
                </button>
              </td>
            </tr>
            <!-- Expanded Detail Row -->
            <tr v-if="expandedUnitId === unit.id" class="detail-row">
              <td colspan="10">
                <UnitDetailPanel 
                  :unit="unit" 
                  :propertyId="propertyId"
                  @print-settlement="$emit('print-settlement', $event)" 
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div v-if="sortedUnits.length === 0" class="empty-state">
        <span class="material-icons">inbox</span>
        <p>Žádné jednotky neodpovídají zvoleným filtrům</p>
      </div>
    </div>

    <!-- Cards view -->
    <div v-else class="cards-grid">
      <UnitCard 
        v-for="unit in sortedUnits" 
        :key="unit.id"
        :unit="unit"
        :propertyId="propertyId"
        @click="handleCardClick(unit)"
        @action="handleUnitAction"
      />

      <div v-if="sortedUnits.length === 0" class="empty-state">
        <span class="material-icons">inbox</span>
        <p>Žádné jednotky neodpovídají zvoleným filtrům</p>
      </div>
    </div>

    <!-- Action Menu (positioned absolutely) -->
    <div v-if="activeMenu" v-click-outside="closeMenu" class="action-menu" :style="menuPosition">
      <button @click="handleEdit(activeMenuUnit)">
        <span class="material-icons">edit</span>
        Upravit jednotku
      </button>
      <button v-if="activeMenuUnit.status === 'Volné'" @click="handleAddTenant(activeMenuUnit)">
        <span class="material-icons">person_add</span>
        Přidat nájemce
      </button>
      <button v-else @click="handleChangeTenant(activeMenuUnit)">
        <span class="material-icons">swap_horiz</span>
        Změnit nájemce
      </button>
      <button @click="handleGenerateContract(activeMenuUnit)">
        <span class="material-icons">description</span>
        Vygenerovat smlouvu
      </button>
      <button v-if="activeMenuUnit.status === 'Pronajato'" @click="handleRecordPayment(activeMenuUnit)">
        <span class="material-icons">payment</span>
        Zaznamenat platbu
      </button>
      <button @click="handleViewHistory(activeMenuUnit)">
        <span class="material-icons">history</span>
        Historie plateb
      </button>
      <button @click="handleReportIssue(activeMenuUnit)">
        <span class="material-icons">build</span>
        Nahlásit opravu
      </button>
      <hr>
      <button v-if="activeMenuUnit.status === 'Volné'" @click="handleDelete(activeMenuUnit)" class="danger">
        <span class="material-icons">delete</span>
        Smazat jednotku
      </button>
    </div>

    <AddUnitModal 
      :isOpen="showAddUnitModal"
      @close="showAddUnitModal = false"
      @save="handleSaveUnit"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { unitService } from '@/services/unitService';
import UnitDetailPanel from './UnitDetailPanel.vue';
import UnitCard from './UnitCard.vue';
import AddUnitModal from './AddUnitModal.vue';
import { useNotification } from '@/composables/useNotification';

const props = defineProps({
  propertyId: {
    type: String,
    required: true
  },
  units: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['unit-updated', 'unit-created', 'unit-deleted', 'print-settlement']);

const { showSuccess, showInfo, showWarning } = useNotification();

// State
const viewMode = ref('table'); // 'table' or 'cards'
const searchQuery = ref('');
const expandedUnitId = ref(null);
const activeMenu = ref(false);
const activeMenuUnit = ref(null);
const menuPosition = ref({});
const showAddUnitModal = ref(false);

// Sorting
const sortField = ref('label');
const sortOrder = ref('asc');

// Filters
const filters = ref({
  status: [],
  dispositionFilter: '',
  floorFilter: '',
  areaRange: '',
  depositPaid: undefined
});

// Available filter options
const availableStatuses = computed(() => {
  return [...new Set(props.units.map(u => u.status))];
});

const availableFloors = computed(() => {
  return [...new Set(props.units.map(u => u.floor))].sort((a, b) => a - b);
});

// Filtering
const filteredUnits = computed(() => {
  let result = props.units;

  // Status filter
  if (filters.value.status.length > 0) {
    result = result.filter(u => filters.value.status.includes(u.status));
  }

  // Disposition filter
  if (filters.value.dispositionFilter) {
    result = result.filter(u => u.disposition === filters.value.dispositionFilter);
  }

  // Floor filter
  if (filters.value.floorFilter) {
    result = result.filter(u => u.floor === parseInt(filters.value.floorFilter));
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(u => 
      u.label.toLowerCase().includes(query) ||
      u.tenant.toLowerCase().includes(query)
    );
  }

  return result;
});

// Sorting
const sortedUnits = computed(() => {
  return unitService.sortUnits(filteredUnits.value, sortField.value, sortOrder.value);
});

const hasActiveFilters = computed(() => {
  return filters.value.status.length > 0 ||
    filters.value.dispositionFilter ||
    filters.value.floorFilter ||
    searchQuery.value;
});

// Methods
const toggleExpand = (unitId) => {
  expandedUnitId.value = expandedUnitId.value === unitId ? null : unitId;
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'unfold_more';
  return sortOrder.value === 'asc' ? 'arrow_upward' : 'arrow_downward';
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

const clearFilters = () => {
  filters.value = {
    status: [],
    dispositionFilter: '',
    floorFilter: '',
    areaRange: '',
    depositPaid: undefined
  };
  searchQuery.value = '';
};

// Action menu
const openUnitMenu = (unit, event) => {
  activeMenuUnit.value = unit;
  activeMenu.value = true;
  
  const rect = event.target.getBoundingClientRect();
  menuPosition.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX - 200}px`
  };
};

const closeMenu = () => {
  activeMenu.value = false;
  activeMenuUnit.value = null;
};

// Actions
const handleAddUnit = () => {
  showAddUnitModal.value = true;
};

const handleSaveUnit = async (unitData) => {
  const newUnit = await unitService.createUnit(props.propertyId, unitData);
  if (newUnit) {
    showSuccess(`Jednotka ${newUnit.label} byla vytvořena`);
    emit('unit-created', newUnit);
  }
};

const handleCardClick = (unit) => {
  expandedUnitId.value = unit.id;
  viewMode.value = 'table'; // Switch to table view to show expanded detail
};

const handleEdit = (unit) => {
  showInfo(`Upravit jednotku: ${unit.label}`);
  closeMenu();
};

const handleAddTenant = (unit) => {
  showInfo(`Přidat nájemce do jednotky: ${unit.label}`);
  closeMenu();
};

const handleChangeTenant = (unit) => {
  showInfo(`Změnit nájemce v jednotce: ${unit.label}`);
  closeMenu();
};

const handleGenerateContract = (unit) => {
  showInfo(`Vygenerovat smlouvu pro: ${unit.label}`);
  closeMenu();
};

const handleRecordPayment = (unit) => {
  showInfo(`Zaznamenat platbu pro: ${unit.label}`);
  closeMenu();
};

const handleViewHistory = (unit) => {
  showInfo(`Zobrazit historii plateb: ${unit.label}`);
  closeMenu();
};

const handleReportIssue = (unit) => {
  showInfo(`Nahlásit opravu v jednotce: ${unit.label}`);
  closeMenu();
};

const handleDelete = async (unit) => {
  if (confirm(`Opravdu chcete smazat jednotku ${unit.label}?`)) {
    const success = await unitService.deleteUnit(unit.id);
    if (success) {
      showSuccess(`Jednotka ${unit.label} byla smazána`);
      emit('unit-deleted', unit.id);
    }
  }
  closeMenu();
};

const handleUnitAction = (payload) => {
  // Handle actions from UnitCard component
  console.log('Unit action:', payload);
};

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.units-tab {
  padding: 2rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-blue {
  font-size: 2rem;
  color: #2563eb;
}

.tab-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.unit-count {
  color: #64748b;
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

.btn-view {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

/* Filters */
.filters-bar {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #475569;
}

.checkbox-filters {
  display: flex;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
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
}

.units-table thead {
  background: #f8fafc;
}

.units-table th {
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.units-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.units-table th.sortable:hover {
  background: #f1f5f9;
}

.sort-icon {
  font-size: 16px;
  vertical-align: middle;
  color: #94a3b8;
}

.units-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.units-table tbody tr:hover {
  background: #f8fafc;
}

.units-table td {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  color: #334155;
}

.unit-label-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
}

.unit-label {
  font-weight: 600;
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

.tenant-cell {
  vertical-align: middle;
}

.tenant-cell span {
  display: block;
}

/* Avatar removed per user request */

.no-tenant {
  color: #94a3b8;
}

.rent-cell {
  font-weight: 600;
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

.no-deposit {
  color: #94a3b8;
}

.actions-cell {
  text-align: center;
}

.btn-action {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #64748b;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-action:hover {
  background: #f1f5f9;
}

.detail-row td {
  padding: 0;
  background: #f8fafc;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state .material-icons {
  font-size: 64px;
  margin-bottom: 1rem;
}

/* Action Menu */
.action-menu {
  position: absolute;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  z-index: 100;
  padding: 0.5rem 0;
}

.action-menu button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #334155;
  transition: background-color 0.2s;
}

.action-menu button:hover {
  background: #f8fafc;
}

.action-menu button.danger {
  color: #dc2626;
}

.action-menu hr {
  border: none;
  border-top: 1px solid #f1f5f9;
  margin: 0.5rem 0;
}
</style>
