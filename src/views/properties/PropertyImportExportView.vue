<template>
  <div class="import-export-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Nemovitosti', to: '/properties' },
      { label: 'Import/Export' }
    ]" />

    <h1 class="page-title">Import a Export dat</h1>
    <p class="subtitle">Správa datových přenosů a synchronizace s externími systémy</p>

    <div class="grid-layout">
      <!-- Export Section -->
      <div class="card export-card">
        <div class="card-header">
          <div class="icon-box export-icon">
            <span class="material-icons">cloud_download</span>
          </div>
          <h3>Export Dat</h3>
        </div>
        <p class="card-desc">Stáhněte si data pro účetnictví nebo zálohu.</p>
        
        <div class="action-list">
          <div class="action-item">
            <div class="action-info">
              <strong>Export pro účetní</strong>
              <span>CSV formát, přehled plateb a faktur</span>
            </div>
            <button class="btn-outline">
              <span class="material-icons">file_download</span> Stáhnout
            </button>
          </div>
          
          <div class="action-item">
            <div class="action-info">
              <strong>Export pro portály</strong>
              <span>XML feed (Sreality, Reality.cz)</span>
            </div>
            <button class="btn-outline">
              <span class="material-icons">rss_feed</span> Generovat
            </button>
          </div>

          <div class="action-item">
            <div class="action-info">
              <strong>Kompletní záloha</strong>
              <span>ZIP archiv všech dokumentů</span>
            </div>
            <button class="btn-outline">
              <span class="material-icons">archive</span> Zálohovat
            </button>
          </div>
        </div>
      </div>

      <!-- Import Section -->
      <div class="card import-card">
        <div class="card-header">
          <div class="icon-box import-icon">
            <span class="material-icons">cloud_upload</span>
          </div>
          <h3>Import Dat</h3>
        </div>
        <p class="card-desc">Nahrajte nové nemovitosti nebo aktualizujte stávající.</p>

        <div 
          class="drop-zone"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <span class="material-icons upload-icon">upload_file</span>
          <p class="drop-text">Přetáhněte soubor sem</p>
          <p class="drop-sub">nebo klikněte pro výběr (CSV, XLS)</p>
          <button class="btn-primary">Vybrat soubor</button>
        </div>
      </div>
    </div>

    <!-- History Log -->
    <div class="history-section">
      <h3>Historie synchronizací</h3>
      <table class="history-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Typ akce</th>
            <th>Uživatel</th>
            <th>Výsledek</th>
            <th>Soubor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in historyLogs" :key="log.id">
            <td>{{ log.date }}</td>
            <td>
              <span class="type-badge" :class="log.type">{{ log.typeLabel }}</span>
            </td>
            <td>{{ log.user }}</td>
            <td>
              <span class="status-text" :class="log.status">
                <span class="material-icons status-icon">{{ log.statusIcon }}</span>
                {{ log.result }}
              </span>
            </td>
            <td class="file-name">{{ log.file }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { useNotification } from '@/composables/useNotification';

const { showSuccess } = useNotification();

const handleDrop = () => {
  showSuccess('Soubor byl úspěšně nahrán (simulace)');
};

const historyLogs = ref([
  { id: 1, date: '02.02.2025 14:30', type: 'export', typeLabel: 'Export', user: 'Jan Novák', status: 'success', statusIcon: 'check_circle', result: 'Úspěšně', file: 'accounting_export_2025_01.csv' },
  { id: 2, date: '01.02.2025 09:15', type: 'import', typeLabel: 'Import', user: 'Jan Novák', status: 'success', statusIcon: 'check_circle', result: '15 položek importováno', file: 'new_properties.xlsx' },
  { id: 3, date: '28.01.2025 16:45', type: 'sync', typeLabel: 'Portály', user: 'Systém', status: 'warning', statusIcon: 'warning', result: 'Varování (2 chyby)', file: 'sreality_feed.xml' },
  { id: 4, date: '25.01.2025 10:00', type: 'backup', typeLabel: 'Záloha', user: 'Jan Novák', status: 'success', statusIcon: 'check_circle', result: 'Záloha vytvořena', file: 'backup_full_v45.zip' },
]);
</script>

<style scoped>
.import-export-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.icon-box {
  width: 48px; height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-box .material-icons { font-size: 24px; }

.export-icon { background: #eff6ff; color: #2563eb; }
.import-icon { background: #f0fdf4; color: #16a34a; }

.card-desc {
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Action List */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  background: #f8fafc;
}

.action-info {
  display: flex;
  flex-direction: column;
}
.action-info strong { color: #334155; }
.action-info span { font-size: 0.85rem; color: #94a3b8; }

.btn-outline {
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-outline:hover {
  border-color: #94a3b8;
  color: #0f172a;
  background: #f1f5f9;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 240px;
}

.drop-zone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon { font-size: 3rem; color: #94a3b8; margin-bottom: 1rem; }
.drop-text { font-weight: 600; color: #334155; margin-bottom: 0.25rem; }
.drop-sub { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.5rem; }

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* History Table */
.history-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.history-section h3 {
  padding: 1.5rem;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 1.125rem;
}

.history-table { width: 100%; border-collapse: collapse; }
.history-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
}
.history-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
}

.type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}
.type-badge.export { color: #2563eb; background: #eff6ff; }
.type-badge.import { color: #16a34a; background: #dcfce7; }
.type-badge.sync { color: #ea580c; background: #fff7ed; }
.type-badge.backup { color: #64748b; background: #f1f5f9; }

.status-text { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
.status-text.success { color: #16a34a; }
.status-text.warning { color: #ca8a04; }
.status-icon { font-size: 18px; }

.file-name { font-family: monospace; color: #64748b; }

@media (max-width: 768px) {
  .grid-layout { grid-template-columns: 1fr; }
}
</style>
