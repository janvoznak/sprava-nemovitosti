<template>
  <div class="incomes-table-wrapper">
    <div class="table-header">
      <h3 class="table-title">
        <span class="icon">💰</span>
        Příjmy - Nájemné
      </h3>
      <div class="filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">Všechny</option>
          <option value="paid">Zaplaceno</option>
          <option value="unpaid">Nezaplaceno</option>
          <option value="late">Po splatnosti</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nájemník</th>
            <th>Nemovitost</th>
            <th>Období</th>
            <th class="align-right">Částka</th>
            <th>Splatnost</th>
            <th>Zaplaceno</th>
            <th>Status</th>
            <th class="align-center">Akce</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="income in filteredIncomes" :key="income.id">
            <td><strong>{{ income.tenant }}</strong></td>
            <td class="text-muted">{{ income.propertyName }}</td>
            <td class="text-muted">{{ income.period }}</td>
            <td class="align-right">{{ formatCurrency(income.amount) }}</td>
            <td>{{ formatDate(income.dueDate) }}</td>
            <td>{{ income.paidDate ? formatDate(income.paidDate) : '-' }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(income)]">
                {{ getStatusLabel(income) }}
              </span>
            </td>
            <td class="align-center">
              <button 
                v-if="income.status !== 'paid'" 
                @click="markAsPaid(income.id)"
                class="action-btn primary"
                title="Označit jako zaplaceno"
              >
                ✓
              </button>
              <button 
                v-if="income.status === 'late'" 
                @click="sendReminder(income)"
                class="action-btn warning"
                title="Odeslat upomínku"
              >
                ✉
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredIncomes.length === 0" class="empty-state">
      <p>Žádné příjmy nenalezeny</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const props = defineProps({
  incomes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-status'])

const { showSuccess, showError } = useNotification()
const statusFilter = ref('all')

const filteredIncomes = computed(() => {
  let filtered = props.incomes
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(inc => inc.status === statusFilter.value)
  }
  
  // Sort: late first, then unpaid, then by due date
  return filtered.sort((a, b) => {
    const statusOrder = { late: 0, unpaid: 1, paid: 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(b.dueDate) - new Date(a.dueDate)
  })
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

const getStatusClass = (income) => {
  switch (income.status) {
    case 'paid': return 'success'
    case 'late': return 'danger'
    case 'unpaid': return 'warning'
    default: return 'neutral'
  }
}

const getStatusLabel = (income) => {
  switch (income.status) {
    case 'paid': return '✓ Zaplaceno'
    case 'late': {
      const daysLate = Math.floor((new Date() - new Date(income.dueDate)) / (1000 * 60 * 60 * 24))
      return `⚠ Po splatnosti (${daysLate}d)`
    }
    case 'unpaid': return '⏳ Nezaplaceno'
    default: return '-'
  }
}

const markAsPaid = async (id) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    emit('update-status', id, 'paid', today)
    showSuccess('Platba označena jako zaplacená')
  } catch (error) {
    showError('Nepodařilo se aktualizovat status platby')
    console.error(error)
  }
}

const sendReminder = (income) => {
  showSuccess(`Upomínka odeslána: ${income.tenant}`)
  // In real app, this would trigger email/SMS
}
</script>

<style scoped>
.incomes-table-wrapper {
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

.align-center {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.status-badge.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}

.status-badge.danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.status-badge.warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.status-badge.neutral {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #f1f5f9;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  margin: 0 0.25rem;
}

.action-btn.primary {
  border-color: #22c55e;
  color: #22c55e;
}

.action-btn.primary:hover {
  background: #22c55e;
  color: white;
}

.action-btn.warning {
  border-color: #f59e0b;
  color: #f59e0b;
}

.action-btn.warning:hover {
  background: #f59e0b;
  color: white;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
