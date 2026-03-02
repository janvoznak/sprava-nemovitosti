<template>
  <div class="debtors-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <span class="material-icons">money_off</span>
          Dlužníci
        </h1>
        <p class="page-subtitle">Kompletní přehled všech dlužníků a nezaplacených plateb</p>
      </div>
      <div class="header-actions">
        <button @click="exportDebtors" class="btn-secondary">
          <span class="material-icons">download</span>
          Export
        </button>
        <button @click="refreshData" class="btn-primary">
          <span class="material-icons">refresh</span>
          Obnovit
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Načítám dlužníky...</p>
    </div>

    <template v-else>
      <!-- Debt Aging Summary -->
      <div class="aging-summary">
        <div class="summary-card total">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-label">Celkový dluh</div>
            <div class="card-value">{{ formatCurrency(agingReport.totalDebtAmount) }}</div>
            <div class="card-meta">{{ agingReport.totalDebtors }} dlužníků</div>
          </div>
        </div>

        <div class="summary-card aging-0-30">
          <div class="card-icon">🟢</div>
          <div class="card-content">
            <div class="card-label">0-30 dní</div>
            <div class="card-value">{{ formatCurrency(agingReport.byAging['0-30days'].amount) }}</div>
            <div class="card-meta">{{ agingReport.byAging['0-30days'].count }} dlužníků</div>
          </div>
        </div>

        <div class="summary-card aging-31-60">
          <div class="card-icon">🟡</div>
          <div class="card-content">
            <div class="card-label">31-60 dní</div>
            <div class="card-value">{{ formatCurrency(agingReport.byAging['31-60days'].amount) }}</div>
            <div class="card-meta">{{ agingReport.byAging['31-60days'].count }} dlužníků</div>
          </div>
        </div>

        <div class="summary-card aging-61-90">
          <div class="card-icon">🟠</div>
          <div class="card-content">
            <div class="card-label">61-90 dní</div>
            <div class="card-value">{{ formatCurrency(agingReport.byAging['61-90days'].amount) }}</div>
            <div class="card-meta">{{ agingReport.byAging['61-90days'].count }} dlužníků</div>
          </div>
        </div>

        <div class="summary-card aging-90-plus critical">
          <div class="card-icon">🔴</div>
          <div class="card-content">
            <div class="card-label">90+ dní</div>
            <div class="card-value">{{ formatCurrency(agingReport.byAging['90plus'].amount) }}</div>
            <div class="card-meta">{{ agingReport.byAging['90plus'].count }} dlužníků</div>
          </div>
        </div>
      </div>

      <!-- Filters and Actions Bar -->
      <div class="filters-bar">
        <div class="filters-left">
          <div class="filter-group">
            <label>Závažnost</label>
            <select v-model="filters.severity" class="filter-select">
              <option value="">Všechny</option>
              <option value="critical">🔴 Kritický</option>
              <option value="medium">🟡 Střední</option>
              <option value="low">🟢 Nový</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Minimální dluh</label>
            <select v-model="filters.minAmount" class="filter-select">
              <option :value="0">Jakákoliv částka</option>
              <option :value="10000">10 000 Kč+</option>
              <option :value="25000">25 000 Kč+</option>
              <option :value="50000">50 000 Kč+</option>
            </select>
          </div>

          <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear-filters">
            <span class="material-icons">close</span>
            Vymazat filtry
          </button>
        </div>

        <div class="search-box">
          <span class="material-icons">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Hledat nájemníka nebo nemovitost..."
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDebtors.length === 0" class="empty-state">
        <span class="material-icons">check_circle</span>
        <h3>Žádní dlužníci</h3>
        <p v-if="hasActiveFilters || searchQuery">Zkuste změnit filtry nebo vyhledávání</p>
        <p v-else>Všichni nájemníci platí včas! 🎉</p>
      </div>

      <!-- Debtors Table -->
      <div v-else class="debtors-table-container">
        <table class="debtors-table">
          <thead>
            <tr>
              <th @click="sortBy('id')">
                ID
                <span v-if="sortColumn === 'id'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('tenant')">
                Nájemník
                <span v-if="sortColumn === 'tenant'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('property')">
                Nemovitost
                <span v-if="sortColumn === 'property'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('debt')" class="align-right">
                Dluh
                <span v-if="sortColumn === 'debt'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('age')" class="align-center">
                Stáří dluhu
                <span v-if="sortColumn === 'age'" class="sort-icon">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="align-center">Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="debtor in paginatedDebtors" 
              :key="debtor.id"
              class="debtor-row"
              @click="showDebtorDetail(debtor)"
            >
              <td>
                <span class="property-id">{{ debtor.propertyId }}</span>
              </td>
              <td>
                <div class="tenant-info">
                  <div class="tenant-avatar">{{ getInitials(debtor.tenantName) }}</div>
                  <div class="tenant-details">
                    <div class="tenant-name">{{ debtor.tenantName }}</div>
                    <div class="tenant-unit">Jednotka {{ debtor.unitNumber }}</div>
                  </div>
                </div>
              </td>
              <td class="property-name">{{ debtor.propertyName }}</td>
              <td class="align-right">
                <span class="debt-amount">{{ formatCurrency(debtor.debtSummary.totalDebt) }}</span>
                <div class="unpaid-count">{{ debtor.debtSummary.unpaidCount }} období</div>
              </td>
              <td class="align-center">
                <div class="severity-badge" :class="debtor.debtSummary.severity">
                  <span class="severity-emoji">{{ getSeverityEmoji(debtor.debtSummary.severity) }}</span>
                  <div class="severity-details">
                    <div class="severity-label">{{ getSeverityLabel(debtor.debtSummary.severity) }}</div>
                    <div class="severity-days">{{ debtor.debtSummary.debtAgeDays }} dní</div>
                  </div>
                </div>
              </td>
              <td class="align-center actions-cell" @click.stop>
                <button 
                  @click="sendReminder(debtor)" 
                  class="action-btn reminder"
                  title="Odeslat upomínku"
                >
                  <span class="material-icons">notifications</span>
                </button>
                <button 
                  @click="showDebtorDetail(debtor)" 
                  class="action-btn detail"
                  title="Zobrazit detail"
                >
                  <span class="material-icons">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <span class="material-icons">chevron_left</span>
          </button>
          
          <span class="pagination-info">
            Strana {{ currentPage }} z {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Debtor Detail Modal -->
    <DebtorDetailModal 
      v-if="selectedDebtor"
      :debtor="selectedDebtor"
      @close="selectedDebtor = null"
      @reminder-sent="handleReminderSent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { debtService } from '@/services/debtService'
import { getSeverityBadge } from '@/utils/debtCalculations'
import { useNotification } from '@/composables/useNotification'
import DebtorDetailModal from '@/components/debtors/DebtorDetailModal.vue'

const route = useRoute()

const { showSuccess, showError, showInfo } = useNotification()

// Data
const loading = ref(true)
const debtors = ref([])
const agingReport = ref({
  totalDebtors: 0,
  totalDebtAmount: 0,
  byAging: {
    '0-30days': { count: 0, amount: 0 },
    '31-60days': { count: 0, amount: 0 },
    '61-90days': { count: 0, amount: 0 },
    '90plus': { count: 0, amount: 0 }
  }
})

// Filters and sorting
const filters = ref({
  severity: '',
  minAmount: 0
})
const searchQuery = ref('')
const sortColumn = ref('debt')
const sortDirection = ref('desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Selected debtor for detail view
const selectedDebtor = ref(null)

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.severity || filters.value.minAmount > 0
})

const filteredDebtors = computed(() => {
  let result = [...debtors.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(d =>
      d.tenantName.toLowerCase().includes(query) ||
      d.propertyName.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  result.sort((a, b) => {
    let aVal, bVal

    switch (sortColumn.value) {
      case 'id':
        aVal = a.propertyId
        bVal = b.propertyId
        break
      case 'tenant':
        aVal = a.tenantName
        bVal = b.tenantName
        break
      case 'property':
        aVal = a.propertyName
        bVal = b.propertyName
        break
      case 'debt':
        aVal = a.debtSummary.totalDebt
        bVal = b.debtSummary.totalDebt
        break
      case 'age':
        aVal = a.debtSummary.debtAgeDays
        bVal = b.debtSummary.debtAgeDays
        break
      default:
        return 0
    }

    if (typeof aVal === 'string') {
      return sortDirection.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
  })

  return result
})

const paginatedDebtors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDebtors.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredDebtors.value.length / itemsPerPage.value)
})

// Methods
const loadDebtors = async () => {
  try {
    loading.value = true
    const [debtorsList, report] = await Promise.all([
      debtService.getDebtors(filters.value),
      debtService.getDebtAgingReport()
    ])
    
    debtors.value = debtorsList
    agingReport.value = report
  } catch (error) {
    showError('Nepodařilo se načíst dlužníky')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadDebtors()
  showSuccess('Data byla obnovena')
}

const exportDebtors = async () => {
  try {
    const blob = await debtService.exportDebtors('csv')
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dluzniky_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showSuccess('Export byl stažen')
  } catch (error) {
    showError('Nepodařilo se exportovat dlužníky')
    console.error(error)
  }
}

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = column === 'debt' || column === 'age' ? 'desc' : 'asc'
  }
}

const clearFilters = () => {
  filters.value = {
    severity: '',
    minAmount: 0
  }
  searchQuery.value = ''
}

const showDebtorDetail = (debtor) => {
  selectedDebtor.value = debtor
}

const sendReminder = async (debtor) => {
  // Opening detail with reminder tab or just opening detail
  // For now, let's just open the detail modal which has the reminder button
  selectedDebtor.value = debtor
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const getSeverityEmoji = (severity) => {
  return getSeverityBadge(severity).emoji
}

const getSeverityLabel = (severity) => {
  return getSeverityBadge(severity).label
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0
  }).format(amount)
}

const handleReminderSent = () => {
  showSuccess('Upomínka byla odeslána')
  refreshData()
}

// Lifecycle
onMounted(() => {
  // Pre-fill search from query param (e.g. from unit detail or tenant detail link)
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  loadDebtors()
})
</script>

<style scoped>
.debtors-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.page-title .material-icons {
  font-size: 2rem;
  color: #ef4444;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9375rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Aging Summary */
.aging-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.summary-card.total {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, white 100%);
}

.summary-card.critical {
  border-color: #fecaca;
  background: linear-gradient(135deg, #fef2f2 0%, white 100%);
}

.card-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.card-meta {
  font-size: 0.8125rem;
  color: #94a3b8;
}

/* Filters Bar */
.filters-bar {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.6875rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select {
  padding: 0.5rem 2.5rem 0.5rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-filters:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  min-width: 280px;
}

.search-box .material-icons {
  color: #94a3b8;
  font-size: 1.25rem;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.875rem;
  color: #0f172a;
}

.search-box input::placeholder {
  color: #94a3b8;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid #f1f5f9;
}

.empty-state .material-icons {
  font-size: 4rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

/* Debtors Table */
.debtors-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.debtors-table {
  width: 100%;
  border-collapse: collapse;
}

.debtors-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.debtors-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.debtors-table th:hover {
  color: #0f172a;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.875rem;
}

.debtors-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  cursor: pointer;
}

.debtors-table tbody tr:hover {
  background: #f8fafc;
}

.debtors-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #0f172a;
}

.property-id {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.tenant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%);
  color: #991b1b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.tenant-details {
  display: flex;
  flex-direction: column;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
}

.tenant-unit {
  font-size: 0.75rem;
  color: #94a3b8;
}

.property-name {
  color: #64748b;
}

.debt-amount {
  font-weight: 700;
  font-size: 1rem;
  color: #ef4444;
}

.unpaid-count {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.125rem;
}

.severity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.severity-badge.critical {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.severity-badge.medium {
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.severity-badge.low {
  background: #fef9c3;
  border: 1px solid #fef08a;
}

.severity-emoji {
  font-size: 1.25rem;
}

.severity-details {
  display: flex;
  flex-direction: column;
}

.severity-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.severity-badge.critical .severity-label {
  color: #991b1b;
}

.severity-badge.medium .severity-label {
  color: #d97706;
}

.severity-badge.low .severity-label {
  color: #ca8a04;
}

.severity-days {
  font-size: 0.75rem;
  color: #64748b;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn .material-icons {
  font-size: 1.125rem;
  color: #64748b;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.action-btn.reminder:hover .material-icons {
  color: #f59e0b;
}

.action-btn.detail:hover .material-icons {
  color: #3b82f6;
}

.align-right {
  text-align: right;
}

.align-center {
  text-align: center;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.pagination-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.pagination-btn:not(:disabled):hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}
</style>
