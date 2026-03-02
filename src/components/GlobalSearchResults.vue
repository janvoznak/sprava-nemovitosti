<template>
  <div class="search-results-dropdown" v-if="hasResults">
    <!-- Properties -->
    <div v-if="results.properties.length > 0" class="result-section">
      <h4 class="section-title">Nemovitosti ({{ results.properties.length }})</h4>
      <div 
        v-for="prop in results.properties" 
        :key="prop.id" 
        class="result-item"
        @click="$emit('select', { type: 'property', id: prop.id })"
      >
        <div class="icon-circle bg-blue">
          <span class="material-icons">apartment</span>
        </div>
        <div class="item-info">
          <span class="item-title">{{ prop.name }}</span>
          <span class="item-subtitle">{{ prop.address.street }}, {{ prop.address.city }}</span>
        </div>
      </div>
    </div>

    <!-- Tenants -->
    <div v-if="results.tenants.length > 0" class="result-section">
      <h4 class="section-title">Nájemníci ({{ results.tenants.length }})</h4>
      <div 
        v-for="tenant in results.tenants" 
        :key="tenant.email" 
        class="result-item"
        @click="$emit('select', { type: 'tenant', id: tenant.propertyId })"
      >
        <div class="icon-circle bg-green">
          <span class="material-icons">person</span>
        </div>
        <div class="item-info">
          <span class="item-title">{{ tenant.name }}</span>
          <span class="item-subtitle">{{ tenant.propertyName }} ({{ tenant.email }})</span>
        </div>
      </div>
    </div>

    <!-- Tickets -->
    <div v-if="results.tickets.length > 0" class="result-section">
      <h4 class="section-title">Údržba ({{ results.tickets.length }})</h4>
      <div 
        v-for="ticket in results.tickets" 
        :key="ticket.id" 
        class="result-item"
        @click="$emit('select', { type: 'ticket', id: ticket.id })"
      >
        <div class="icon-circle bg-amber">
          <span class="material-icons">build</span>
        </div>
        <div class="item-info">
          <span class="item-title">{{ ticket.subject }}</span>
          <span class="item-subtitle">#{{ ticket.id }} • {{ ticket.status }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="showNoResults" class="search-results-dropdown no-results">
    <p>Žádné výsledky nenalezeny.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ properties: [], tickets: [], tenants: [] })
  },
  showNoResults: Boolean
});

const hasResults = computed(() => {
  return (
    props.results.properties.length > 0 ||
    props.results.tickets.length > 0 ||
    props.results.tenants.length > 0
  );
});
</script>

<style scoped>
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid #e2e8f0;
}

.no-results {
  padding: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.result-section {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.result-section:last-child {
  border-bottom: none;
}

.section-title {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #f8fafc;
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-circle .material-icons {
  font-size: 18px;
}

.bg-blue { background: #3b82f6; }
.bg-green { background: #10b981; }
.bg-amber { background: #f59e0b; }

.item-info {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.item-subtitle {
  font-size: 0.75rem;
  color: #64748b;
}
</style>
