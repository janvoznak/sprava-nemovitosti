<template>
  <div class="finance-dashboard">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Finance' }
    ]" />

    <div class="header-section">
      <h1 class="page-title">Finanční přehled</h1>
      <div class="controls">
        <select class="period-select">
          <option>Tento rok (2025)</option>
          <option>Minulý rok (2024)</option>
        </select>
        <button class="btn-primary">
          <span class="material-icons">download</span> Report
        </button>
      </div>
    </div>

    <!-- Top KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-icon money">
          <span class="material-icons">attach_money</span>
        </div>
        <div class="kpi-content">
          <span class="label">Čistý zisk (YTD)</span>
          <span class="value">1 652 025 Kč</span>
          <span class="trend up">+12.4% vs min. rok</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon income">
          <span class="material-icons">download</span>
        </div>
        <div class="kpi-content">
          <span class="label">Příjmy celkem</span>
          <span class="value">2 145 000 Kč</span>
          <span class="sub">98% úspěšnost výběru</span>
        </div>
      </div>

       <div class="kpi-card">
        <div class="kpi-icon expense">
          <span class="material-icons">upload</span>
        </div>
        <div class="kpi-content">
          <span class="label">Výdaje celkem</span>
          <span class="value">492 975 Kč</span>
          <span class="sub">V rámci rozpočtu</span>
        </div>
      </div>

       <div class="kpi-card">
        <div class="kpi-icon debt">
          <span class="material-icons">warning</span>
        </div>
        <div class="kpi-content">
          <span class="label">Dlužné nájemné</span>
          <span class="value negative">135 057 Kč</span>
          <span class="sub">3 dlužníci</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Cashflow Chart Placeholder -->
      <div class="chart-card main-chart">
        <div class="chart-header">
          <h3>Cashflow 2025</h3>
           <div class="chart-legend">
            <span class="dot income"></span> Příjmy
            <span class="dot expense"></span> Výdaje
          </div>
        </div>
        <div class="bar-chart-placeholder">
          <div v-for="m in 6" :key="m" class="bar-group">
            <div class="bar-col">
              <div class="bar income" :style="{ height: Math.random() * 60 + 40 + '%' }"></div>
              <div class="bar expense" :style="{ height: Math.random() * 30 + 10 + '%' }"></div>
            </div>
            <span class="month-label">{{ ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer'][m-1] }}</span>
          </div>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="chart-card donut-chart">
        <div class="chart-header">
          <h3>Struktura nákladů</h3>
        </div>
        <div class="donut-placeholder">
          <div class="donut-circle">
            <span class="total-label">493 tis</span>
          </div>
          <ul class="donut-legend">
            <li><span class="dot c1"></span> Energie (45%)</li>
            <li><span class="dot c2"></span> Opravy (30%)</li>
            <li><span class="dot c3"></span> Správa (15%)</li>
            <li><span class="dot c4"></span> Ostatní (10%)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
</script>

<style scoped>
.finance-dashboard {
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

.controls {
  display: flex;
  gap: 1rem;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

.kpi-card.highlight {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.kpi-card.highlight .label,
.kpi-card.highlight .value,
.kpi-card.highlight .trend {
  color: white;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.kpi-card:not(.highlight) .kpi-icon.money { background: #eff6ff; color: #2563eb; }
.kpi-icon.income { background: #dcfce7; color: #16a34a; }
.kpi-icon.expense { background: #fee2e2; color: #dc2626; }
.kpi-icon.debt { background: #fff7ed; color: #ea580c; }
.kpi-card.highlight .kpi-icon { background: rgba(255,255,255,0.2); color: white; }

.kpi-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}
.value.negative { color: #dc2626; }

.trend {
  font-size: 0.85rem;
  font-weight: 600;
  color: #16a34a;
  margin-top: 2px;
}
.trend.down { color: #dc2626; }

.sub {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  min-height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #0f172a;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
}
.dot.income { background: #3b82f6; }
.dot.expense { background: #e2e8f0; }

/* Mock Charts Styling */
.bar-chart-placeholder {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 300px;
  padding-bottom: 20px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  gap: 8px;
}

.bar-col {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 85%;
}

.bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
}
.bar.income { background: #3b82f6; }
.bar.expense { background: #cbd5e1; }

.month-label { font-size: 0.875rem; color: #64748b; }

/* Donut Placeholder */
.donut-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 2rem;
}

.donut-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0% 45%, 
    #22c55e 45% 75%, 
    #f59e0b 75% 90%, 
    #cbd5e1 90% 100%
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-circle::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
}

.total-label {
  position: relative;
  z-index: 1;
  font-weight: 700;
  font-size: 1.5rem;
  color: #0f172a;
}

.donut-legend {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dot.c1 { background: #3b82f6; }
.dot.c2 { background: #22c55e; }
.dot.c3 { background: #f59e0b; }
.dot.c4 { background: #cbd5e1; }

@media (max-width: 1024px) {
  .charts-row { grid-template-columns: 1fr; }
}
</style>
