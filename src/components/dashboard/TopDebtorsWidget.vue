<template>
  <div class="top-debtors-widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <span class="material-icons">money_off</span>
        Top Dlužníci
      </h3>
      <button class="view-all-btn" @click="router.push('/debtors')">
        Vše
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="debtors.length === 0" class="empty-state">
      <span class="material-icons">check_circle_outline</span>
      <p>Žádní dlužníci k zobrazení</p>
    </div>

    <div v-else class="debtors-list">
      <div 
        v-for="debtor in debtors" 
        :key="debtor.id" 
        class="debtor-item"
        @click="navigateToDetail(debtor)"
      >
        <div class="debtor-item-left">
          <div class="debtor-avatar" :class="debtor.debtSummary.severity">
            {{ getInitials(debtor.tenantName) }}
          </div>
          <div class="debtor-main-info">
            <div class="debtor-name">{{ debtor.tenantName }}</div>
            <div class="debtor-property">
              <span class="material-icons">home</span>
              {{ debtor.propertyName }}
            </div>
            <div class="debtor-meta">
              <span class="debt-age" :class="debtor.debtSummary.severity">
                <span class="severity-dot"></span>
                {{ debtor.debtSummary.debtAgeDays }} dní po splatnosti
              </span>
            </div>
          </div>
        </div>
        
        <div class="debtor-item-right">
          <div class="debt-amount">{{ formatCurrency(debtor.debtSummary.totalDebt) }}</div>
          <button 
            @click.stop="openReminderModal(debtor)" 
            class="action-icon-btn"
            title="Odeslat upomínku"
          >
            <span class="material-icons">notifications_active</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reminder Modal -->
    <SendReminderModal 
      v-if="showReminderModal"
      :debtor="selectedDebtor"
      @close="closeReminderModal"
      @sent="handleReminderSent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { debtService } from '@/services/debtService'
import { useNotification } from '@/composables/useNotification'
import SendReminderModal from '@/components/debtors/SendReminderModal.vue'

const router = useRouter()
const { showSuccess } = useNotification()

const loading = ref(true)
const debtors = ref([])
const showReminderModal = ref(false)
const selectedDebtor = ref(null)

const loadDebtors = async () => {
  try {
    loading.value = true
    const allDebtors = await debtService.getDebtors()
    // Sort by total debt descending and take top 5
    debtors.value = allDebtors
      .sort((a, b) => b.debtSummary.totalDebt - a.debtSummary.totalDebt)
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to load top debtors', error)
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

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const navigateToDetail = (debtor) => {
  router.push({ path: '/debtors', query: { search: debtor.tenantName } })
}

const openReminderModal = (debtor) => {
  selectedDebtor.value = debtor
  showReminderModal.value = true
}

const closeReminderModal = () => {
  showReminderModal.value = false
  selectedDebtor.value = null
}

const handleReminderSent = () => {
  showSuccess('Upomínka odeslána')
  loadDebtors()
}

onMounted(() => {
  loadDebtors()
})
</script>

<style scoped>
.top-debtors-widget {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.widget-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.widget-title .material-icons {
  font-size: 1.25rem;
  color: #94a3b8;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}

.view-all-btn .material-icons {
  font-size: 1rem;
}

.debtors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 4px; /* Space for scrollbar */
}

.debtor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.debtor-item:hover {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
}

.debtor-item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.debtor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.debtor-avatar.critical { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.debtor-avatar.medium { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
.debtor-avatar.low { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

.debtor-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.debtor-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.debtor-property {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.debtor-property .material-icons {
  font-size: 0.875rem;
}

.debt-age {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.severity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.debt-age.critical { color: #dc2626; }
.debt-age.critical .severity-dot { background: #dc2626; box-shadow: 0 0 6px rgba(220, 38, 38, 0.4); }

.debt-age.medium { color: #d97706; }
.debt-age.medium .severity-dot { background: #d97706; }

.debt-age.low { color: #16a34a; }
.debt-age.low .severity-dot { background: #16a34a; }

.debtor-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.debt-amount {
  font-weight: 700;
  color: #dc2626;
  font-size: 1rem;
}

.action-icon-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.action-icon-btn .material-icons {
  font-size: 1.125rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.empty-state .material-icons {
  font-size: 2.5rem;
  color: #d1d5db;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Custom Scrollbar */
.debtors-list::-webkit-scrollbar {
  width: 4px;
}
.debtors-list::-webkit-scrollbar-track {
  background: transparent;
}
.debtors-list::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.debtors-list::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
