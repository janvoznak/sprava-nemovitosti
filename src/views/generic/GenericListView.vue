<template>
  <div class="generic-list-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="breadcrumbs" />

    <!-- Header -->
    <div class="list-header">
      <div class="title-group">
        <h1 class="page-title">{{ title }}</h1>
        <div v-if="subtitle" class="page-subtitle">{{ subtitle }}</div>
      </div>
      <div class="header-actions">
        <!-- Optional Global Action Button -->
        <button v-if="mainAction" @click="$emit('main-action')" class="btn-primary">
          <span class="material-icons">{{ mainAction.icon }}</span> {{ mainAction.label }}
        </button>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <span class="material-icons search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="searchPlaceholder"
          class="search-input"
        >
      </div>

      <div class="filters" v-if="filters && filters.length">
        <div 
          v-for="filter in filters" 
          :key="filter.key"
          class="filter-group"
        >
          <select v-model="activeFilters[filter.key]" class="filter-select">
            <option :value="null">{{ filter.label }}</option>
            <option v-for="opt in filter.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="content-card">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">
              {{ col.label }}
            </th>
            <th v-if="actions && actions.length" class="actions-col">Akce</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="columns.length + (actions ? 1 : 0)">
              <div class="spinner-container">
                <div class="spinner"></div> Načítání dat...
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredItems.length === 0" class="empty-row">
            <td :colspan="columns.length + (actions ? 1 : 0)">
              Žádné záznamy k zobrazení
            </td>
          </tr>
          <tr v-else v-for="item in paginatedItems" :key="item.id">
            <td v-for="col in columns" :key="col.key">
              <!-- Type: Status Badge -->
              <span v-if="col.type === 'status'" class="status-badge" :class="getStatusClass(item[col.key])">
                {{ item[col.key] }}
              </span>
              <!-- Type: Currency -->
              <span v-else-if="col.type === 'currency'">
                {{ formatCurrency(item[col.key]) }}
              </span>
               <!-- Type: Rating -->
               <span v-else-if="col.type === 'rating'" class="rating">
                <span v-for="n in 5" :key="n" class="material-icons star" :class="{ filled: n <= item[col.key] }">
                  star
                </span>
              </span>
              <!-- Default: Text -->
              <span v-else>
                {{ item[col.key] }}
              </span>
            </td>
            
            <!-- Row Actions -->
            <td v-if="actions && actions.length" class="actions-cell">
              <div class="action-buttons">
                <button 
                  v-for="action in actions" 
                  :key="action.key"
                  @click="$emit('row-action', { action: action.key, item })"
                  class="action-btn"
                  :class="action.class"
                  :title="action.label"
                >
                  <span class="material-icons" v-if="action.icon">{{ action.icon }}</span>
                  <span v-else>{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredItems.length > 0" class="pagination-container">
        <div class="pagination-info">
          Zobrazeno <b>{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredItems.length) }}</b> z <b>{{ filteredItems.length }}</b> záznamů
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';

const props = defineProps({
  title: String,
  subtitle: String,
  breadcrumbs: Array,
  columns: Array, // [{ key, label, type }]
  items: Array,
  loading: Boolean,
  searchPlaceholder: { type: String, default: 'Vyhledat...' },
  mainAction: Object, // { label, icon }
  filters: Array, // [{ key, label, options: [{label, value}] }]
  actions: Array, // [{ key, label, icon, class }]
  itemsPerPage: { type: Number, default: 10 }
});

const emit = defineEmits(['main-action', 'row-action']);

const searchQuery = ref('');
const activeFilters = ref({});
const currentPage = ref(1);

// Initialize filters
if (props.filters) {
  props.filters.forEach(f => {
    activeFilters.value[f.key] = null;
  });
}

// Watch filters/search to reset page
watch([searchQuery, activeFilters], () => {
  currentPage.value = 1;
}, { deep: true });

// Formatting Helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
};

const getStatusClass = (status) => {
  const map = {
    'Zaplaceno': 'success',
    'V pořádku': 'success',
    'Dokončeno': 'success',
    'Aktivní': 'success',
    'Po splatnosti': 'danger',
    'Havárie': 'danger',
    'Částečná úhrada': 'warning',
    'Řeší se': 'warning',
    'Nové': 'info'
  };
  return map[status] || 'default';
};

// Filtering Logic
const filteredItems = computed(() => {
  if (!props.items) return [];
  
  return props.items.filter(item => {
    // 1. Search Query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesSearch = props.columns.some(col => {
        const val = item[col.key];
        return val && String(val).toLowerCase().includes(query);
      });
      if (!matchesSearch) return false;
    }

    // 2. Filters
    for (const key in activeFilters.value) {
      const filterVal = activeFilters.value[key];
      if (filterVal && item[key] !== filterVal) {
        return false;
      }
    }

    return true;
  });
});

// Pagination Logic
const totalPages = computed(() => Math.ceil(filteredItems.value.length / props.itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage);
const endIndex = computed(() => startIndex.value + props.itemsPerPage);

const paginatedItems = computed(() => {
  return filteredItems.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    
    if (current <= 3) end = 4;
    if (current >= total - 2) start = total - 3;
    
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});
</script>

<style scoped>
.generic-list-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.25rem;
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
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background: #1d4ed8;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 2rem 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  min-width: 180px;
  cursor: pointer;
}

/* Table Card */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
}

.data-table tr:hover {
  background: #f8fafc;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.success { background: #dcfce7; color: #166534; }
.status-badge.danger { background: #fee2e2; color: #991b1b; }
.status-badge.warning { background: #fef3c7; color: #92400e; }
.status-badge.info { background: #e0f2fe; color: #075985; }
.status-badge.default { background: #f1f5f9; color: #475569; }

/* Ratings */
.rating {
  display: flex;
  gap: 2px;
}
.star {
  font-size: 18px;
  color: #cbd5e1;
}
.star.filled {
  color: #fbbf24;
}

/* Actions */
.actions-col {
  width: 120px;
  text-align: right;
}

.actions-cell {
  text-align: right;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.action-btn.primary-text { color: #2563eb; border-color: #bfdbfe; }
.action-btn.primary-text:hover { background: #eff6ff; }

/* States */
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-row td {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

/* Pagination */
.pagination-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
