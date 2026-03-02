<template>
  <div class="scoring-container relative group" :class="size">
    <div class="score-badge" :class="[status.color, size]">
      <span class="score-val">{{ score }}</span>
      <span v-if="size === 'large'" class="score-percentage">%</span>
    </div>
    
    <!-- Breakdown Tooltip -->
    <div class="score-tooltip">
      <div class="tooltip-header">Hodnocení nemovitosti</div>
      
      <div class="tooltip-row">
        <span>Obsazenost</span>
        <span class="font-bold">{{ breakdown.occupancy }}/40</span>
      </div>
      <div class="tooltip-bar">
        <div class="bar-fill" :style="{ width: (breakdown.occupancy / 40 * 100) + '%' }"></div>
      </div>

      <div class="tooltip-row">
        <span>Finance</span>
        <span class="font-bold">{{ breakdown.financial }}/30</span>
      </div>
      <div class="tooltip-bar">
        <div class="bar-fill" :style="{ width: (breakdown.financial / 30 * 100) + '%' }"></div>
      </div>

      <div class="tooltip-row">
        <span>Technický stav</span>
        <span class="font-bold">{{ breakdown.technical }}/30</span>
      </div>
      <div class="tooltip-bar">
        <div class="bar-fill" :style="{ width: (breakdown.technical / 30 * 100) + '%' }"></div>
      </div>

      <div class="tooltip-divider"></div>
      <div class="tooltip-row total">
         <span>Celkem</span>
         <span class="total-badge" :class="status.color">{{ score }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { calculatePropertyScore } from '@/utils/propertyScoring';

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'normal', // 'normal' | 'large'
    validator: (val) => ['normal', 'large'].includes(val)
  }
});

const scoringData = computed(() => {
  return calculatePropertyScore(props.property);
});

const score = computed(() => scoringData.value.score);
const status = computed(() => scoringData.value.status);
const breakdown = computed(() => scoringData.value.breakdown);
</script>

<style scoped>
.scoring-container {
  display: inline-flex;
  justify-content: center;
  position: relative;
  cursor: help;
}

/* Badge Styles */
.score-badge {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 2px solid currentColor;
  transition: transform 0.2s;
}

.score-badge.normal {
  width: 36px;
  height: 36px;
  font-size: 0.85rem;
}

.score-badge.large {
  width: 48px;
  height: 48px;
  font-size: 1.1rem;
  border-width: 3px;
}

.score-percentage {
  font-size: 0.7em;
  margin-left: 1px;
}

/* Colors */
.score-badge.green { color: #10b981; background: #ecfdf5; border-color: #10b981; }
.score-badge.amber { color: #f59e0b; background: #fffbeb; border-color: #f59e0b; }
.score-badge.red { color: #ef4444; background: #fef2f2; border-color: #ef4444; }
.total-badge.green { color: #10b981; }
.total-badge.amber { color: #f59e0b; }
.total-badge.red { color: #ef4444; }


/* Tooltip Styles */
.score-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 100%; /* Position below */
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: white;
  color: #0f172a;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  z-index: 100;
  min-width: 200px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.scoring-container:hover .score-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(4px);
}

/* Tooltip Content */
.tooltip-header {
  font-weight: 700;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  color: #334155;
  font-size: 0.85rem;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  color: #64748b;
  font-weight: 500;
}

.tooltip-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
}

.tooltip-row:nth-of-type(3) + .tooltip-bar .bar-fill { background: #3b82f6; } /* Occupancy */
.tooltip-row:nth-of-type(5) + .tooltip-bar .bar-fill { background: #10b981; } /* Finance */
.tooltip-row:nth-of-type(7) + .tooltip-bar .bar-fill { background: #f59e0b; } /* Technical */

.tooltip-row.total {
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 0;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  align-items: center;
}

.total-badge {
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 6px;
}

/* Arrow */
.score-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}

/* Filter blur effect for modern feel behind tooltip (optional/browser support dependent) */
/* .score-tooltip { backdrop-filter: blur(8px); } */
</style>
