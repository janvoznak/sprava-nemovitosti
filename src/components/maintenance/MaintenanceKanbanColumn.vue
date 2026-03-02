<template>
  <div class="kanban-column">
    <div class="column-header">
      <h3 class="column-title">
        {{ title }}
        <span class="count-badge">{{ tickets.length }}</span>
      </h3>
    </div>
    
    <div 
      class="column-content"
      @dragover.prevent
      @dragenter.prevent
      @drop="onDrop"
    >
      <div v-if="tickets.length === 0" class="empty-placeholder">
        Žádné tikety
      </div>
      
      <div class="ticket-list">
        <MaintenanceCard 
          v-for="ticket in tickets" 
          :key="ticket.id" 
          :ticket="ticket"
          @click="$emit('click-ticket', ticket)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import MaintenanceCard from './MaintenanceCard.vue';

const props = defineProps({
  title: String,
  statusId: String,
  tickets: Array
});

const emit = defineEmits(['click-ticket', 'ticket-moved']);

const onDrop = (event) => {
  const ticketId = event.dataTransfer.getData('text/plain');
  if (ticketId) {
    emit('ticket-moved', { ticketId, newStatus: props.statusId });
  }
};
</script>

<style scoped>
.kanban-column {
  background: #F8FAFC;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  border: 1px solid #E2E8F0;
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid #E2E8F0;
  background: #F1F5F9;
  border-radius: 12px 12px 0 0;
}

.column-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #475569;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.count-badge {
  background: #E2E8F0;
  color: #64748B;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.column-content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-placeholder {
  text-align: center;
  padding: 2rem;
  color: #94A3B8;
  font-size: 0.875rem;
  font-style: italic;
  border: 2px dashed #E2E8F0;
  border-radius: 8px;
}
</style>
