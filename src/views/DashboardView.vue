<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
       <h1>Přehled</h1>
      <div class="header-actions">
        <button 
          @click="toggleEditMode" 
          class="action-btn" 
          :class="{ active: isEditMode }"
          :title="isEditMode ? 'Ukončit úpravy' : 'Upravit rozložení'"
        >
          <span class="material-icons">{{ isEditMode ? 'check' : 'edit' }}</span>
          {{ isEditMode ? 'Hotovo' : 'Upravit' }}
        </button>
        <button @click="resetLayout" class="reset-btn" title="Obnovit výchozí rozložení">
          <span class="material-icons">restart_alt</span>
          Obnovit
        </button>
      </div>
    </div>


    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Načítání dat...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <div class="dashboard-grid-container">
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :responsive="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          class="grid-item-container"
        >
          <div class="widget-controls" v-if="isEditMode">
            <button @click="removeWidget(item.i)" class="remove-btn" title="Odstranit widget">
              <span class="material-icons">close</span>
            </button>
          </div>


          <!-- 1. Morning Briefing -->
          <div v-if="item.i === 'briefing'" class="briefing-card h-full">
            <div class="briefing-header">
              <div class="greeting">
                <span class="material-icons sun-icon">wb_sunny</span>
                <h2>{{ greeting }}, Jan</h2>
              </div>
              <span class="date-badge-simple">{{ currentDateFormatted }}</span>
            </div>
            <div class="briefing-content">
              <p class="briefing-subtitle">Dnes vyžadují vaši pozornost <span class="highlight">{{ criticalIssuesCount }}</span> věci:</p>
              <div class="action-items">
                <div v-if="debtorsCount > 0" class="action-item red">
                  <span class="material-icons">payments</span>
                  <span>{{ debtorsCount }}x Nezaplacené nájemné ({{ formatCurrency(totalDebt) }})</span>
                  <button class="action-link" @click="$router.push({ name: 'PropertyList', query: { filter: 'debt' } })">Řešit</button>
                </div>
                <div v-if="expiredRevisionsCount > 0" class="action-item orange">
                  <span class="material-icons">warning</span>
                  <span>{{ expiredRevisionsCount }}x Expirovaná revize</span>
                  <button class="action-link" @click="$router.push({ name: 'PropertyList', query: { filter: 'issue' } })">Detail</button>
                </div>
                <div v-if="vacantUnitsCount > 0" class="action-item blue">
                  <span class="material-icons">meeting_room</span>
                  <span>{{ vacantUnitsCount }}x Volná jednotka k obsazení</span>
                   <button class="action-link" @click="$router.push({ name: 'PropertyList', query: { filter: 'vacant' } })">Zobrazit</button>
                </div>
                <div v-if="criticalIssuesCount === 0" class="action-item green">
                  <span class="material-icons">check_circle</span>
                  <span>Vše vypadá skvěle! Žádné urgentní úkoly.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Alerts Widget -->
          <div v-else-if="item.i === 'alerts'" class="alerts-section h-full">
            <AlertsWidget :properties="properties" class="h-full" />
          </div>

          <!-- 3. Revenue KPI -->
          <div v-else-if="item.i === 'kpi-revenue'" class="kpi-card h-full">
            <div class="kpi-top">
              <div class="kpi-label">MĚSÍČNÍ VÝNOS</div>
              <div class="kpi-icon-box green">
                <span class="material-icons">trending_up</span>
              </div>
            </div>
            <div class="kpi-value">{{ formatCurrency(monthlyRevenue) }}</div>
            <div class="kpi-micro-chart">
               <svg viewBox="0 0 100 20" class="sparkline">
                  <path :d="revenueSparklinePath" fill="none" stroke="#10b981" stroke-width="2" />
               </svg>
            </div>
            <div class="kpi-badge" :class="revenueTrend >= 0 ? 'green' : 'red'">
              <span class="material-icons" style="font-size: 14px; margin-right: 2px">
                {{ revenueTrend >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              {{ Math.abs(revenueTrend).toFixed(1) }}% vs minulý měsíc
            </div>
          </div>

          <!-- 4. Debtors KPI -->
          <div v-else-if="item.i === 'kpi-debtors'" class="kpi-card h-full">
            <div class="kpi-top">
              <div class="kpi-label">DLUŽNÍCI</div>
              <div class="kpi-icon-box red">
                 <span class="material-icons">money_off</span>
              </div>
            </div>
            <div class="kpi-value">{{ debtorsCount }}</div>
            <div class="kpi-subtext">{{ formatCurrency(totalDebt) }} dluh</div>
          </div>

          <!-- 5. Occupancy KPI -->
          <div v-else-if="item.i === 'kpi-occupancy'" class="kpi-card interactive h-full" @click="$router.push({ name: 'PropertyList', query: { filter: 'vacant' } })">
            <div class="kpi-top">
              <div class="kpi-label">OBSAZENOST</div>
              <div class="kpi-icon-box blue">
                <span class="material-icons">person</span>
              </div>
            </div>
            <div class="kpi-value">{{ occupancyRate }}%</div>
             <div class="kpi-subtext">{{ vacantUnitsCount }} volných jednotek <span class="action-hint">➜</span></div>
          </div>

          <!-- 6. Expenses KPI (Mock) -->
          <div v-else-if="item.i === 'kpi-expenses'" class="kpi-card h-full">
            <div class="kpi-top">
              <div class="kpi-label">VÝDAJE (MĚSÍC)</div>
              <div class="kpi-icon-box orange">
                <span class="material-icons">shopping_bag</span>
              </div>
            </div>
            <div class="kpi-value">{{ formatCurrency(monthlyRevenue * 0.3) }}</div>
            <div class="kpi-subtext">Odhadované</div>
          </div>

          <!-- 7. Calendar -->
          <div v-else-if="item.i === 'calendar'" class="calendar-section h-full">
             <div class="section-header">
               <h3>
                 <span class="material-icons">calendar_today</span>
                 Kalendář - Únor
               </h3>
             </div>
             <div class="calendar-list">
               <div 
                 class="calendar-item interactive"
                 @click="$router.push({ path: '/maintenance/calendar', query: { date: `${new Date().getFullYear()}-02-15` } })"
               >
                 <div class="date-badge">15.2.</div>
                 <div class="event-details">
                   <div class="event-title">Splatnost nájemného</div>
                   <div class="event-desc">Automatická kontrola (12 bytů)</div>
                 </div>
               </div>
               <div 
                 class="calendar-item interactive"
                 @click="$router.push({ path: '/maintenance/calendar', query: { date: `${new Date().getFullYear()}-02-20` } })"
               >
                 <div class="date-badge warning">20.2.</div>
                 <div class="event-details">
                   <div class="event-title">Revize plynu</div>
                   <div class="event-desc">Václavské nám. 42</div>
                 </div>
               </div>
               <div 
                 class="calendar-item interactive"
                 @click="$router.push({ path: '/maintenance/calendar', query: { date: `${new Date().getFullYear()}-02-25` } })"
               >
                 <div class="date-badge">25.2.</div>
                 <div class="event-details">
                   <div class="event-title">Konec smlouvy</div>
                   <div class="event-desc">Byt 301 - Kovář</div>
                 </div>
               </div>
             </div>
          </div>


          <!-- 8. Chart -->
          <div v-else-if="item.i === 'chart'" class="chart-section compact h-full">
            <div class="chart-header-compact">
              <div class="chart-title-group">
                <h3>
                  <span class="material-icons">bar_chart</span>
                  Cash Flow (6 měsíců)
                </h3>
              </div>
            </div>
            <div class="chart-content compact-content">
               <div class="chart-bars">
                <div 
                  v-for="(month, index) in revenueData" 
                  :key="index"
                  class="bar-wrapper"
                >
                  <div class="bar-column">
                    <div 
                      class="bar" 
                      :style="{ height: getBarHeight(month.value) + '%' }"
                      :title="formatCurrency(month.value)"
                    ></div>
                  </div>
                  <div class="bar-label">{{ month.month.substring(0,3) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- NEW WIDGETS -->
          <div v-else-if="item.i === 'quick-actions'" class="h-full">
            <QuickActionsWidget class="h-full" />
          </div>

          <div v-else-if="item.i === 'lease-expirations'" class="h-full">
            <LeaseExpirationsWidget :properties="properties" class="h-full" />
          </div>

          <div v-else-if="item.i === 'debt-alerts'" class="h-full">
            <DebtAlertWidget class="h-full" />
          </div>

          <div v-else-if="item.i === 'top-debtors'" class="h-full">
            <TopDebtorsWidget :properties="properties" class="h-full" />
          </div>

          <div v-else-if="item.i === 'occupancy-chart'" class="h-full">
            <OccupancyChartWidget :properties="properties" class="h-full" />
          </div>

          <div v-else-if="item.i === 'maintenance-overview'" class="h-full">
            <MaintenanceOverviewWidget class="h-full" />
          </div>
        </GridItem>
      </GridLayout>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { propertyService } from '@/services/propertyService'
import AlertsWidget from '@/components/dashboard/AlertsWidget.vue'
import DebtAlertWidget from '@/components/dashboard/DebtAlertWidget.vue'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget.vue'
import LeaseExpirationsWidget from '@/components/dashboard/LeaseExpirationsWidget.vue'
import TopDebtorsWidget from '@/components/dashboard/TopDebtorsWidget.vue'
import OccupancyChartWidget from '@/components/dashboard/OccupancyChartWidget.vue'
import MaintenanceOverviewWidget from '@/components/dashboard/MaintenanceOverviewWidget.vue'
import { GridLayout, GridItem } from 'grid-layout-plus'

const properties = ref([])
const loading = ref(true)
const isEditMode = ref(false)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}


// Initial Layout Configuration
const STORAGE_KEY = 'dashboard-layout-v2'

const defaultLayout = [
  // Row 1: Briefing
  { x: 0, y: 0, w: 12, h: 5, i: 'briefing' },
  
  // Row 2: KPIs & Chart
  { x: 0, y: 5, w: 4, h: 4, i: 'kpi-revenue' },
  { x: 4, y: 5, w: 4, h: 4, i: 'kpi-expenses' },
  { x: 8, y: 5, w: 4, h: 7, i: 'occupancy-chart' },
  
  // Row 3: Lists & Calendar
  { x: 0, y: 9, w: 4, h: 8, i: 'lease-expirations' },
  { x: 4, y: 9, w: 4, h: 8, i: 'calendar' },
  { x: 8, y: 12, w: 4, h: 5, i: 'quick-actions' },
  
  // Row 4: Bottom Lists
  { x: 0, y: 17, w: 4, h: 10, i: 'debt-alerts' },
  { x: 4, y: 17, w: 4, h: 10, i: 'maintenance-overview' },
  { x: 8, y: 17, w: 4, h: 10, i: 'top-debtors' },
]

const getSavedLayout = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Migration: Check if v2 specific widgets exist (like maintenance-overview positioned at specific place or just exist)
      // Since we bumped version to v2, we generally expect correct layout. 
      // But if we want to be safe or if user had v1, the key change forces reset anyway.
      // So simple parsing is enough if key is distinct.
      return parsed
    } catch (e) {
      console.error('Failed to parse saved layout', e)
    }
  }
  return defaultLayout
}

const layout = ref(getSavedLayout())

watch(layout, (newLayout) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout))
}, { deep: true })

const removeWidget = (id) => {
  const index = layout.value.findIndex(item => item.i === id)
  if (index !== -1) {
    layout.value.splice(index, 1)
  }
}

const resetLayout = () => {
  if (confirm('Opravdu chcete obnovit výchozí rozložení dashboardu?')) {
    layout.value = JSON.parse(JSON.stringify(defaultLayout))
  }
}

const currentDateFormatted = computed(() => {
  return new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Dobré ráno'
  if (hour < 18) return 'Dobré odpoledne'
  return 'Dobrý večer'
})

const expiredRevisionsCount = computed(() => {
  return properties.value.filter(p => p.revisionStatus && p.revisionStatus.expired).length
})

const criticalIssuesCount = computed(() => {
  return debtorsCount.value + expiredRevisionsCount.value + vacantUnitsCount.value
})

// Load properties data
onMounted(async () => {
  try {
    const data = await propertyService.getProperties()
    properties.value = data
  } catch (error) {
    console.error('Failed to load properties:', error)
  } finally {
    loading.value = false
  }
})

// KPI: Total Portfolio Value (estimate based on rent * multiplier)
const totalPortfolioValue = computed(() => {
  return properties.value.reduce((sum, prop) => {
    const monthlyRent = prop.econ_rent || 0
    return sum + (monthlyRent * 200)
  }, 0)
})

// KPI: Vacant Units Count
const vacantUnitsCount = computed(() => {
  return properties.value.reduce((sum, prop) => {
    if (prop.units) {
      return sum + prop.units.filter(u => u.status === 'Volné').length
    }
    return sum + (prop.isOccupied ? 0 : 1)
  }, 0)
})

const totalUnits = computed(() => {
  return properties.value.reduce((sum, prop) => {
    if (prop.units) {
      return sum + prop.units.length
    }
    return sum + 1
  }, 0)
})

// KPI: Monthly Revenue (from all occupied units)
const monthlyRevenue = computed(() => {
  return properties.value.reduce((sum, prop) => {
    // Try to use typed econ_rent first
    if (prop.econ_rent) return sum + prop.econ_rent
    
    // Fallback to parsing rent string (e.g. "15 000 Kč")
    if (prop.rent) {
      const parsed = parseInt(prop.rent.replace(/\D/g, ''))
      return sum + (isNaN(parsed) ? 0 : parsed)
    }
    
    return sum
  }, 0)
})

// KPI: Occupancy Rate
const occupancyRate = computed(() => {
  if (properties.value.length === 0) return 0
  
  const totalPercentage = properties.value.reduce((sum, prop) => {
    return sum + (prop.occupancyPercentage || 0)
  }, 0)
  
  return Math.round(totalPercentage / properties.value.length)
})

// KPI: Debtors
const debtorsCount = computed(() => {
  return properties.value.filter(p => p.hasDebt).length
})

const totalDebt = computed(() => {
  return properties.value.reduce((sum, prop) => {
    return sum + (prop.debtAmount || 0)
  }, 0)
})

// Quick Stats
const activePropertiesCount = computed(() => {
  return properties.value.filter(p => p.status === 'Aktivní').length
})

const reconstructionCount = computed(() => {
  return properties.value.filter(p => p.status === 'Rekonstrukce').length
})

const averageRent = computed(() => {
  if (properties.value.length === 0) return 0
  const total = properties.value.reduce((sum, p) => sum + (p.econ_rent || 0), 0)
  return total / properties.value.length
})

// Chart Data: Mock revenue data for last 6 months
const revenueData = computed(() => {
  const monthly = monthlyRevenue.value
  const months = ['Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec', 'Leden']
  // Generate a slightly more realistic trend (e.g. mostly up)
  return months.map((month, i) => ({
    month,
    value: monthly * (0.85 + (i * 0.02) + Math.random() * 0.1)
  }))
})

const currentRevenueValue = computed(() => {
  if (revenueData.value.length === 0) return 0
  return revenueData.value[revenueData.value.length - 1].value
})

const revenueTrend = computed(() => {
  if (revenueData.value.length < 2) return 0
  const current = revenueData.value[revenueData.value.length - 1].value
  const previous = revenueData.value[revenueData.value.length - 2].value
  return ((current - previous) / previous) * 100
})

const maxRevenue = computed(() => {
  return Math.max(...revenueData.value.map(d => d.value)) || 1
})

const averageRevenue = computed(() => {
  const total = revenueData.value.reduce((sum, d) => sum + d.value, 0)
  return total / (revenueData.value.length || 1)
})

const totalRevenue = computed(() => {
  return revenueData.value.reduce((sum, d) => sum + d.value, 0)
})

// Helpers
const getBarHeight = (value) => {
  return (value / maxRevenue.value) * 100 * 0.8 // Scale to 80% max height
}

const revenueSparklinePath = computed(() => {
  if (revenueData.value.length === 0) return ''
  const data = revenueData.value.map(d => d.value)
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 20 - ((val - min) / range) * 20 
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
})

const formatCurrency = (value, simplify = false) => {
  if (simplify && value > 1000000) {
    return (value / 1000000).toFixed(1).replace('.', ',') + ' mil. Kč'
  }
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  /* Ensure container doesn't overflow or scroll weirdly */
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.header-actions {

  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.action-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.action-btn.active:hover {
  background: #1d4ed8;
}

.action-btn .material-icons {
  font-size: 1.1rem;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.reset-btn .material-icons {
  font-size: 1.1rem;
}


.dashboard-grid-container {
  width: 100%;
  /* grid-layout-plus needs relative positioning context often, though it handles styles itself. 
     Just ensuring it has space */
}

/* Common Height Util */
.h-full {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Morning Briefing */
.briefing-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Slight elevation */
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(to right, #ffffff, #f8fafc);
  overflow: hidden;
}

.briefing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.greeting h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 700;
}

.sun-icon {
  color: #f59e0b;
  font-size: 1.75rem;
}

.date-badge-simple {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  text-transform: capitalize;
}

.briefing-subtitle {
  font-size: 1rem;
  color: #475569;
  margin: 0;
}

.briefing-subtitle .highlight {
  font-weight: 700;
  color: #0f172a;
}

.action-items {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  overflow-y: auto; /* Allow scrolling if too many items */
}

/* Reuse existing action-item styles */
.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid transparent;
}
.action-item.red { background: #FEF2F2; color: #991B1B; border-color: #FECACA; }
.action-item.orange { background: #FFF7ED; color: #9A3412; border-color: #FED7AA; }
.action-item.blue { background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE; }
.action-item.green { background: #F0FDF4; color: #166534; border-color: #BBF7D0; width: 100%; justify-content: center; }

.action-link {
  background: white;
  border: 1px solid currentColor;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.8;
  color: inherit;
  margin-left: auto;
}
.action-link:hover { opacity: 1; }

/* Alerts Section */
.alerts-section {
  width: 100%;
}

/* KPI Cards */
.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.kpi-card.interactive {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.action-hint {
  opacity: 0;
  transition: opacity 0.2s;
  margin-left: 4px;
  color: #3b82f6;
}

.kpi-card.interactive:hover .action-hint {
  opacity: 1;
}

.kpi-micro-chart {
  height: 24px;
  margin-top: 4px;
  margin-bottom: 4px;
  flex-grow: 1; 
  /* Push content apart if needed, or rely on fixed height */
}

.sparkline {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.kpi-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
}

.kpi-icon-box.green { background: #DCFCE7; color: #166534; }
.kpi-icon-box.red { background: #FEE2E2; color: #991B1B; }
.kpi-icon-box.blue { background: #DBEAFE; color: #1E40AF; }
.kpi-icon-box.orange { background: #FFEDD5; color: #9A3412; }

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.kpi-subtext {
  font-size: 0.8rem;
  color: #64748b;
}

.kpi-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}
.kpi-badge.green { background: #DCFCE7; color: #166534; }
.kpi-badge.red { background: #FEE2E2; color: #991B1B; }

/* Calendar */
.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.section-header h3,
.chart-title-group h3 {
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

.section-header h3 .material-icons,
.chart-title-group h3 .material-icons {
  font-size: 1.25rem;
  color: #94a3b8;
}

.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
}

.calendar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s;
}

.calendar-item.interactive {
  cursor: pointer;
}

.calendar-item.interactive:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.date-badge {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: center;
}
.date-badge.warning { background: #fff7ed; color: #ea580c; }

.event-title {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}

.event-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* Compact Chart */
.chart-section.compact {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.chart-content.compact-content {
  flex: 1;
  position: relative;
  min-height: 0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding-bottom: 1.5rem;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-column {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
}

.bar {
  width: 60%;
  background: #cbd5e1;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}
.bar:hover { background: #94a3b8; }

.bar-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Grid Item Container Helper */
/* This is important for the library to handle spacing correctly if not using margin in items */
.grid-item-container {
  touch-action: none; /* Recommended for drag and drop */
  position: relative;
}

.grid-item-container:hover .widget-controls {
  opacity: 1;
}

.widget-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.remove-btn .material-icons {
  font-size: 14px;
}
</style>
