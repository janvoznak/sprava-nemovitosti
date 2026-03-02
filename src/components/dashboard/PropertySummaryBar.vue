<template>
  <div class="summary-bar-wrapper">
    <div class="summary-bar">
      <!-- Total Units -->
      <div class="summary-item">
        <div class="item-header">
          <span class="material-icons info-icon">apartment</span>
          <div class="item-label">CELKEM JEDNOTEK</div>
        </div>
        <div class="item-value-wrapper">
          <span class="animated-value">{{ totalUnits }}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Occupancy -->
      <div class="summary-item">
        <div class="item-header">
          <span class="material-icons info-icon">groups</span>
          <div class="item-label">OBSAZENO</div>
        </div>
        <div class="item-value-wrapper">
          <span class="animated-value">{{ occupiedCount }}</span>
          <div class="percentage-pill" :class="getOccupancyClass">
            {{ occupancyPercentage }}%
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Total Rent -->
      <div class="summary-item">
        <div class="item-header">
          <span class="material-icons info-icon">payments</span>
          <div class="item-label">CELKOVÉ NÁJEMNÉ</div>
        </div>
        <div class="item-value-wrapper">
          <span class="animated-value">{{ formatCurrency(totalRent) }}</span>
        </div>
      </div>
      
      <!-- Premium Design: Subtle Background Glow -->
      <div class="glow-sphere orange"></div>
      <div class="glow-sphere blue"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalUnits: {
    type: Number,
    default: 0
  },
  vacantUnits: {
    type: Number,
    default: 0
  },
  totalRent: {
    type: Number,
    default: 0
  }
})

const occupiedCount = computed(() => props.totalUnits - props.vacantUnits)
const occupancyPercentage = computed(() => {
  if (props.totalUnits === 0) return 0
  return Math.round((occupiedCount.value / props.totalUnits) * 100)
})

const getOccupancyClass = computed(() => {
  const p = occupancyPercentage.value
  if (p > 90) return 'high'
  if (p > 70) return 'medium'
  return 'low'
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.summary-bar-wrapper {
  margin: 0.5rem 0 2rem 0;
  width: 100%;
}

.summary-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1rem 2.5rem;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.summary-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
  z-index: 1;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.info-icon {
  font-size: 1rem;
  color: #94a3b8;
}

.item-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.item-value-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.animated-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}

.percentage-pill {
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
}

.percentage-pill.high { background: #dcfce7; color: #166534; }
.percentage-pill.medium { background: #fef9c3; color: #854d0e; }
.percentage-pill.low { background: #fee2e2; color: #991b1b; }

.divider {
  width: 1px;
  height: 36px;
  background: rgba(226, 232, 240, 0.8);
  margin: 0 3.5rem;
}

/* Glow Spheres for Premium Depth */
.glow-sphere {
  position: absolute;
  width: 151px;
  height: 150px;
  filter: blur(60px);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}

.glow-sphere.orange {
  top: -40px;
  right: 15%;
  background: #fbbf24;
}

.glow-sphere.blue {
  bottom: -40px;
  left: 10%;
  background: #3b82f6;
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-item {
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.summary-item:nth-child(1) { animation-delay: 0.1s; }
.summary-item:nth-child(3) { animation-delay: 0.2s; }
.summary-item:nth-child(5) { animation-delay: 0.3s; }

</style>
