<template>
  <div class="debt-alert-widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <span class="material-icons">notifications_active</span>
        Upozornění na dluhy
      </h3>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="alerts-container">
      <!-- Critical Debtors Alert -->
      <div v-if="stats.criticalCount > 0" class="alert-item critical">
        <div class="alert-icon">
          <span class="material-icons">dangerous</span>
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ stats.criticalCount }} kritických dlužníků</div>
          <div class="alert-desc">Dluží déle než 90 dní</div>
        </div>
        <router-link to="/debtors" class="alert-action">
          Řešit
        </router-link>
      </div>

      <!-- New Debts Alert -->
      <div v-if="stats.newDebtCount > 0" class="alert-item warning">
        <div class="alert-icon">
          <span class="material-icons">trending_up</span>
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ formatCurrency(stats.newDebtAmount) }} nových dluhů</div>
          <div class="alert-desc">Za posledních 30 dní</div>
        </div>
        <router-link to="/debtors" class="alert-action">
          Zobrazit
        </router-link>
      </div>

      <!-- Reminders Alert -->
      <div v-if="stats.remindersNeeded > 0" class="alert-item info">
        <div class="alert-icon">
          <span class="material-icons">send</span>
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ stats.remindersNeeded }} upomínek k odeslání</div>
          <div class="alert-desc">Doporučeno odeslat dnes</div>
        </div>
        <button class="alert-action" @click="sendAllReminders">
          Odeslat
        </button>
      </div>

      <!-- Good News -->
      <div v-if="stats.criticalCount === 0 && stats.newDebtCount === 0" class="alert-item success">
        <div class="alert-icon">
          <span class="material-icons">check_circle</span>
        </div>
        <div class="alert-content">
          <div class="alert-title">Vše v pořádku</div>
          <div class="alert-desc">Žádné kritické situace</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { debtService } from '@/services/debtService'
import { useNotification } from '@/composables/useNotification'

const { showInfo } = useNotification()

const loading = ref(true)
const stats = ref({
  criticalCount: 0,
  newDebtCount: 0,
  newDebtAmount: 0,
  remindersNeeded: 0
})

const loadStats = async () => {
  try {
    loading.value = true
    const debtors = await debtService.getDebtors()
    
    // Calculate stats
    stats.value.criticalCount = debtors.filter(d => d.debtSummary.severity === 'critical').length
    
    const newDebtors = debtors.filter(d => d.debtSummary.debtAgeDays <= 30)
    stats.value.newDebtCount = newDebtors.length
    stats.value.newDebtAmount = newDebtors.reduce((sum, d) => sum + d.debtSummary.totalDebt, 0)
    
    // Simple logic for needed reminders: anyone with debt > 30 days who hasn't been reminded in last 15 days
    // (Mock logic since we don't strictly track last reminder date in the simplified structure yet)
    stats.value.remindersNeeded = debtors.filter(d => d.debtSummary.debtAgeDays > 5).length
    
  } catch (error) {
    console.error('Failed to load alert stats', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('cs-CZ', { 
    style: 'currency', 
    currency: 'CZK', 
    maximumFractionDigits: 0 
  }).format(val)
}

const sendAllReminders = () => {
  showInfo('Hromadné odesílání bude dostupné v příští verzi')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.debt-alert-widget {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.widget-header {
  margin-bottom: 1.25rem;
}

.widget-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-title .material-icons {
  color: #64748b;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
}

.alert-item.critical {
  background: #fef2f2;
  border-color: #fee2e2;
}

.alert-item.critical .alert-icon {
  background: #fee2e2;
  color: #dc2626;
}

.alert-item.warning {
  background: #fffbeb;
  border-color: #fef3c7;
}

.alert-item.warning .alert-icon {
  background: #fef3c7;
  color: #d97706;
}

.alert-item.info {
  background: #eff6ff;
  border-color: #dbeafe;
}

.alert-item.info .alert-icon {
  background: #dbeafe;
  color: #2563eb;
}

.alert-item.success {
  background: #f0fdf4;
  border-color: #dcfce7;
}

.alert-item.success .alert-icon {
  background: #dcfce7;
  color: #16a34a;
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.alert-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.alert-action {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  background: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.alert-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #64748b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
