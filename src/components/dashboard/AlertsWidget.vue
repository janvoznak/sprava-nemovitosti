<template>
  <div class="alerts-widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <span class="material-icons warning-icon">warning</span>
        Upozornění
      </h3>
      <span class="badge-count" v-if="alerts.length > 0">{{ alerts.length }}</span>
    </div>

    <div class="alerts-list">
      <div v-if="alerts.length === 0" class="empty-state">
        <span class="material-icons check-icon">check_circle</span>
        <p>Vše v pořádku</p>
      </div>

      <div 
        v-for="alert in alerts" 
        :key="alert.id" 
        class="alert-item interactive"
        :class="alert.severity"
        @click="handleAlertClick(alert)"
      >
        <div class="alert-icon">
          <span class="material-icons">{{ alert.icon }}</span>
        </div>
        <div class="alert-content">
          <div class="alert-title">
            {{ alert.title }}
            <span class="material-icons arrow-icon">arrow_forward</span>
          </div>
          <div class="alert-desc">{{ alert.description }}</div>
        </div>
        <div class="alert-time">{{ alert.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  properties: {
    type: Array,
    required: true
  }
});

const alerts = computed(() => {
  const list = [];

  props.properties.forEach(p => {
    // Debt Alerts
    if (p.hasDebt) {
      list.push({
        id: `debt-${p.id}`,
        severity: 'critical',
        icon: 'payments',
        title: `Dluh ${p.debtAmount ? p.debtAmount.toLocaleString() + ' Kč' : ''}`,
        description: `${p.name} - ${p.landlord || 'Nájemník'}`,
        time: 'Splatné',
        route: { name: 'PropertyDetail', params: { id: p.id }, query: { tab: 'finance' } }
      });
    }

    // Revision Alerts (Mock logic based on revisionStatus)
    if (p.revisionStatus && (p.revisionStatus.expiring || p.revisionStatus.expired)) {
       const isExpired = p.revisionStatus.expired;
       list.push({
         id: `rev-${p.id}`,
         severity: isExpired ? 'critical' : 'warning',
         icon: 'build',
         title: isExpired ? 'Propadlá revize' : 'Končící revize',
         description: `${p.name} - ${isExpired ? 'Plyn' : 'Elektřina'}`,
         time: isExpired ? 'Ihned' : '7 dní',
         route: { name: 'PropertyDetail', params: { id: p.id }, query: { tab: 'technical' } }
       });
    }
    
    // Contract Expiration (Mock based on status or random for demo)
    if (p.name.includes('Vinohradská')) { // Hardcoded for demo match
         list.push({
         id: `contr-${p.id}`,
         severity: 'warning',
         icon: 'description',
         title: 'Smlouva končí',
         description: `${p.name} - Novák`,
         time: '30 dní',
         route: { name: 'PropertyDetail', params: { id: p.id }, query: { tab: 'tenants' } }
       });
    }
  });

  return list.slice(0, 5); // Limit to 5 alerts
});

const handleAlertClick = (alert) => {
  if (alert.route) {
    router.push(alert.route);
  }
};
</script>

<style scoped>
.alerts-widget {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin: 0;
}

.warning-icon { 
  color: #94a3b8; 
  font-size: 1.25rem;
}

.badge-count {
  background: #fee2e2;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 99px;
}

.alerts-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: #f8fafc;
  transition: all 0.2s;
}

.alert-item.interactive {
  cursor: pointer;
}

.alert-item:hover {
  transform: translateX(4px);
  background: #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.alert-item.critical {
  border-left-color: #ef4444;
  background: #fef2f2;
}
.alert-item.critical:hover { background: #fee2e2; }

.alert-item.critical .alert-icon {
  color: #ef4444;
  background: white;
}

.alert-item.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}
.alert-item.warning:hover { background: #fef3c7; }

.alert-item.warning .alert-icon {
  color: #f59e0b;
  background: white;
}

.alert-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon .material-icons { font-size: 18px; }

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow-icon {
  font-size: 14px;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s;
  color: #3b82f6;
}

.alert-item:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
}

.alert-desc {
  font-size: 0.8rem;
  color: #64748b;
}

.alert-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #10b981;
  gap: 0.5rem;
}

.check-icon { font-size: 48px; }
</style>
