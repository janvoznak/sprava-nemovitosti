<template>
  <div class="finance-dashboard">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Finance' }
    ]" />

    <div class="header-section">
      <h1 class="page-title">Finanční přehled</h1>
      <div class="controls">
        <select class="period-select">
          <option>Tento rok (2025)</option>
          <option>Minulý rok (2024)</option>
        </select>
        <button class="btn-primary">
          <span class="material-icons">download</span> Report
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Načítání finančních dat...</p>
    </div>

    <template v-else>
      <!-- Top KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card highlight">
          <div class="kpi-icon money">
            <span class="material-icons">attach_money</span>
          </div>
          <div class="kpi-content">
            <span class="label">Čistý zisk (YTD)</span>
            <span class="value">{{ formatCurrency(kpi.netProfit) }}</span>
            <span class="trend up">{{ kpi.collectionRate }}% úspěšnost výběru</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon income">
            <span class="material-icons">download</span>
          </div>
          <div class="kpi-content">
            <span class="label">Příjmy celkem</span>
            <span class="value">{{ formatCurrency(kpi.totalIncome) }}</span>
            <span class="sub">{{ kpi.paidCount }} přijatých plateb</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon expense">
            <span class="material-icons">upload</span>
          </div>
          <div class="kpi-content">
            <span class="label">Výdaje celkem</span>
            <span class="value">{{ formatCurrency(kpi.totalExpenses) }}</span>
            <span class="sub">V rámci rozpočtu</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon debt">
            <span class="material-icons">warning</span>
          </div>
          <div class="kpi-content">
            <span class="label">Dlužné nájemné</span>
            <span class="value negative">{{ formatCurrency(kpi.totalDebt) }}</span>
            <span class="sub">{{ kpi.debtorCount }} {{ kpi.debtorCount === 1 ? 'dlužník' : kpi.debtorCount < 5 ? 'dlužníci' : 'dlužníků' }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Real CashFlow Chart -->
        <div class="chart-card main-chart">
          <CashFlowChart :cashFlowData="cashFlowData" />
        </div>

        <!-- Expense Breakdown -->
        <div class="chart-card donut-chart">
          <div class="chart-header">
            <h3>Struktura nákladů</h3>
          </div>
          <div class="donut-placeholder">
            <div class="donut-circle">
              <span class="total-label">{{ formatCurrencyShort(kpi.totalExpenses) }}</span>
            </div>
            <ul class="donut-legend">
              <li><span class="dot c1"></span> Energie ({{ expenseBreakdown.energy }}%)</li>
              <li><span class="dot c2"></span> Opravy ({{ expenseBreakdown.repairs }}%)</li>
              <li><span class="dot c3"></span> Správa ({{ expenseBreakdown.management }}%)</li>
              <li><span class="dot c4"></span> Ostatní ({{ expenseBreakdown.other }}%)</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import CashFlowChart from '@/components/finance/CashFlowChart.vue'
import { financeService } from '@/services/financeService'
import { debtService } from '@/services/debtService'

const loading = ref(true)
const incomes = ref([])
const expenses = ref([])
const cashFlowData = ref([])
const debtors = ref([])

onMounted(async () => {
  try {
    const [inc, exp, cf, dbt] = await Promise.all([
      financeService.getIncomes(),
      financeService.getExpenses(),
      financeService.getCashFlow(6),
      debtService.getDebtors()
    ])
    incomes.value = inc
    expenses.value = exp
    cashFlowData.value = cf
    debtors.value = dbt
  } catch (e) {
    console.error('Chyba při načítání finančních dat:', e)
  } finally {
    loading.value = false
  }
})

const kpi = computed(() => {
  const totalIncome = incomes.value.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.value.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const totalDebt = incomes.value.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const paidCount = incomes.value.filter(i => i.status === 'paid').length
  const totalCount = incomes.value.length
  const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
  const debtorCount = debtors.value.length

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    totalDebt,
    paidCount,
    collectionRate,
    debtorCount
  }
})

const expenseBreakdown = computed(() => {
  const total = expenses.value.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  if (total === 0) return { energy: 45, repairs: 30, management: 15, other: 10 }

  const energy = expenses.value.filter(e => e.status === 'paid' && e.category === 'energy').reduce((s, e) => s + e.amount, 0)
  const repairs = expenses.value.filter(e => e.status === 'paid' && e.category === 'repairs').reduce((s, e) => s + e.amount, 0)
  const management = expenses.value.filter(e => e.status === 'paid' && e.category === 'management').reduce((s, e) => s + e.amount, 0)

  return {
    energy: Math.round((energy / total) * 100),
    repairs: Math.round((repairs / total) * 100),
    management: Math.round((management / total) * 100),
    other: Math.max(0, 100 - Math.round((energy / total) * 100) - Math.round((repairs / total) * 100) - Math.round((management / total) * 100))
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value || 0)
}

const formatCurrencyShort = (value) => {
  if (!value) return '0 Kč'
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} mil`
  if (value >= 1000) return `${Math.round(value / 1000)} tis`
  return `${value} Kč`
}
</script>

<style scoped>
.finance-dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
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

.controls {
  display: flex;
  gap: 1rem;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
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
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

.kpi-card.highlight {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.kpi-card.highlight .label,
.kpi-card.highlight .value,
.kpi-card.highlight .trend {
  color: white;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.kpi-card:not(.highlight) .kpi-icon.money { background: #eff6ff; color: #2563eb; }
.kpi-icon.income { background: #dcfce7; color: #16a34a; }
.kpi-icon.expense { background: #fee2e2; color: #dc2626; }
.kpi-icon.debt { background: #fff7ed; color: #ea580c; }
.kpi-card.highlight .kpi-icon { background: rgba(255,255,255,0.2); color: white; }

.kpi-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}
.value.negative { color: #dc2626; }

.trend {
  font-size: 0.85rem;
  font-weight: 600;
  color: #16a34a;
  margin-top: 2px;
}
.trend.down { color: #dc2626; }

.sub {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  min-height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #0f172a;
}

/* Donut Placeholder */
.donut-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 2rem;
}

.donut-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0% 45%,
    #22c55e 45% 75%,
    #f59e0b 75% 90%,
    #cbd5e1 90% 100%
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-circle::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
}

.total-label {
  position: relative;
  z-index: 1;
  font-weight: 700;
  font-size: 1.25rem;
  color: #0f172a;
}

.donut-legend {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px;
}
.dot.c1 { background: #3b82f6; }
.dot.c2 { background: #22c55e; }
.dot.c3 { background: #f59e0b; }
.dot.c4 { background: #cbd5e1; }

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
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .charts-row { grid-template-columns: 1fr; }
}
</style>
