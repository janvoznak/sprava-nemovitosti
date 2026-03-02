<template>
  <div class="alert-item" :class="[`priority-${alert.priority}`, { dismissed: isDismissed }]">
    <div class="alert-indicator"></div>
    
    <div class="alert-icon">
      {{ getIcon(alert.type) }}
    </div>

    <div class="alert-content">
      <div class="alert-header">
        <h4 class="alert-title">{{ alert.title }}</h4>
        <span class="alert-time">{{ formatTime(alert.daysUntil) }}</span>
      </div>
      <p class="alert-description">{{ alert.description }}</p>
      <p class="alert-action" v-if="alert.actionRequired">
        <span class="action-icon">→</span> {{ alert.actionRequired }}
      </p>
    </div>

    <div class="alert-actions">
      <button 
        class="action-btn detail" 
        @click="handleDetail"
        title="Zobrazit detail"
      >
        <span class="material-icons">open_in_new</span>
      </button>
      <button 
        class="action-btn dismiss" 
        @click="handleDismiss"
        title="Označit jako vyřešené"
      >
        ✓
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['dismiss', 'detail'])

const isDismissed = ref(false)

const getIcon = (type) => {
  const icons = {
    revision_expiring: '🔧',
    debt: '💰',
    contract_ending: '📄',
    meter_check: '⚡'
  }
  return icons[type] || '📌'
}

const formatTime = (daysUntil) => {
  if (daysUntil < 0) {
    const absDays = Math.abs(daysUntil)
    if (absDays > 30) {
      const months = Math.floor(absDays / 30)
      return `před ${months} měsíci`
    }
    return `před ${absDays} dny`
  } else if (daysUntil === 0) {
    return 'dnes'
  } else if (daysUntil === 1) {
    return 'zítra'
  } else if (daysUntil <= 7) {
    return `za ${daysUntil} dní`
  } else if (daysUntil <= 30) {
    return `za ${daysUntil} dní`
  } else {
    const months = Math.floor(daysUntil / 30)
    return `za ${months} měsíce`
  }
}

const handleDismiss = async () => {
  isDismissed.value = true
  setTimeout(() => {
    emit('dismiss', props.alert.id)
  }, 300) // Wait for animation
}

const handleDetail = () => {
  emit('detail', props.alert.propertyId)
}
</script>

<style scoped>
.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s;
  overflow: hidden;
}

.alert-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.alert-item.dismissed {
  opacity: 0;
  transform: translateX(100%);
}

/* Priority indicator (left border) */
.alert-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.priority-critical .alert-indicator {
  background: #ef4444;
}

.priority-critical {
  background: linear-gradient(to right, #fef2f2 0%, white 20%);
}

.priority-important .alert-indicator {
  background: #f59e0b;
}

.priority-important {
  background: linear-gradient(to right, #fffbeb 0%, white 20%);
}

.priority-info .alert-indicator {
  background: #3b82f6;
}

.priority-info {
  background: linear-gradient(to right, #eff6ff 0%, white 20%);
}

.alert-icon {
  font-size: 1.75rem;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
}

.alert-content {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.alert-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.alert-time {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  font-weight: 500;
}

.alert-description {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

.alert-action {
  margin: 0;
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-icon {
  font-weight: bold;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn.detail {
  color: #2563eb;
}

.action-btn.detail:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.action-btn.detail .material-icons {
  font-size: 18px;
}

.action-btn.dismiss {
  color: #22c55e;
  font-weight: bold;
  font-size: 1rem;
}

.action-btn.dismiss:hover {
  background: #dcfce7;
  border-color: #22c55e;
}
</style>
