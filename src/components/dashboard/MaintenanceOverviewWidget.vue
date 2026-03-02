<template>
  <div class="maintenance-overview-widget h-full">
    <div class="widget-header">
      <h3>
        <span class="material-icons">build</span>
        Stav údržby
      </h3>
      <button class="view-all" @click="$router.push('/maintenance')">Vše</button>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
       <div class="stat-item">
         <div class="stat-value critical">{{ criticalCount }}</div>
         <div class="stat-label">Kritické</div>
       </div>
       <div class="stat-item">
         <div class="stat-value warning">{{ highPriorityCount }}</div>
         <div class="stat-label">Vysoká</div>
       </div>
       <div class="stat-item">
         <div class="stat-value info">{{ openCount }}</div>
         <div class="stat-label">Otevřeno</div>
       </div>
    </div>

    <!-- Progress / Visual -->
    <div class="progress-container">
      <div 
        class="progress-bar critical" 
        :style="{ flex: criticalCount }"
        v-if="criticalCount > 0"
        title="Kritické"
      ></div>
      <div 
        class="progress-bar warning" 
        :style="{ flex: highPriorityCount }"
        v-if="highPriorityCount > 0"
        title="Vysoká priorita"
      ></div>
      <div 
        class="progress-bar info" 
        :style="{ flex: openCount }"
        v-if="openCount > 0"
        title="Ostatní otevřené"
      ></div>
      <div 
        class="progress-bar empty" 
        :style="{ flex: (totalCount === 0 ? 1 : 0) }"
        v-if="totalCount === 0"
      ></div>
    </div>
    
    <div v-if="loading" class="loading-state">
      Načítání...
    </div>

    <div v-else-if="latestTickets.length === 0" class="empty-state">
      <span class="material-icons">check_circle</span>
      <p>Žádné otevřené požadavky</p>
    </div>
    
    <div v-else class="list-container">
      <div class="list-title">Nejnovější požadavky</div>
      <div 
        v-for="ticket in latestTickets" 
        :key="ticket.id" 
        class="list-item"
        @click="$router.push(`/maintenance/${ticket.id}`)"
      >
        <div class="priority-dot" :class="getPriorityClass(ticket.priority)"></div>
        <div class="ticket-info">
          <div class="ticket-subject">{{ ticket.subject }}</div>
          <div class="ticket-meta">{{ formatDate(ticket.createdAt) }} • {{ ticket.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { maintenanceService } from '@/services/maintenanceService'

const tickets = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    tickets.value = await maintenanceService.getTickets()
  } catch (e) {
    console.error('Failed to load maintenance tickets', e)
  } finally {
    loading.value = false
  }
})

const activeTickets = computed(() => {
  return tickets.value.filter(t => t.status !== 'done' && t.status !== 'cancelled')
})

const totalCount = computed(() => activeTickets.value.length)

const criticalCount = computed(() => {
  return activeTickets.value.filter(t => t.priority === 'critical').length
})

const highPriorityCount = computed(() => {
  return activeTickets.value.filter(t => t.priority === 'high').length
})

const openCount = computed(() => {
  return activeTickets.value.filter(t => t.priority !== 'critical' && t.priority !== 'high').length
})

const latestTickets = computed(() => {
  return [...activeTickets.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
})

const getPriorityClass = (priority) => {
  if (priority === 'critical') return 'critical'
  if (priority === 'high') return 'warning'
  return 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })
}
</script>

<style scoped>
.maintenance-overview-widget {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.widget-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.widget-header h3 .material-icons {
  font-size: 1.25rem;
  color: #94a3b8;
}

.view-all {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}
.view-all:hover { text-decoration: underline; }

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-value.critical { color: #dc2626; }
.stat-value.warning { color: #d97706; }
.stat-value.info { color: #2563eb; }

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.progress-container {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: #e2e8f0;
  margin-bottom: 1.25rem;
  gap: 2px;
}

.progress-bar { height: 100%; transition: flex 0.3s; }
.progress-bar.critical { background: #dc2626; }
.progress-bar.warning { background: #d97706; }
.progress-bar.info { background: #3b82f6; }
.progress-bar.empty { background: #cbd5e1; }

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
  min-height: 80px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-title {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.list-item:hover { background: #f1f5f9; }

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.priority-dot.critical { background: #dc2626; }
.priority-dot.warning { background: #d97706; }
.priority-dot.info { background: #3b82f6; }

.ticket-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ticket-subject {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-meta {
  font-size: 0.7rem;
  color: #94a3b8;
}
</style>
