<template>
  <div class="maintenance-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Údržba' }
    ]" />

    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Údržba a opravy</h1>
      <button class="btn-primary" @click="createTicket">
        <span class="material-icons">add</span> Nové hlášení
      </button>
    </div>

    <!-- Filters & Sort -->
    <div class="filters-bar">
      <div class="filter-group">
        <span class="material-icons filter-icon">search</span>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Hledat (předmět, popis, nájemce...)" 
          class="filter-input"
        >
        
        <select v-model="filters.status" class="filter-select">
          <option value="all">Všechny stavy</option>
          <option value="active">Aktivní (Nové + Řeší se)</option>
        </select>
        <select v-model="filters.property" class="filter-select">
          <option value="all">Všechny nemovitosti</option>
          <option value="P0001">Bytový dům Centrum</option>
          <option value="P0002">Kanceláře Nová Karolina</option>
          <option value="P0003">Skladový areál Poruba</option>
        </select>
        <select v-model="filters.priority" class="filter-select">
          <option value="all">Všechny priority</option>
          <option value="critical">Kritická</option>
          <option value="high">Vysoká</option>
        </select>
      </div>

      <div class="sort-group">
        <span class="label">Seřadit:</span>
        <select v-model="sortBy" class="filter-select">
          <option value="newest">Nejnovější</option>
          <option value="priority">Dle priority</option>
          <option value="cost_desc">Nejvyšší náklady</option>
        </select>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání tiketů...</p>
    </div>

    <div v-else class="kanban-board">
      <MaintenanceKanbanColumn 
        title="Nové" 
        statusId="new"
        :tickets="getFilteredTickets('new')" 
        @click-ticket="openTicketDetail"
        @ticket-moved="handleTicketMoved"
      />
      <MaintenanceKanbanColumn 
        title="V řešení" 
        statusId="in_progress"
        :tickets="getFilteredTickets('in_progress')" 
        @click-ticket="openTicketDetail"
        @ticket-moved="handleTicketMoved"
      />
      <MaintenanceKanbanColumn 
        title="Hotovo" 
        statusId="done"
        :tickets="getFilteredTickets('done')" 
        @click-ticket="openTicketDetail"
        @ticket-moved="handleTicketMoved"
      />
    </div>

    <!-- Ticket Detail Modal -->
    <TicketDetailModal 
      :isOpen="showDetailModal"
      :ticket="selectedTicket"
      @close="showDetailModal = false"
      @save="handleTicketSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import MaintenanceKanbanColumn from '@/components/maintenance/MaintenanceKanbanColumn.vue';
import TicketDetailModal from '@/components/maintenance/TicketDetailModal.vue';
import { maintenanceService } from '@/services/maintenanceService';

const route = useRoute();

const tickets = ref([]);
const loading = ref(true);
const showDetailModal = ref(false);
const selectedTicket = ref(null);

const filters = ref({
  status: 'all',
  property: 'all',
  priority: 'all',
  search: ''
});

const sortBy = ref('newest');

const loadTickets = async () => {
  loading.value = true;
  try {
    tickets.value = await maintenanceService.getTickets();
  } finally {
    loading.value = false;
  }
};

// Advanced Filtering & Sorting
const getFilteredTickets = (status) => {
  let result = tickets.value.filter(t => t.status === status);

  // Filter Property
  if (filters.value.property !== 'all') {
    result = result.filter(t => t.propertyId === filters.value.property);
  }

  // Filter Priority
  if (filters.value.priority !== 'all') {
    result = result.filter(t => t.priority === filters.value.priority);
  }

  // Filter Search
  if (filters.value.search) {
    const query = filters.value.search.toLowerCase();
    result = result.filter(t => 
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      (t.tenantName && t.tenantName.toLowerCase().includes(query))
    );
  }

  // Filter Status Group
  if (filters.value.status === 'active' && status === 'done') return [];

  // Sorting
  return result.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy.value === 'cost_desc') {
      const costA = a.realCost || a.estimatedCost || 0;
      const costB = b.realCost || b.estimatedCost || 0;
      return costB - costA;
    }
    if (sortBy.value === 'priority') {
      const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    return 0;
  });
};

const createTicket = () => {
  // Create empty ticket template for new ticket
  selectedTicket.value = {
    id: 'NEW',
    subject: '',
    description: '',
    status: 'new',
    priority: 'medium',
    propertyName: '',
    propertyId: '',
    supplier: '',
    estimatedCost: null,
    realCost: null,
    invoiceDate: '',
    photos: [],
    createdAt: new Date().toISOString()
  };
  showDetailModal.value = true;
};

const openTicketDetail = (ticket) => {
  selectedTicket.value = ticket;
  showDetailModal.value = true;
};

const handleTicketSave = async (updatedTicket) => {
  if (updatedTicket.id === 'NEW') {
    // Creating new ticket
    if (!updatedTicket.subject) {
      alert('Prosím vyplňte předmět závady.');
      return;
    }
    await maintenanceService.createTicket({
      subject: updatedTicket.subject,
      description: updatedTicket.description,
      propertyName: updatedTicket.propertyName || 'Nová Nemovitost',
      propertyId: updatedTicket.propertyId || 'TEST',
      priority: updatedTicket.priority,
      estimatedCost: updatedTicket.estimatedCost
    });
  } else {
    // Updating existing ticket
    await maintenanceService.updateTicket(updatedTicket.id, updatedTicket);
  }
  showDetailModal.value = false;
  await loadTickets();
};

const handleTicketMoved = async ({ ticketId, newStatus }) => {
  const ticket = tickets.value.find(t => t.id === ticketId);
  if (ticket && ticket.status !== newStatus) {
    // Optimistic update locally
    ticket.status = newStatus;
    
    // Check if moving to done without cost (optional: could trigger modal here)
    if (newStatus === 'done' && !ticket.realCost) {
       // Ideally we might open modal here, but for simple DnD we'll just let it pass 
       // or user can open modal later to add cost. 
       // For better UX, we could open modal if cost is missing:
       // openTicketDetail(ticket); return; 
    }

    await maintenanceService.updateTicket(ticketId, { status: newStatus });
    // Reload not strictly necessary if optimistic update works, but safer to sync
    // await loadTickets(); 
  }
};

const checkRouteParams = () => {
  if (route.query.search) {
    filters.value.search = route.query.search;
  }
  
  if (route.query.ticket) {
    const ticketId = route.query.ticket;
    const ticket = tickets.value.find(t => t.id === ticketId);
    if (ticket) {
      openTicketDetail(ticket);
    }
  }
};

onMounted(async () => {
  await loadTickets();
  checkRouteParams();
});

// Watch for route changes to handle navigation between tickets/searches
watch(() => route.query, () => {
  checkRouteParams();
}, { deep: true });
</script>

<style scoped>
.maintenance-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Breadcrumbs (Handled by component) */


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group, .sort-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-icon { color: #64748b; }
.label { font-size: 0.875rem; color: #64748b; font-weight: 500; }

.filter-select, .filter-input {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  background-color: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.filter-input {
  cursor: text;
  min-width: 250px;
}

.filter-select:focus, .filter-input:focus {
  border-color: var(--save-color);
  box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.1);
}

/* Btn & Kanban Styles */
.btn-primary {
  background: var(--save-color);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 200, 83, 0.2);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--save-color-hover);
  transform: translateY(-1px);
}


.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
  min-height: calc(100vh - 300px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--save-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: 1fr;
    overflow-x: auto;
  }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-group, .sort-group { flex-wrap: wrap; }
}
</style>
