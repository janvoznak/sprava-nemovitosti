<template>
  <div class="forecast-wrapper">
    <div class="forecast-header">
      <h3 class="forecast-title">
        <span class="icon">🔮</span>
        Prognóza - Příští měsíc
      </h3>
    </div>

    <div class="forecast-body">
      <!-- Expected Net Cash Flow -->
      <div class="forecast-summary">
        <div class="summary-card">
          <div class="summary-label">Očekávané příjmy</div>
          <div class="summary-value income-color">{{ formatCurrency(forecast.expectedIncomesTotal || 0) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Odhadované výdaje</div>
          <div class="summary-value expense-color">{{ formatCurrency(forecast.estimatedExpenses || 0) }}</div>
        </div>
        <div class="summary-card highlight">
          <div class="summary-label">Predikovaný cash flow</div>
          <div class="summary-value" :class="forecast.netForecast >= 0 ? 'profit-color' : 'loss-color'">
            {{ formatCurrency(forecast.netForecast || 0) }}
          </div>
          <div v-if="forecast.netForecast < 0" class="warning-badge">
            ⚠ Negativní cash flow
          </div>
        </div>
      </div>

      <!-- Expected Incomes List -->
      <div class="forecast-section">
        <h4 class="section-title">Očekávané příjmy - splatnosti nájemného</h4>
        <div class="income-list">
          <div 
            v-for="income in forecast.expectedIncomes" 
            :key="income.id"
            class="income-item"
          >
            <div class="income-info">
              <strong>{{ income.tenant }}</strong>
              <span class="text-muted">{{ income.propertyName }}</span>
            </div>
            <div class="income-details">
              <span class="due-date">Splatnost: {{ formatDate(income.dueDate) }}</span>
              <span class="amount">{{ formatCurrency(income.amount) }}</span>
            </div>
          </div>
        </div>
        <div v-if="!forecast.expectedIncomes || forecast.expectedIncomes.length === 0" class="empty-message">
          Žádné očekávané příjmy
        </div>
      </div>

      <!-- Upcoming Revisions -->
      <div v-if="forecast.upcomingRevisions && forecast.upcomingRevisions.length > 0" class="forecast-section">
        <h4 class="section-title">Plánované výdaje - revize a údržba</h4>
        <div class="revision-list">
          <div 
            v-for="(revision, index) in forecast.upcomingRevisions" 
            :key="index"
            class="revision-item"
          >
            <div class="revision-info">
              <span class="revision-icon">🔧</span>
              <div class="revision-details">
                <strong>{{ revision.type }}</strong>
                <span class="text-muted">{{ revision.property }}</span>
              </div>
            </div>
            <div class="revision-cost">
              <span class="cost-label">Odhad:</span>
              <span class="cost-value">{{ formatCurrency(revision.estimatedCost) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison with average -->
      <div class="forecast-comparison">
        <div class="comparison-text">
          <span class="comparison-icon">📊</span>
          <span>
            Predikovaný cash flow je 
            <strong :class="comparisonClass">{{ comparisonText }}</strong>
            než průměr posledních 3 měsíců
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  forecast: {
    type: Object,
    default: () => ({})
  },
  avgCashFlow: {
    type: Number,
    default: 0
  }
})

const comparisonText = computed(() => {
  const diff = (props.forecast.netForecast || 0) - props.avgCashFlow
  if (Math.abs(diff) < 5000) return 'srovnatelný'
  return diff > 0 ? 'vyšší' : 'nižší'
})

const comparisonClass = computed(() => {
  const diff = (props.forecast.netForecast || 0) - props.avgCashFlow
  if (Math.abs(diff) < 5000) return 'neutral'
  return diff > 0 ? 'positive' : 'negative'
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })
}
</script>

<style scoped>
.forecast-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.forecast-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.forecast-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forecast-title .icon {
  font-size: 1.25rem;
}

.forecast-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.forecast-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-card {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.summary-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.5rem;
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

.warning-badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.forecast-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.income-list, .revision-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.income-item, .revision-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.income-info, .revision-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.revision-info {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.revision-icon {
  font-size: 1.5rem;
}

.revision-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.text-muted {
  font-size: 0.875rem;
  color: #64748b;
}

.income-details, .revision-cost {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.due-date {
  font-size: 0.75rem;
  color: #64748b;
}

.amount, .cost-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.cost-label {
  font-size: 0.75rem;
  color: #64748b;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.forecast-comparison {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.comparison-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

.comparison-icon {
  font-size: 1.25rem;
}

.comparison-text strong.positive {
  color: #22c55e;
}

.comparison-text strong.negative {
  color: #dc2626;
}

.comparison-text strong.neutral {
  color: #2563eb;
}
</style>
