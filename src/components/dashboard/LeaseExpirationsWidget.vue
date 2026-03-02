<template>
  <div class="lease-expirations-widget h-full">
    <div class="widget-header">
      <h3>
        <span class="material-icons">timer</span>
        Expirace smluv (90 dní)
      </h3>
      <button class="view-all" @click="$router.push('/tenants')">Vše</button>
    </div>
    
    <div v-if="expiringTenants.length === 0" class="empty-state">
      <span class="material-icons">event_available</span>
      <p>Žádné končící smlouvy</p>
    </div>
    
    <div v-else class="list-container">
      <div 
        v-for="item in expiringTenants" 
        :key="item.id" 
        class="list-item"
        @click="$router.push(`/tenants/${item.id}`)"
      >
        <div class="item-left">
          <div class="tenant-name">{{ item.tenant }}</div>
          <div class="property-name">{{ item.propertyName }} - {{ item.unitLabel }}</div>
        </div>
        <div class="item-right">
          <div class="days-badge" :class="getUrgencyClass(item.daysLeft)">
            {{ item.daysLeft }} dní
          </div>
          <div class="date-label">{{ item.contractEnd }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  }
})

const expiringTenants = computed(() => {
  const result = []
  const today = new Date()
  
  props.properties.forEach(prop => {
    if (prop.units) {
      prop.units.forEach(unit => {
        if (unit.contractEnd) {
           // Parse date manually expected DD.MM.YYYY
           const parts = unit.contractEnd.split('.')
           if (parts.length === 3) {
             const endDate = new Date(parts[2], parts[1] - 1, parts[0])
             const diffTime = endDate - today
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
             
             if (diffDays >= 0 && diffDays <= 90) {
               result.push({
                 id: unit.id, // Using unit ID as tenant ID for mockup
                 tenant: unit.tenant,
                 propertyName: prop.name,
                 unitLabel: unit.label,
                 contractEnd: unit.contractEnd,
                 daysLeft: diffDays
               })
             }
           }
        }
      })
    }
  })
  
  return result.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5) // Top 5
})

const getUrgencyClass = (days) => {
  if (days <= 30) return 'critical'
  if (days <= 60) return 'warning'
  return 'info'
}
</script>

<style scoped>
.lease-expirations-widget {
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

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
  min-height: 100px;
}

.empty-state .material-icons { font-size: 2rem; }

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f1f5f9;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}

.property-name {
  font-size: 0.8rem;
  color: #64748b;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.days-badge {
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.days-badge.critical { background: #fee2e2; color: #991b1b; }
.days-badge.warning { background: #ffedd5; color: #9a3412; }
.days-badge.info { background: #e0f2fe; color: #075985; }

.date-label {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
