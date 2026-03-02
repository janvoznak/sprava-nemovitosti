<template>
  <div class="debtor-detail-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="modal-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Načítám detail dlužníka...</p>
      </div>

      <template v-else-if="detail">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="avatar-large">{{ getInitials(detail.tenantName) }}</div>
            <div class="header-info">
              <h2 class="tenant-name">{{ detail.tenantName }}</h2>
              <div class="tenant-meta">
                <span>{{ detail.propertyName }}</span>
                <span class="dot">•</span>
                <span>Jednotka {{ detail.unitNumber }}</span>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card total-debt">
              <div class="stat-label">Celkový dluh</div>
              <div class="stat-value text-danger">
                {{ formatCurrency(detail.debtSummary.totalDebt) }}
              </div>
            </div>
            
            <div class="stat-card" :class="getSeverityClass(detail.debtSummary.severity)">
              <div class="stat-label">Stáří dluhu</div>
              <div class="stat-value">
                {{ detail.debtSummary.debtAgeDays }} dní
              </div>
              <div class="stat-badge">
                {{ getSeverityLabel(detail.debtSummary.severity) }}
              </div>
            </div>

            <div class="stat-card contact-card">
              <div class="stat-label">Kontakt</div>
              <div class="contact-row">
                <span class="material-icons">email</span>
                <a :href="'mailto:' + detail.contact.email">{{ detail.contact.email }}</a>
              </div>
              <div class="contact-row">
                <span class="material-icons">phone</span>
                <a :href="'tel:' + detail.contact.phone">{{ detail.contact.phone }}</a>
              </div>
            </div>

            <!-- Payment Discipline (New Phase 2) -->
            <div class="stat-card discipline-card full-width-col">
              <div class="stat-header">
                <div class="stat-label">Platební disciplína</div>
                <div class="discipline-badge" :class="getReliabilityClass(detail.paymentBehavior?.reliability)">
                  {{ getReliabilityLabel(detail.paymentBehavior?.reliability) }}
                </div>
              </div>
              <div class="discipline-stats">
                 <div class="d-stat">
                   <span class="d-val text-success">{{ detail.paymentBehavior?.onTimePayments || 0 }}</span>
                   <span class="d-label">Včas</span>
                 </div>
                 <div class="d-stat">
                   <span class="d-val text-warning">{{ detail.paymentBehavior?.latePayments || 0 }}</span>
                   <span class="d-label">Zpožděno</span>
                 </div>
                 <div class="d-stat">
                   <span class="d-val text-danger">{{ detail.paymentBehavior?.missedPayments || 0 }}</span>
                   <span class="d-label">Vynecháno</span>
                 </div>
                 <div class="d-stat">
                   <span class="d-val">{{ detail.paymentBehavior?.averageLatedays || 0 }} dnů</span>
                   <span class="d-label">Prům. zpoždění</span>
                 </div>
              </div>
            </div>
          </div>

          <!-- Debt Breakdown -->
          <div class="section">
            <h3 class="section-title">Detail dluhu</h3>
            <DebtBreakdownTable :items="detail.debtSummary.unpaidPeriods" />
          </div>

          <!-- Reminder History -->
          <div class="section">
            <h3 class="section-title">Historie upomínek</h3>
            <div v-if="detail.reminders.length === 0" class="empty-history">
              Zatím nebyly odeslány žádné upomínky
            </div>
            <div v-else class="timeline">
              <div v-for="reminder in detail.reminders" :key="reminder.id" class="timeline-item">
                <div class="timeline-icon">
                  <span class="material-icons">
                    {{ reminder.type === 'email' ? 'email' : reminder.type === 'sms' ? 'smartphone' : 'mark_email_unread' }}
                  </span>
                </div>
                <div class="timeline-content">
                  <div class="reminder-header">
                    <span class="reminder-type">
                      {{ reminder.type === 'email' ? 'E-mail' : reminder.type === 'sms' ? 'SMS' : 'Dopis' }}
                    </span>
                    <span class="reminder-date">{{ formatDate(reminder.sentDate) }}</span>
                  </div>
                  <p class="reminder-message">{{ reminder.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-left">
            <span class="status-indicator">
              Naposledy aktualizováno: {{ formatDate(new Date()) }}
            </span>
          </div>
          <div class="footer-actions">
            <!-- <button class="btn-secondary" @click="addNote">
              <span class="material-icons">edit_note</span>
              Poznámka
            </button> -->
            <button class="btn-primary" @click="showReminderModal = true">
              <span class="material-icons">notifications_active</span>
              Odeslat upomínku
            </button>
          </div>
        </div>

        <!-- Reminder Modal -->
        <SendReminderModal 
          v-if="showReminderModal"
          :debtor="detail"
          @close="showReminderModal = false"
          @sent="handleReminderSent"
        />

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { debtService } from '@/services/debtService'
import { getSeverityBadge } from '@/utils/debtCalculations'
import DebtBreakdownTable from './DebtBreakdownTable.vue'
import SendReminderModal from './SendReminderModal.vue'

const props = defineProps({
  debtor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'reminder-sent'])

const loading = ref(true)
const detail = ref(null)
const showReminderModal = ref(false)

const loadDetail = async () => {
  try {
    loading.value = true
    const data = await debtService.getDebtorDetail(props.debtor.tenantName, props.debtor.propertyId)
    detail.value = data
  } catch (error) {
    console.error('Failed to load debtor detail', error)
  } finally {
    loading.value = false
  }
}

const handleReminderSent = () => {
  loadDetail() // Reload to show new reminder in history
  emit('reminder-sent')
}

// Utils
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

const formatCurrency = (val) => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val)

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('cs-CZ')

const getSeverityClass = (severity) => {
  return {
    critical: 'bg-red-50 border-red-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-blue-50 border-blue-200'
  }[severity] || 'bg-gray-50'
}

const getSeverityLabel = (severity) => getSeverityBadge(severity).label

const getReliabilityClass = (reliability) => {
  return {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200'
  }[reliability] || 'bg-gray-100'
}

const getReliabilityLabel = (reliability) => {
  const map = {
    high: 'Vysoká spolehlivost',
    medium: 'Průměrná spolehlivost',
    low: 'Rizikový plátce'
  }
  return map[reliability] || 'Neznámá'
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.debtor-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: white;
  width: 800px;
  max-width: 95%;
  height: 85vh;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  border-radius: 12px 12px 0 0;
}

.header-left {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: var(--save-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tenant-name {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 700;
}

.tenant-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.dot { font-weight: bold; }

.close-btn {
  background: white;
  border: 1px solid #e2e8f0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f8fafc;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-card.total-debt {
  border-color: #fecaca;
  background: #fef2f2;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.text-danger { color: #dc2626; }
.text-warning { color: #d97706; }
.text-success { color: #16a34a; }

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.full-width-col {
  grid-column: span 3;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.discipline-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.bg-green-100 { background: #dcfce7; }
.text-green-800 { color: #166534; }
.border-green-200 { border-color: #bbf7d0; }

.bg-yellow-100 { background: #fef9c3; }
.text-yellow-800 { color: #854d0e; }
.border-yellow-200 { border-color: #fde047; }

.bg-red-100 { background: #fee2e2; }
.text-red-800 { color: #991b1b; }
.border-red-200 { border-color: #fecaca; }

.discipline-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.d-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.d-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.d-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.contact-row .material-icons {
  font-size: 1.125rem;
  color: #94a3b8;
}

.contact-row a {
  color: var(--save-color);
  text-decoration: none;
}

.contact-row a:hover { text-decoration: underline; }

.section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section-title {
  margin: 0 0 1.25rem 0;
  font-size: 1.125rem;
  color: #0f172a;
  font-weight: 600;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.timeline-content {
  flex: 1;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reminder-type {
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
}

.reminder-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.reminder-message {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 0 0 12px 12px;
}

.status-indicator {
  font-size: 0.75rem;
  color: #94a3b8;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--save-color);
  color: white;
}

.btn-primary:hover { background: var(--save-color-hover); }


.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-secondary:hover { background: #f8fafc; }

/* Loading */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: var(--save-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
