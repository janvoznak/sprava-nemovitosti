<template>
  <div class="budget-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Finance', to: '/finance' },
      { label: 'Rozpočet' }
    ]" />

    <div class="header-section">
      <div>
        <h1 class="page-title">Rozpočet a Plánování</h1>
        <p class="subtitle">Přehled čerpání rozpočtu pro rok {{ year }}</p>
      </div>
      <div class="controls">
       <div class="toggle-group">
          <button class="toggle-btn" :class="{ active: mode === 'properties' }" @click="mode = 'properties'">Nemovitosti</button>
          <button class="toggle-btn" :class="{ active: mode === 'categories' }" @click="mode = 'categories'">Kategorie</button>
        </div>
        <button class="btn-primary" @click="showInfo('Úprava rozpočtového plánu není v prototypu dostupná')">
          <span class="material-icons">edit</span> Upravit plán
        </button>
      </div>
    </div>

    <!-- KPI Totals -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Celkový rozpočet (YTD)</span>
        <span class="kpi-value">{{ formatCurrency(totalBudget) }}</span>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: spentPercent + '%' }"></div>
        </div>
        <span class="kpi-sub">Vyčerpáno {{ spentPercent }} % z ročního plánu</span>
      </div>
      
      <div class="kpi-card">
        <span class="kpi-label">Očekávané příjmy</span>
        <span class="kpi-value positive">{{ formatCurrency(expectedIncome) }}</span>
        <span class="trend up">
          <span class="material-icons">trending_up</span> +5.2% vs {{ year - 1 }}
        </span>
      </div>

       <div class="kpi-card">
        <span class="kpi-label">ROI (Návratnost)</span>
        <span class="kpi-value">6.8%</span>
         <span class="trend">Průměr za portfolio</span>
      </div>
    </div>

    <!-- Budget Lines -->
    <div class="content-card">
      <div class="card-header">
        <h3>{{ mode === 'properties' ? 'Čerpání rozpočtu dle nemovitostí' : 'Čerpání rozpočtu dle kategorií' }}</h3>
      </div>
      
      <div class="budget-list">
        <div v-for="item in visibleItems" :key="item.id" class="budget-item">
          <div class="item-info">
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.sub }}</span>
            </div>
          </div>
          
          <div class="budget-progress">
             <div class="progress-labels">
              <span>{{ formatCurrency(item.spent) }}</span>
              <span class="muted">z {{ formatCurrency(item.budget) }}</span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :class="getProgressColor(item.percentage)"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>

          <div class="percentage-badge" :class="getProgressColor(item.percentage)">
            {{ item.percentage }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { propertyService } from '@/services/propertyService';
import { useNotification } from '@/composables/useNotification';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';

const year = new Date().getFullYear();
const mode = ref('properties');
const { showInfo } = useNotification();

const properties = ref([]);
onMounted(async () => {
  properties.value = await propertyService.getProperties();
});

const unitsLabel = (n) => `${n} ${n === 1 ? 'jednotka' : n >= 2 && n <= 4 ? 'jednotky' : 'jednotek'}`;
const pctFor = (i) => [75, 30, 94, 42, 58, 66, 81, 23][i % 8];

// Property budget = yearly service + repair budget; spent is a deterministic share of it
const propertyItems = computed(() =>
  properties.value.slice(0, 6).map((p, i) => {
    const budget = Math.round(((p.econ_services || 0) + (p.econ_repairs || 0)) * 12 / 1000) * 1000;
    const percentage = pctFor(i);
    return {
      id: p.id,
      name: p.name,
      sub: unitsLabel((p.units || []).length),
      budget,
      spent: Math.round(budget * percentage / 100),
      percentage,
      icon: ['apartment', 'home', 'store', 'holiday_village'][i % 4]
    };
  })
);

const categoryItems = computed(() => {
  const total = propertyItems.value.reduce((sum, i) => sum + i.budget, 0);
  const cats = [
    { name: 'Energie a služby', icon: 'bolt', share: 0.4, percentage: 68 },
    { name: 'Opravy a údržba', icon: 'build', share: 0.3, percentage: 85 },
    { name: 'Správa a administrativa', icon: 'badge', share: 0.2, percentage: 47 },
    { name: 'Pojištění a daně', icon: 'shield', share: 0.1, percentage: 92 }
  ];
  return cats.map((c, i) => {
    const budget = Math.round(total * c.share / 1000) * 1000;
    return { id: i, name: c.name, sub: `${Math.round(c.share * 100)} % rozpočtu`, budget, spent: Math.round(budget * c.percentage / 100), percentage: c.percentage, icon: c.icon };
  });
});

const totalBudget = computed(() => propertyItems.value.reduce((sum, i) => sum + i.budget, 0));
const totalSpent = computed(() => propertyItems.value.reduce((sum, i) => sum + i.spent, 0));
const spentPercent = computed(() => (totalBudget.value ? Math.round((totalSpent.value / totalBudget.value) * 100) : 0));
const expectedIncome = computed(() => properties.value.reduce((sum, p) => sum + (p.econ_rent || 0), 0) * 12);

const visibleItems = computed(() => (mode.value === 'properties' ? propertyItems.value : categoryItems.value));

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
};

const getProgressColor = (percent) => {
  if (percent > 90) return 'danger';
  if (percent > 70) return 'warning';
  return 'success';
};
</script>

<style scoped>
.budget-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  margin-top: 0.25rem;
}

.controls {
  display: flex;
  gap: 1rem;
}

.toggle-group {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  display: flex;
}

.toggle-btn {
  background: transparent;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
}

.toggle-btn.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}
.kpi-value.positive { color: #16a34a; }

.kpi-sub {
  font-size: 0.875rem;
  color: #64748b;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}
.trend.up { color: #16a34a; }

/* Progress Bar in KPI */
.progress-container {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
}

/* Budget List */
.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #0f172a;
}

.budget-list {
  padding: 0.5rem 0;
}

.budget-item {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f8fafc;
}

.budget-item:last-child { border-bottom: none; }

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 250px;
}

.item-icon {
  width: 40px; 
  height: 40px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Material Icons';
  font-size: 20px;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name { font-weight: 600; color: #0f172a; }
.item-sub { font-size: 0.85rem; color: #64748b; }

.budget-progress {
  flex: 1;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
}
.progress-fill.success { background: #22c55e; }
.progress-fill.warning { background: #f59e0b; }
.progress-fill.danger { background: #ef4444; }

.percentage-badge {
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 48px;
  text-align: right;
}
.percentage-badge.success { color: #16a34a; }
.percentage-badge.warning { color: #d97706; }
.percentage-badge.danger { color: #dc2626; }

@media (max-width: 768px) {
  .budget-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .item-info, .budget-progress { width: 100%; }
}
</style>
