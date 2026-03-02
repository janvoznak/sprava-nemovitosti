<template>
  <div class="debt-breakdown-table">
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Období</th>
          <th>Splatnost</th>
          <th>Typ</th>
          <th class="align-right">Částka</th>
          <th class="align-right">Po splatnosti</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.incomeId">
          <td class="period-cell">
            <strong>{{ item.period }}</strong>
          </td>
          <td class="date-cell">{{ formatDate(item.dueDate) }}</td>
          <td>
            <span class="type-badge" :class="getTypeClass(item.type)">
              {{ getTypeLabel(item.type) }}
            </span>
          </td>
          <td class="align-right amount-cell">{{ formatCurrency(item.amount) }}</td>
          <td class="align-right overdue-cell">
            <span :class="{ 'text-danger': item.daysOverdue > 30 }">
              {{ item.daysOverdue }} dní
            </span>
          </td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="align-right label-cell">Celkem k úhradě:</td>
          <td class="align-right amount-cell">{{ formatCurrency(totalAmount) }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

const totalAmount = computed(() => {
  return props.items.reduce((sum, item) => sum + item.amount, 0)
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0
  }).format(amount)
}

const getTypeClass = (type) => {
  const map = {
    rent: 'bg-blue-100 text-blue-800',
    energy: 'bg-yellow-100 text-yellow-800',
    services: 'bg-purple-100 text-purple-800',
    penalty: 'bg-red-100 text-red-800'
  }
  return map[type] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (type) => {
  const map = {
    rent: 'Nájemné',
    energy: 'Energie',
    services: 'Služby',
    penalty: 'Penále'
  }
  return map[type] || type
}
</script>

<style scoped>
.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.breakdown-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.breakdown-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.period-cell {
  color: #0f172a;
}

.date-cell {
  color: #64748b;
}

.amount-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.overdue-cell {
  color: #64748b;
  font-size: 0.8125rem;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.align-right {
  text-align: right;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bg-blue-100 { background: #dbeafe; }
.text-blue-800 { color: #1e40af; }

.bg-yellow-100 { background: #fef9c3; }
.text-yellow-800 { color: #854d0e; }

.bg-purple-100 { background: #f3e8ff; }
.text-purple-800 { color: #6b21a8; }

.bg-red-100 { background: #fee2e2; }
.text-red-800 { color: #991b1b; }

.bg-gray-100 { background: #f1f5f9; }
.text-gray-800 { color: #475569; }

.total-row {
  background: #f8fafc;
  font-weight: 700;
}

.total-row td {
  border-top: 2px solid #e2e8f0;
  border-bottom: none;
  font-size: 1rem;
}

.label-cell {
  color: #64748b;
}
</style>
