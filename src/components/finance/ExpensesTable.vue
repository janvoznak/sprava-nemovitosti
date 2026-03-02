<template>
  <div class="expenses-table-wrapper">
    <div class="table-header">
      <h3 class="table-title">
        <span class="icon">📊</span>
        Výdaje
      </h3>
      <div class="filters">
        <select v-model="categoryFilter" class="filter-select">
          <option value="all">Všechny kategorie</option>
          <option value="repair">🔧 Opravy</option>
          <option value="revision">✓ Revize</option>
          <option value="energy">⚡ Energie</option>
          <option value="tax">💰 Daně</option>
          <option value="insurance">🛡️ Pojištění</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kategorie</th>
            <th>Popis</th>
            <th>Nemovitost</th>
            <th class="align-right">Částka</th>
            <th>Datum</th>
            <th>Dodavatel</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in filteredExpenses" :key="expense.id">
            <td>
              <span class="category-badge">
                {{ getCategoryIcon(expense.category) }} {{ getCategoryLabel(expense.category) }}
              </span>
            </td>
            <td><strong>{{ expense.description }}</strong></td>
            <td class="text-muted">{{ expense.propertyName }}</td>
            <td class="align-right expense-amount">{{ formatCurrency(expense.amount) }}</td>
            <td>{{ formatDate(expense.date) }}</td>
            <td class="text-muted">{{ expense.supplier }}</td>
            <td>
              <span :class="['status-badge', expense.status === 'paid' ? 'success' : 'warning']">
                {{ expense.status === 'paid' ? '✓ Zaplaceno' : '⏳ Nezaplaceno' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary by category -->
    <div class="summary-section">
      <div class="summary-title">Součty podle kategorií</div>
      <div class="summary-grid">
        <div v-for="cat in categorySums" :key="cat.category" class="summary-item">
          <span class="summary-label">{{ getCategoryIcon(cat.category) }} {{ getCategoryLabel(cat.category) }}</span>
          <span class="summary-value">{{ formatCurrency(cat.total) }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredExpenses.length === 0" class="empty-state">
      <p>Žádné výdaje nenalezeny</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  }
})

const categoryFilter = ref('all')

const filteredExpenses = computed(() => {
  let filtered = props.expenses
  
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(exp => exp.category === categoryFilter.value)
  }
  
  // Sort by date descending
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const categorySums = computed(() => {
  const categories = ['repair', 'revision', 'energy', 'tax', 'insurance']
  return categories.map(cat => ({
    category: cat,
    total: props.expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(cat => cat.total > 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

const getCategoryIcon = (category) => {
  const icons = {
    repair: '🔧',
    revision: '✓',
    energy: '⚡',
    tax: '💰',
    insurance: '🛡️'
  }
  return icons[category] || '📄'
}

const getCategoryLabel = (category) => {
  const labels = {
    repair: 'Opravy',
    revision: 'Revize',
    energy: 'Energie',
    tax: 'Daně',
    insurance: 'Pojištění'
  }
  return labels[category] || category
}
</script>

<style scoped>
.expenses-table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.table-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.table-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-title .icon {
  font-size: 1.25rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.data-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  color: #1e293b;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.text-muted {
  color: #64748b !important;
}

.align-right {
  text-align: right;
}

.expense-amount {
  font-weight: 600;
  color: #dc2626;
}

.category-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.summary-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.summary-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.summary-label {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #dc2626;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
