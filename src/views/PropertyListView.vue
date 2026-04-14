<template>
  <div class="property-list-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Správa nemovitostí' }
    ]" />

    <div class="list-header">
      <div class="title-group">
        <h1 class="page-title">Seznam nemovitostí</h1>
        <div v-if="activeFilter" class="filter-badge">
          <span>{{ filterLabel }}</span>
          <button @click="clearFilter" class="clear-filter-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      <div class="header-actions">
        <div class="filter-dropdown-container">
          <button @click="isFilterOpen = !isFilterOpen" class="btn-icon-secondary" :class="{ active: isFilterOpen || activeFilter || cityFilter }">
            <span class="material-icons">filter_list</span>
          </button>
          
          <div v-if="isFilterOpen" class="filter-dropdown-menu">
            <div class="filter-item">
              <label>Rychlé filtry</label>
              <select :value="activeFilter || ''" @change="handleQuickFilterChange" class="filter-select">
                <option value="">Všechny</option>
                <option value="vacant">Volné jednotky</option>
                <option value="debt">Dlužníci</option>
                <option value="issue">Problémy / Revize</option>
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
            <div v-if="activeFilter || cityFilter" class="filter-actions">
              <button @click="resetFilters" class="btn-text">Zrušit filtry</button>
            </div>
          </div>
        </div>
        <ViewModeToggle />
        <button @click="handleAddProperty" class="btn-primary">
          <span class="material-icons">add</span> Přidat nemovitost
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <StatsSummaryBar 
      v-if="!loading"
      :totalUnits="totalStats.units"
      :occupiedUnits="totalStats.occupied"
      :vacantUnits="totalStats.units - totalStats.occupied"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání dat...</p>
    </div>

    <!-- Flat Property List -->
    <div v-else class="content-wrapper">
      <div class="content-card">
        <PropertyTable 
          :properties="paginatedProperties"
          v-model:selectedIds="selectedIds"
          @preview="handlePreview" 
          @delete="handleDelete"
          @quick-contact="handleQuickContact"
          @quick-contract="handleQuickContract"
          @quick-maintenance="handleQuickMaintenance"
          @quick-payment="handleQuickPayment"
        />



        <!-- Pagination -->
        <div v-if="filteredProperties.length > 0" class="pagination-container">
          <div class="pagination-info">
            Zobrazeno <b>{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredProperties.length) }}</b> z <b>{{ filteredProperties.length }}</b> nemovitostí
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
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: currentPage === page, delimiter: page === '...' }"
                @click="page !== '...' && (currentPage = page)"
                :disabled="page === '...'"
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
    </div>

    <!-- Bulk Actions Toolbar -->
    <transition name="slide-up">
      <div v-if="selectedIds.length > 0" class="bulk-actions-toolbar">
        <div class="selected-count">
          <span class="count-badge">{{ selectedIds.length }}</span>
          <span>Vybráno</span>
        </div>
        <div class="bulk-actions">
          <button class="bulk-btn" @click="handleBulkReminder">
            <span class="material-icons">notifications</span> Odeslat upomínku
          </button>
          <button class="bulk-btn" @click="handleBulkExport">
            <span class="material-icons">download</span> Exportovat
          </button>
        </div>
        <button class="close-bulk-btn" @click="selectedIds = []">
          <span class="material-icons">close</span>
        </button>
      </div>
    </transition>

    <!-- Notification Overlay (if error) -->
    <div v-if="error" class="notification-toast error">
      <span class="material-icons">error_outline</span> {{ error }}
      <button class="retry-btn" @click="retryLoad">Zkusit znovu</button>
    </div>

    <!-- Modals -->
    <PropertyActionModal
      v-if="showActionModal"
      :property="selectedProperty"
      :action="currentAction"
      @close="showActionModal = false"
      @select-unit="handleUnitSelection"
      @generate-document="handleGenerateDocument"
    />

    <AddPropertyModal
      :isOpen="showAddPropertyModal"
      @close="showAddPropertyModal = false"
      @save="handlePropertySave"
    />

    <DocumentGeneratorModal
      :isOpen="showDocumentModal"
      :property="documentProperty"
      @close="showDocumentModal = false"
    />

    <AddNoteModal
      :isOpen="showNoteModal"
      v-bind="noteModalProps"
      @close="showNoteModal = false"
      @save="handleNoteSave"
    />

    <!-- Mobile FAB -->
    <MobileFab @action="handleFabAction" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import PropertyTable from '@/components/PropertyTable.vue'
import PropertyActionModal from '@/components/property/PropertyActionModal.vue'
import DocumentGeneratorModal from '@/components/DocumentGeneratorModal.vue'
import AddNoteModal from '@/components/property/AddNoteModal.vue'
import AddPropertyModal from '@/components/property/AddPropertyModal.vue'
import MobileFab from '@/components/mobile/MobileFab.vue'
import StatsSummaryBar from '@/components/dashboard/StatsSummaryBar.vue'
import ViewModeToggle from '@/components/ViewModeToggle.vue'
import { propertyService } from '@/services/propertyService'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const route = useRoute()
const properties = ref([])
const loading = ref(true)
const error = ref(null)
const selectedIds = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const cityFilter = ref('')
const isFilterOpen = ref(false)

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.filter-dropdown-container')) {
    isFilterOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleQuickFilterChange = (e) => {
  const value = e.target.value
  if (value) {
    router.push({ name: 'PropertyList', query: { filter: value } })
  } else {
    router.push({ name: 'PropertyList' })
  }
  isFilterOpen.value = false
}

const resetFilters = () => {
  cityFilter.value = ''
  router.push({ name: 'PropertyList' })
  isFilterOpen.value = false
}

const uniqueCities = computed(() => {
  const cities = [...new Set(properties.value.map(p => p.city).filter(Boolean))]
  return cities.sort()
})

// Watch filter changes to reset page
watch(() => route.query.filter, () => {
  currentPage.value = 1;
});

// Modals State
const showActionModal = ref(false)
const showNoteModal = ref(false)
const showAddPropertyModal = ref(false)
const selectedProperty = ref(null)
const currentAction = ref(null) // 'contact', 'payment', 'contract'
const noteModalProps = ref({}) // Props to pass to AddNoteModal

const { showError, showSuccess, showInfo } = useNotification()

// FAB Handler
const handleFabAction = (action) => {
  if (action === 'search') {
    showInfo('Vyhledávání...');
    // In real app: focus search bar
  } else if (action === 'new-issue') {
    showNoteModal.value = true;
    noteModalProps.value = {
      propertyId: 'general', // or prompt user
      quickAction: null
    };
  } else if (action === 'new-note') {
    showNoteModal.value = true;
     noteModalProps.value = {
      propertyId: 'general',
      quickAction: null
    };
  }
};

// Filtering Logic
const filteredProperties = computed(() => {
  let result = [...properties.value]
  
  // Quick Filter (route query)
  const filter = route.query.filter
  if (filter) {
    result = result.filter(p => {
      if (filter === 'vacant') {
        if (p.units && p.units.length > 0) {
          return p.units.some(u => u.status === 'Volné')
        }
        return !p.isOccupied
      }
      if (filter === 'debt') return p.hasDebt
      if (filter === 'issue') return p.revisionStatus && p.revisionStatus.expired
      return true
    })
  }
  
  // City Filter
  if (cityFilter.value) {
    result = result.filter(p => p.city === cityFilter.value)
  }
  
  return result
})

// Pagination Computed
const totalPages = computed(() => Math.ceil(filteredProperties.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedProperties = computed(() => {
  return filteredProperties.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    
    let start = Math.max(2, current - 1)
    let end = Math.min(total - 1, current + 1)
    
    if (current <= 3) end = 4
    if (current >= total - 2) start = total - 3
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

const totalStats = computed(() => {
  let units = 0;
  let occupied = 0;
  let rent = 0;

  filteredProperties.value.forEach(p => {
    // If property has units defined in mock
    if (p.units && p.units.length > 0) {
      units += p.units.length;
      occupied += p.units.filter(u => u.status === 'Pronajato').length;
      // Calculate rent from units
       p.units.forEach(u => {
         if (u.rent) rent += Number(u.rent); 
       });
    } else {
      // Fallback for mock properties without detailed unit arrays but with top-level stats
      // Parsing "2/3" occupancyRatio if available
      if (p.occupancyRatio) {
        const [occ, tot] = p.occupancyRatio.split('/').map(Number);
        units += tot || 0;
        occupied += occ || 0;
      }
      // Parsing rent string "45 000 Kč"
      if (p.rent) {
         rent += typeof p.rent === 'number' ? p.rent : (parseInt(String(p.rent).replace(/\D/g, '')) || 0);
      }
    }
  });

  return {
    units,
    occupied,
    occupancyRate: units ? Math.round((occupied / units) * 100) : 0,
    rent
  };
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
};


// Filter UI
const activeFilter = computed(() => route.query.filter)

const filterLabel = computed(() => {
  const map = {
    'vacant': 'Filtr: Volné jednotky',
    'debt': 'Filtr: Dlužníci',
    'issue': 'Filtr: Problémy / Revize'
  }
  return map[activeFilter.value] || 'Filtr aktivní'
})

const clearFilter = () => {
  router.push({ name: 'PropertyList' })
}



// Načtení nemovitostí
const loadProperties = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await propertyService.getProperties()
    properties.value = data
  } catch (err) {
    error.value = 'Nepodařilo se načíst nemovitosti.'
    showError(error.value)
    console.error('Failed to load properties:', err)
  } finally {
    loading.value = false
  }
}

// Retry načtení dat
const retryLoad = () => {
  loadProperties()
}

// Otevřít detail nemovitosti
const handlePreview = (id) => {
  router.push({ name: 'PropertyDetail', params: { id } })
}

// Smazat nemovitost
const handleDelete = async (id) => {
  if (!confirm('Opravdu chcete smazat tuto nemovitost?')) return
  
  try {
    await propertyService.deleteProperty(id)
    showSuccess('Nemovitost byla smazána')
    await loadProperties()
  } catch (err) {
    showError('Nepodařilo se smazat nemovitost')
    console.error('Failed to delete property:', err)
  }
}

// Přidat nemovitost (placeholder)
// Přidat nemovitost
const handleAddProperty = () => {
  showAddPropertyModal.value = true;
};

const handlePropertySave = (data) => {
  // Mock adding property
  const newProperty = {
    id: Date.now().toString(),
    name: data.name,
    street: data.street,
    houseNumber: data.houseNumber,
    city: data.city,
    zip: data.zip,
    type: data.type,
    status: 'Aktivní',
    occupancyRatio: '0/0',
    occupancyPercentage: 0,
    units: [],
    rent: '0 Kč',
    depositCollected: 0,
    depositTotal: 0,
    revisionStatus: { valid: 0, total: 0, expired: false, expiring: false },
    hasDebt: false,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' // Random default
  };
  
  properties.value.unshift(newProperty);
  showSuccess(`Nemovitost ${data.name} byla vytvořena`);
};

// Quick Actions Handlers
const openActionModal = (id, action) => {
  const property = properties.value.find(p => p.id === id);
  if (property) {
    selectedProperty.value = property;
    currentAction.value = action;
    showActionModal.value = true;
  }
};

const handleQuickContact = (id) => openActionModal(id, 'contact');
const handleQuickContract = (id) => openActionModal(id, 'contract');
const handleQuickPayment = (id) => openActionModal(id, 'payment');

// Maintenance (Directly open Note Modal)
const handleQuickMaintenance = (id) => {
  const property = properties.value.find(p => p.id === id);
  if (property) {
    noteModalProps.value = {
      tenantId: null, // Property level
      tenantName: null,
      propertyId: property.id,
      quickAction: null 
      // In a real app we would preload type='complaint' or 'maintenance'
    };
    showNoteModal.value = true;
  }
};

// Handle Selection from Action Modal
const handleUnitSelection = (unit) => {
  showActionModal.value = false;
  if (currentAction.value === 'payment') {
    noteModalProps.value = {
      tenantId: unit.tenant, // using name as ID for mock
      tenantName: unit.tenant,
      propertyId: selectedProperty.value.id,
      unitId: unit.id,
      quickAction: 'payment'
    };
    showNoteModal.value = true;
  }
};

const handleNoteSave = (data) => {
  showSuccess('Záznam byl úspěšně uložen');
  showNoteModal.value = false;
  // in real app: refresh data
};

// Document Generator
const showDocumentModal = ref(false);
const documentProperty = ref({});

const handleGenerateDocument = (unit) => {
  showActionModal.value = false;
  
  // Merge property details with unit details
  documentProperty.value = {
    ...selectedProperty.value,
    tenant: unit.tenant, // Override/Add tenant info
    unitLabel: unit.label,
    unitId: unit.id
  };
  
  showDocumentModal.value = true;
};

// Bulk Actions Handlers
const handleBulkReminder = () => {
  showInfo(`Odesílám hromadnou upomínku pro ${selectedIds.value.length} nemovitostí`);
  selectedIds.value = [];
};

const handleBulkExport = () => {
  showInfo(`Exportuji data pro ${selectedIds.value.length} nemovitostí`);
  selectedIds.value = [];
};

onMounted(async () => {
  await loadProperties()
})
</script>

<style scoped>
.property-list-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem; /* Centralized horizontal padding for all blocks */
}


/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
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

/* Filter Dropdown Styling */
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



/* Card */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
  margin-left: -10px; /* Shift 10px left to align with title */
  overflow: hidden;
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

@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.notification-toast.error {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #FEF2F2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.retry-btn {
  background: white;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Bulk Actions Toolbar */
.bulk-actions-toolbar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 40;
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  border-right: 1px solid #334155;
  padding-right: 1.5rem;
}

.count-badge {
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
}

.bulk-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.bulk-btn:hover {
  background: #334155;
  color: white;
  border-color: #64748b;
}

.bulk-btn .material-icons { font-size: 18px; }

.close-bulk-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.close-bulk-btn:hover { background: rgba(255,255,255,0.1); color: white; }


.title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 8px 4px 12px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #bfdbfe;
}

.clear-filter-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;
  color: #3b82f6;
}

.clear-filter-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.clear-filter-btn .material-icons {
  font-size: 16px;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

/* Sticky Stats Header */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}

/* Pagination */
.pagination-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  background: white;
  min-height: 60px;
  position: relative;
  z-index: 10;
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
}

.page-number:hover:not(.active):not(.delimiter) {
  background: #f1f5f9;
  color: #475569;
}

.page-number.active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #2563eb;
}

.page-number.delimiter {
  cursor: default;
}
</style>
