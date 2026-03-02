<template>
  <div 
    class="maintenance-card" 
    :class="'priority-' + ticket.priority"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="card-header">
      <span class="ticket-id">{{ ticket.id }}</span>
      <span class="priority-badge" :class="ticket.priority">
        {{ getPriorityLabel(ticket.priority) }}
      </span>
    </div>
    
    <h3 class="ticket-subject">{{ ticket.subject }}</h3>
    
    <div class="ticket-meta">
      <div class="meta-row">
        <span class="material-icons icon-tiny">domain</span>
        <span class="property-name">{{ ticket.propertyName }}</span>
      </div>
      <div class="meta-row">
        <span class="material-icons icon-tiny">schedule</span>
        <span class="date">{{ formatDate(ticket.createdAt) }}</span>
      </div>
      <div v-if="ticket.dueDate" class="meta-row" :class="{ 'overdue': isOverdue }">
        <span class="material-icons icon-tiny">{{ isOverdue ? 'warning' : 'event' }}</span>
        <span class="date-due">Termín: {{ formatDate(ticket.dueDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  }
});

const isOverdue = computed(() => {
  if (!props.ticket.dueDate) return false;
  const due = new Date(props.ticket.dueDate);
  const now = new Date();
  return due < now && props.ticket.status !== 'done';
});

const getPriorityLabel = (priority) => {
  const map = {
    low: 'Nízká',
    medium: 'Střední',
    high: 'Vysoká',
    critical: 'Kritická'
  };
  return map[priority] || priority;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('cs-CZ');
};

const onDragStart = (event) => {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', props.ticket.id);
  // Optional: add visual feedback or data
};
</script>

<style scoped>
.maintenance-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.maintenance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

/* Priority Borders */
.maintenance-card.priority-low { border-left-color: #10B981; }
.maintenance-card.priority-medium { border-left-color: #F59E0B; }
.maintenance-card.priority-high { border-left-color: #EF4444; }
.maintenance-card.priority-critical { border-left-color: #7F1D1D; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ticket-id {
  font-size: 0.75rem;
  color: #94A3B8;
  font-weight: 500;
}

.priority-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Priority Badge Colors */
.priority-badge.low { background: #ECFDF5; color: #047857; }
.priority-badge.medium { background: #FFFBEB; color: #B45309; }
.priority-badge.high { background: #FEF2F2; color: #B91C1C; }
.priority-badge.critical { background: #450a0a; color: white; }

.ticket-subject {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.ticket-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748B;
}

.icon-tiny {
  font-size: 14px;
  font-size: 14px;
  color: #94A3B8;
}

.overdue {
  color: #ef4444;
  font-weight: 600;
}

.overdue .icon-tiny {
  color: #ef4444;
}
</style>
