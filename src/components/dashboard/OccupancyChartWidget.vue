<template>
  <div class="occupancy-chart-widget h-full">
    <div class="widget-header">
      <h3>
        <span class="material-icons">pie_chart</span>
        Obsazenost
      </h3>
    </div>
    
    <div class="chart-container">
      <div class="pie-chart" :style="pieStyle">
        <div class="pie-center">
          <span class="center-value">{{ occupancyRate }}%</span>
          <span class="center-label">Obsazeno</span>
        </div>
      </div>
      
      <div class="legend">
        <div class="legend-item">
          <span class="dot occupied"></span>
          <span class="label">Pronajato ({{ stats.occupied }})</span>
        </div>
        <div class="legend-item">
          <span class="dot vacant"></span>
          <span class="label">Volné ({{ stats.vacant }})</span>
        </div>
        <!-- <div class="legend-item">
          <span class="dot maintenance"></span>
          <span class="label">Opravy ({{ stats.maintenance }})</span>
        </div> -->
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

const stats = computed(() => {
  let occupied = 0
  let vacant = 0
  let maintenance = 0 // Maintenance usually a separate status on property level or unit level
  
  props.properties.forEach(prop => {
    if (prop.units) {
      prop.units.forEach(u => {
        if (u.status === 'Pronajato') occupied++
        else if (u.status === 'Volné') vacant++
        else maintenance++
      })
    } else {
      if (prop.isOccupied) occupied++
      else vacant++
    }
  })
  
  return { occupied, vacant, maintenance }
})

const totalUnits = computed(() => stats.value.occupied + stats.value.vacant + stats.value.maintenance)

const occupancyRate = computed(() => {
  if (totalUnits.value === 0) return 0
  return Math.round((stats.value.occupied / totalUnits.value) * 100)
})

const pieStyle = computed(() => {
  // Simple CSS conic gradient for pie chart
  const occupiedDeg = (stats.value.occupied / totalUnits.value) * 360
  const vacantDeg = (stats.value.vacant / totalUnits.value) * 360
  
  return {
    background: `conic-gradient(
      #3b82f6 0deg ${occupiedDeg}deg,
      #e2e8f0 ${occupiedDeg}deg 360deg
    )`
  }
})
</script>

<style scoped>
.occupancy-chart-widget {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.widget-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
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

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-center {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.center-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.center-label {
  font-size: 0.7rem;
  color: #64748b;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.occupied { background: #3b82f6; }
.dot.vacant { background: #e2e8f0; }

.label {
  font-size: 0.85rem;
  color: #475569;
}
</style>
