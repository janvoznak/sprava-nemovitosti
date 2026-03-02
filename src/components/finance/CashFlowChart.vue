<template>
  <div class="cashflow-chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">
        <span class="icon">📈</span>
        Cash Flow - Posledních 12 měsíců
      </h3>
    </div>

    <div class="chart-body">
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot income"></span>
          <span>Příjmy</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot expense"></span>
          <span>Výdaje</span>
        </div>
        <div class="legend-item">
          <span class="legend-line"></span>
          <span>Čistý zisk</span>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-y-axis">
          <span class="y-label">{{ formatCurrency(maxValue, true) }}</span>
          <span class="y-label">{{ formatCurrency(maxValue * 0.5, true) }}</span>
          <span class="y-label">0 Kč</span>
        </div>

        <div class="chart-content">
          <div class="chart-bars">
            <div v-for="data in chartData" :key="data.month" class="bar-group">
              <div class="bar-container">
                <div 
                  class="bar income-bar" 
                  :style="{ height: getBarHeight(data.income) + '%' }"
                  :title="`Příjmy: ${formatCurrency(data.income)}`"
                >
                  <span class="bar-label">{{ formatCurrency(data.income, true) }}</span>
                </div>
                <div 
                  class="bar expense-bar" 
                  :style="{ height: getBarHeight(data.expenses) + '%' }"
                  :title="`Výdaje: ${formatCurrency(data.expenses)}`"
                >
                  <span class="bar-label">{{ formatCurrency(data.expenses, true) }}</span>
                </div>
              </div>
              <div class="month-label">{{ formatMonth(data.month) }}</div>
            </div>
          </div>

          <!-- Net cash flow line -->
          <svg class="chart-line" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <polyline 
              :points="linePoints" 
              fill="none" 
              stroke="#2563eb" 
              stroke-width="3"
            />
          </svg>
        </div>
      </div>

      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">Průměrné příjmy</span>
          <span class="stat-value income-color">{{ formatCurrency(avgIncome) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Průměrné výdaje</span>
          <span class="stat-value expense-color">{{ formatCurrency(avgExpenses) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Průměrný čistý zisk</span>
          <span class="stat-value" :class="avgNetCashFlow >= 0 ? 'profit-color' : 'loss-color'">
            {{ formatCurrency(avgNetCashFlow) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cashFlowData: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => props.cashFlowData || [])

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 100000
  const maxIncome = Math.max(...chartData.value.map(d => d.income))
  const maxExpense = Math.max(...chartData.value.map(d => d.expenses))
  return Math.max(maxIncome, maxExpense) * 1.1 // 10% padding
})

const avgIncome = computed(() => {
  if (chartData.value.length === 0) return 0
  return chartData.value.reduce((sum, d) => sum + d.income, 0) / chartData.value.length
})

const avgExpenses = computed(() => {
  if (chartData.value.length === 0) return 0
  return chartData.value.reduce((sum, d) => sum + d.expenses, 0) / chartData.value.length
})

const avgNetCashFlow = computed(() => avgIncome.value - avgExpenses.value)

const linePoints = computed(() => {
  if (chartData.value.length === 0) return ''
  
  const width = 1000
  const height = 200
  const segmentWidth = width / (chartData.value.length - 1 || 1)
  
  return chartData.value.map((data, index) => {
    const x = index * segmentWidth
    const y = height - (data.netCashFlow / maxValue.value * height)
    return `${x},${y}`
  }).join(' ')
})

const getBarHeight = (value) => {
  return (value / maxValue.value) * 100
}

const formatCurrency = (value, simplified = false) => {
  if (simplified) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${Math.round(value / 1000)}k`
    return Math.round(value).toString()
  }
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value)
}

const formatMonth = (monthString) => {
  const [year, month] = monthString.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
}
</script>

<style scoped>
.cashflow-chart-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.chart-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.chart-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title .icon {
  font-size: 1.25rem;
}

.chart-body {
  padding: 1.5rem;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.income {
  background: #22c55e;
}

.legend-dot.expense {
  background: #ef4444;
}

.legend-line {
  width: 24px;
  height: 3px;
  background: #2563eb;
  border-radius: 2px;
}

.chart-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 0.5rem;
  min-width: 60px;
}

.y-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: right;
}

.chart-content {
  flex: 1;
  position: relative;
  height: 300px;
  background: linear-gradient(to bottom, transparent 0%, transparent 33%, #f8fafc 33%, #f8fafc 33.5%, transparent 33.5%, transparent 66%, #f8fafc 66%, #f8fafc 66.5%, transparent 66.5%);
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
}

.bar {
  flex: 1;
  max-width: 40px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
}

.bar:hover {
  opacity: 0.8;
}

.income-bar {
  background: linear-gradient(to top, #22c55e, #34d399);
}

.expense-bar {
  background: linear-gradient(to top, #ef4444, #f87171);
}

.bar-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  transform: rotate(-90deg);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.bar:hover .bar-label {
  opacity: 1;
}

.month-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

.chart-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.income-color {
  color: #22c55e;
}

.expense-color {
  color: #ef4444;
}

.profit-color {
  color: #2563eb;
}

.loss-color {
  color: #dc2626;
}
</style>
