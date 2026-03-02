<template>
  <div class="communication-timeline">
    <!-- Header -->
    <div class="timeline-header">
      <div class="header-left">
        <span class="timeline-icon">💬</span>
        <h3 class="timeline-title">Komunikace</h3>
        <span v-if="communications.length > 0" class="comm-count">
          {{ communications.length }} záznamů
        </span>
      </div>
      <button class="btn-primary" @click="handleAddNote">
        <span class="material-icons">add</span>
        Přidat poznámku
      </button>
    </div>

    <!-- Quick Actions -->
    <div v-if="showQuickActions" class="quick-actions">
      <button class="quick-action-btn reminder" @click="handleQuickReminder">
        <span class="material-icons">notifications</span>
        Zaslat upomínku
      </button>
      <button class="quick-action-btn payment" @click="handleQuickPayment">
        <span class="material-icons">payments</span>
        Zaznamenat platbu
      </button>
    </div>

    <!-- Filters -->
    <div v-if="communications.length > 0" class="filter-tabs">
      <button 
        :class="['filter-tab', { active: activeFilter === 'all' }]"
        @click="activeFilter = 'all'"
      >
        Vše
        <span class="filter-count">{{ communications.length }}</span>
      </button>
      <button v-for="filter in filterOptions" :key="filter.type"
        :class="['filter-tab', { active: activeFilter === filter.type }]"
        @click="activeFilter = filter.type"
      >
        <span>{{ filter.icon }}</span>
        {{ filter.label }}
        <span class="filter-count">{{ getFilterCount(filter.type) }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání komunikace...</p>
    </div>

    <!-- Timeline Content -->
    <div v-else-if="filteredCommunications.length > 0" class="timeline-content">
      <!-- Grouped by month -->
      <div v-for="(group, monthKey) in groupedCommunications" :key="monthKey" class="month-group">
        <div class="month-separator">
          <span class="month-label">{{ group.label }}</span>
        </div>
        
        <CommunicationNote 
          v-for="comm in group.communications" 
          :key="comm.id"
          :communication="comm"
          @edit="handleEdit"
          @delete="handleDelete"
          @download="handleDownload"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <p class="empty-text">{{ getEmptyMessage() }}</p>
      <button class="btn-primary" @click="handleAddNote">
        <span class="material-icons">add</span>
        Přidat první poznámku
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { communicationService } from '@/services/communicationService'
import { useNotification } from '@/composables/useNotification'
import CommunicationNote from './CommunicationNote.vue'

const props = defineProps({
  tenantId: {
    type: String,
    required: false
  },
  propertyId: {
    type: String,
    required: false
  },
  showQuickActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['add-note', 'quick-reminder', 'quick-payment', 'edit', 'delete'])

const { showSuccess, showError } = useNotification()

const communications = ref([])
const loading = ref(true)
const activeFilter = ref('all')

const filterOptions = [
  { type: 'reminder', label: 'Upomínky', icon: '🔔' },
  { type: 'payment', label: 'Platby', icon: '💰' },
  { type: 'complaint', label: 'Reklamace', icon: '⚠️' },
  { type: 'termination', label: 'Výpovědi', icon: '📄' },
  { type: 'note', label: 'Poznámky', icon: '📝' }
]

const loadCommunications = async () => {
  try {
    loading.value = true
    
    if (props.tenantId) {
      communications.value = await communicationService.getCommunications(props.tenantId)
    } else if (props.propertyId) {
      communications.value = await communicationService.getCommunicationsByProperty(props.propertyId)
    }
  } catch (error) {
    showError('Nepodařilo se načíst komunikaci')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const filteredCommunications = computed(() => {
  return communicationService.filterByType(communications.value, activeFilter.value)
})

const groupedCommunications = computed(() => {
  return communicationService.groupByMonth(filteredCommunications.value)
})

const getFilterCount = (type) => {
  return communications.value.filter(c => c.type === type).length
}

const getEmptyMessage = () => {
  if (activeFilter.value !== 'all') {
    const filter = filterOptions.find(f => f.type === activeFilter.value)
    return `Žádné záznamy typu "${filter?.label}"`
  }
  return 'Zatím nejsou žádné záznamy komunikace'
}

const handleAddNote = () => {
  emit('add-note')
}

const handleQuickReminder = () => {
  emit('quick-reminder')
}

const handleQuickPayment = () => {
  emit('quick-payment')
}

const handleEdit = (communication) => {
  emit('edit', communication)
}

const handleDelete = async (communication) => {
  if (!confirm(`Opravdu chcete smazat záznam "${communication.title}"?`)) {
    return
  }

  try {
    await communicationService.deleteCommunication(communication.id)
    communications.value = communications.value.filter(c => c.id !== communication.id)
    showSuccess('Záznam byl smazán')
  } catch (error) {
    showError('Nepodařilo se smazat záznam')
    console.error(error)
  }
}

const handleDownload = (attachment) => {
  // In mock mode, just show notification
  showSuccess(`Stahování: ${attachment.name}`)
  console.log('Download:', attachment.url)
}

onMounted(() => {
  loadCommunications()
})

// Expose refresh method
defineExpose({
  refresh: loadCommunications
})
</script>

<style scoped>
.communication-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timeline-icon {
  font-size: 1.5rem;
}

.timeline-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.comm-count {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary .material-icons {
  font-size: 18px;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.quick-action-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.quick-action-btn .material-icons {
  font-size: 20px;
}

.quick-action-btn.reminder {
  color: #f59e0b;
  border-color: #fbbf24;
}

.quick-action-btn.reminder:hover {
  background: #fffbeb;
  border-color: #f59e0b;
}

.quick-action-btn.payment {
  color: #22c55e;
  border-color: #86efac;
}

.quick-action-btn.payment:hover {
  background: #f0fdf4;
  border-color: #22c55e;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-tab.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.filter-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: center;
}

.filter-tab.active .filter-count {
  background: #2563eb;
  color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.timeline-content {
  position: relative;
}

.month-group {
  margin-bottom: 2rem;
}

.month-separator {
  position: relative;
  text-align: center;
  margin: 2rem 0 1.5rem 0;
}

.month-separator::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e2e8f0;
  z-index: 0;
}

.month-label {
  position: relative;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  z-index: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.empty-text {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2rem 0;
}
</style>
