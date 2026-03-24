<template>
  <div class="finance-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Finance' }
    ]" />

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Finance a Cash Flow</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddTransactionModal = true">
          <span class="material-icons">add</span> Nová transakce
        </button>
        <select v-model="selectedPeriod" class="period-select">
          <option value="current">Aktuální měsíc</option>
          <option value="last3">Poslední 3 měsíce</option>
          <option value="last6">Posledních 6 měsíců</option>
          <option value="last12">Posledních 12 měsíců</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container glass animate-fade">
      <div class="loading-spinner"></div>
      <p class="loading-text">Načítání finančních dat...</p>
    </div>
    
    <!-- Finance Content -->
    <div v-else class="finance-content animate-slide-up">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card premium-card">
          <div class="kpi-header">
            <span class="kpi-icon income">💰</span>
            <span class="kpi-label">Celkové příjmy měsíc</span>
          </div>
          <div class="kpi-value income-color">{{ formatCurrency(monthlyIncome) }}</div>
          <div class="kpi-detail">
            <span class="detail-label">Zaplaceno:</span>
            <span class="detail-value">{{ formatCurrency(paidIncome) }}</span>
          </div>
        </div>

        <div class="kpi-card premium-card">
          <div class="kpi-header">
            <span class="kpi-icon expense">📊</span>
            <span class="kpi-label">Celkové výdaje měsíc</span>
          </div>
          <div class="kpi-value expense-color">{{ formatCurrency(monthlyExpenses) }}</div>
          <div class="kpi-detail">
            <span class="detail-label">Nezaplaceno:</span>
            <span class="detail-value">{{ formatCurrency(unpaidExpenses) }}</span>
          </div>
        </div>

        <div class="kpi-card premium-card highlight">
          <div class="kpi-header">
            <span class="kpi-icon profit">📈</span>
            <span class="kpi-label">Čistý zisk měsíc</span>
          </div>
          <div class="kpi-value" :class="netProfit >= 0 ? 'profit-color' : 'loss-color'">
            {{ formatCurrency(netProfit) }}
          </div>
          <div class="kpi-detail">
            <span class="detail-label">Margin:</span>
            <span class="detail-value">{{ profitMargin }}%</span>
          </div>
        </div>
      </div>

      <!-- Incomes and Expenses Tables -->
      <div class="tables-grid">
        <div class="table-wrapper animate-slide-up" style="animation-delay: 0.1s">
          <IncomesTable 
            :incomes="incomes" 
            @update-status="handleUpdateIncomeStatus"
          />
        </div>
        <div class="table-wrapper animate-slide-up" style="animation-delay: 0.2s">
          <ExpensesTable 
            :expenses="expenses" 
          />
        </div>
      </div>

      <!-- Cash Flow Chart -->
      <div class="chart-wrapper animate-slide-up" style="animation-delay: 0.3s">
        <CashFlowChart :cash-flow-data="cashFlowData" />
      </div>

      <!-- Forecast -->
      <div class="forecast-wrapper animate-slide-up" style="animation-delay: 0.4s">
        <ForecastSection 
          :forecast="forecast" 
          :avg-cash-flow="avgCashFlow"
        />
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <AddTransactionModal
      :isOpen="showAddTransactionModal"
      @close="showAddTransactionModal = false"
      @save="handleTransactionSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { financeService } from '@/services/financeService'
import { useNotification } from '@/composables/useNotification'
import IncomesTable from '@/components/finance/IncomesTable.vue'
import ExpensesTable from '@/components/finance/ExpensesTable.vue'
import CashFlowChart from '@/components/finance/CashFlowChart.vue'
import ForecastSection from '@/components/finance/ForecastSection.vue'
import AddTransactionModal from '@/components/finance/AddTransactionModal.vue'

const loading = ref(true)
const incomes = ref([])
const expenses = ref([])
const cashFlowData = ref([])
const forecast = ref({})
const selectedPeriod = ref('last6')
const showAddTransactionModal = ref(false)

const { showSuccess, showError } = useNotification()

// Load all financial data
const loadFinancialData = async () => {
  try {
    loading.value = true
    
    const [incomesData, expensesData, cashFlow, forecastData] = await Promise.all([
      financeService.getIncomes(),
      financeService.getExpenses(),
      financeService.getCashFlow(12),
      financeService.getForecast()
    ])

    incomes.value = incomesData
    expenses.value = expensesData
    cashFlowData.value = cashFlow
    forecast.value = forecastData
  } catch (error) {
    showError('Nepodařilo se načíst finanční data')
    console.error('Failed to load financial data:', error)
  } finally {
    loading.value = false
  }
}

// Current month incomes
const currentMonthIncomes = computed(() => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  return incomes.value.filter(inc => inc.dueDate.startsWith(currentMonth))
})

// Current month expenses
const currentMonthExpenses = computed(() => {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return expenses.value.filter(exp => exp.date.startsWith(currentMonth))
})

// KPI: Monthly Income (all including unpaid)
const monthlyIncome = computed(() => {
  return currentMonthIncomes.value.reduce((sum, inc) => sum + inc.amount, 0)
})

// KPI: Paid Income
const paidIncome = computed(() => {
  return currentMonthIncomes.value
    .filter(inc => inc.status === 'paid')
    .reduce((sum, inc) => sum + inc.amount, 0)
})

// KPI: Monthly Expenses
const monthlyExpenses = computed(() => {
  return currentMonthExpenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

// KPI: Unpaid Expenses
const unpaidExpenses = computed(() => {
  return currentMonthExpenses.value
    .filter(exp => exp.status === 'unpaid')
    .reduce((sum, exp) => sum + exp.amount, 0)
})

// KPI: Net Profit (paid income - paid expenses)
const netProfit = computed(() => {
  return paidIncome.value - monthlyExpenses.value
})

// KPI: Profit Margin
const profitMargin = computed(() => {
  if (monthlyIncome.value === 0) return 0
  return Math.round((netProfit.value / monthlyIncome.value) * 100)
})

// Average cash flow (last 3 months)
const avgCashFlow = computed(() => {
  if (cashFlowData.value.length < 3) return 0
  const lastThree = cashFlowData.value.slice(-3)
  const sum = lastThree.reduce((acc, data) => acc + data.netCashFlow, 0)
  return sum / 3
})

// Handle income status update
const handleUpdateIncomeStatus = async (id, status, paidDate) => {
  try {
    await financeService.updateIncomeStatus(id, status, paidDate)
    // Reload data to reflect changes
    await loadFinancialData()
  } catch (error) {
    showError('Nepodařilo se aktualizovat status platby')
    console.error(error)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { 
    style: 'currency', 
    currency: 'CZK', 
    minimumFractionDigits: 0 
  }).format(value)
}

const handleTransactionSave = (data) => {
  const newTransaction = {
    id: 'T' + Date.now(),
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    dueDate: data.date,
    category: data.category,
    propertyId: data.propertyId || null,
    propertyName: data.propertyId ? 'Nemovitost' : '-',
    status: 'unpaid'
  };

  if (data.type === 'income') {
    incomes.value.unshift(newTransaction);
    showSuccess('Příjem byl přidán');
  } else {
    expenses.value.unshift(newTransaction);
    showSuccess('Výdaj byl přidán');
  }

  showAddTransactionModal.value = false;
}

onMounted(() => {
  loadFinancialData()
})
</script>

<style scoped>
.finance-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Breadcrumbs (Handled by component) */


/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  background: var(--save-color);
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
  box-shadow: 0 4px 6px -1px rgba(0, 200, 83, 0.2);
}

.btn-primary:hover {
  background: var(--save-color-hover);
  transform: translateY(-1px);
}


.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: var(--save-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Finance Content */
.finance-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.kpi-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kpi-card.highlight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.kpi-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.kpi-icon.income {
  background: #dcfce7;
}

.kpi-icon.expense {
  background: #fee2e2;
}

.kpi-icon.profit {
  background: #dbeafe;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.income-color {
  color: #22c55e;
}

.expense-color {
  color: #ef4444;
}

.profit-color {
  color: var(--save-color);
}

.loss-color {
  color: #dc2626;
}

.kpi-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.detail-label {
  color: #64748b;
}

.detail-value {
  font-weight: 600;
  color: #1e293b;
}

/* Tables Grid */
.tables-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .tables-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
