<template>
  <div class="settings-view">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Nastavení' }
    ]" />

    <div class="settings-container">
      <h1 class="page-title">Nastavení</h1>

      <!-- Tabs Navigation -->
      <div class="settings-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="tab-btn" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="material-icons tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- 1. Profile Tab -->
        <div v-if="activeTab === 'profile'" class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Osobní údaje</h2>
            <p class="card-subtitle">Spravujte své kontaktní informace a heslo</p>
          </div>
          <div class="form-grid">
            <div class="form-row split">
              <div class="form-group">
                <label>Jméno</label>
                <input type="text" v-model="profile.firstName" class="form-input">
              </div>
              <div class="form-group">
                <label>Příjmení</label>
                <input type="text" v-model="profile.lastName" class="form-input">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="profile.email" class="form-input">
              </div>
            </div>
            <div class="form-row">
              <button class="btn-primary" @click="saveProfile">Uložit změny</button>
            </div>
          </div>
        </div>

        <!-- 2. Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Upozornění</h2>
            <p class="card-subtitle">Vyberte, jak chcete být informováni</p>
          </div>
          <div class="toggles-list">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Emailová upozornění</span>
                <span class="toggle-desc">Výpadky plateb, končící smlouvy</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="notifications.email">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Push notifikace</span>
                <span class="toggle-desc">Rychlá upozornění v prohlížeči</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="notifications.push">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Týdenní souhrn</span>
                <span class="toggle-desc">Přehled aktivit každé pondělí ráno</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="notifications.weeklyDigest">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. Appearance Tab -->
        <div v-if="activeTab === 'appearance'" class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Vzhled aplikace</h2>
            <p class="card-subtitle">Přizpůsobte si prostředí aplikace</p>
          </div>
          <div class="theme-options">
            <div 
              class="theme-option" 
              :class="{ active: theme === 'light' }"
              @click="setTheme('light')"
            >
              <div class="theme-preview light"></div>
              <span>Světlý režim</span>
            </div>
            <div 
              class="theme-option" 
              :class="{ active: theme === 'dark' }"
              @click="setTheme('dark')"
            >
              <div class="theme-preview dark"></div>
              <span>Tmavý režim</span>
            </div>
          </div>
        </div>

        <!-- 4. System Tab -->
        <div v-if="activeTab === 'system'" class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Systémová data</h2>
            <p class="card-subtitle">Export a správa dat</p>
          </div>
          <div class="system-actions">
            <div class="action-row">
              <div class="action-info">
                <span class="action-label">Export dat</span>
                <span class="action-desc">Stáhnout kompletní zálohu všech nemovitostí a nájemníků (CSV)</span>
              </div>
              <button class="btn-secondary" @click="handleExport">
                <span class="material-icons icon-small">download</span> Stáhnout data
              </button>
            </div>
             <div class="divider"></div>
            <div class="action-row">
              <div class="action-info">
                <span class="action-label text-red">Smazat účet</span>
                <span class="action-desc">Nenávratně smaže všechna data a přístup</span>
              </div>
              <button class="btn-danger" @click="handleDeleteAccount">Smazat účet</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { useNotification } from '@/composables/useNotification';

const { showSuccess, showInfo } = useNotification();

const activeTab = ref('profile');

const tabs = [
  { id: 'profile', label: 'Profil', icon: 'person' },
  { id: 'notifications', label: 'Notifikace', icon: 'notifications' },
  { id: 'appearance', label: 'Vzhled', icon: 'palette' },
  { id: 'system', label: 'Systém', icon: 'settings_suggest' }
];

// Mock Data
const profile = ref({
  firstName: 'Jan',
  lastName: 'Novák',
  email: 'jan.novak@example.com'
});

const notifications = ref({
  email: true,
  push: false,
  weeklyDigest: true
});

const theme = ref('light');

// Actions
const saveProfile = () => {
  showSuccess('Profil byl aktualizován');
};

const setTheme = (mode) => {
  theme.value = mode;
  showSuccess(`Režim přepnut na: ${mode === 'light' ? 'Světlý' : 'Tmavý'}`);
  // In real app: apply class to body/html
};

const handleExport = () => {
  showInfo('Stahování dat zahájeno...');
  setTimeout(() => {
    showSuccess('Data byla úspěšně stažena');
  }, 1500);
};

const handleDeleteAccount = () => {
  if (confirm('Opravdu chcete smazat svůj účet? Tato akce je nevratná.')) {
    alert('Funkce není v demu dostupná.');
  }
};
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Breadcrumbs (Handled by component) */


.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

/* Tabs */
.settings-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #1e293b;
  background: rgba(0,0,0,0.02);
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  font-weight: 600;
}

.tab-icon { font-size: 20px; }

/* Card Styles */
.settings-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header { margin-bottom: 2rem; }
.card-title { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem 0; }
.card-subtitle { color: #64748b; font-size: 0.9rem; margin: 0; }

/* Form Styles */
.form-grid { display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px; }
.form-row { display: flex; gap: 1.5rem; }
.form-row.split { display: grid; grid-template-columns: 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.95rem; }
.form-input:focus { outline: none; border-color: var(--save-color); box-shadow: 0 0 0 2px rgba(0, 200, 83, 0.1); }

.btn-primary {
  background: var(--save-color); color: white; border: none; padding: 0.75rem 1.5rem;
  border-radius: 6px; font-weight: 600; cursor: pointer; align-self: flex-start;
}
.btn-primary:hover { background: var(--save-color-hover); }


.btn-secondary {
  background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.6rem 1rem;
  border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
}
.btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }

.btn-danger {
  background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; padding: 0.6rem 1rem;
  border-radius: 6px; font-weight: 600; cursor: pointer;
}
.btn-danger:hover { background: #FEE2E2; }

/* Toggles */
.toggles-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px; }
.toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
.toggle-info { display: flex; flex-direction: column; }
.toggle-label { font-weight: 600; color: #334155; }
.toggle-desc { font-size: 0.8rem; color: #64748b; }

/* Switch CSS */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--save-color); }
input:checked + .slider:before { transform: translateX(20px); }

/* Appearance */
.theme-options { display: flex; gap: 2rem; }
.theme-option { cursor: pointer; text-align: center; }
.theme-preview { width: 160px; height: 100px; border-radius: 8px; border: 2px solid #e2e8f0; margin-bottom: 0.5rem; transition: all 0.2s; }
.theme-preview.light { background: #f8fafc; }
.theme-preview.dark { background: #1e293b; }
.theme-option.active .theme-preview { border-color: var(--save-color); box-shadow: 0 0 0 4px rgba(0,200,83,0.1); }
.theme-option span { font-weight: 500; color: #475569; }
.theme-option.active span { color: var(--save-color); font-weight: 600; }

/* System Actions */
.system-actions { display: flex; flex-direction: column; gap: 1.5rem; max-width: 700px; }
.action-row { display: flex; justify-content: space-between; align-items: center; }
.action-info { display: flex; flex-direction: column; }
.action-label { font-weight: 600; color: #334155; }
.action-desc { font-size: 0.85rem; color: #64748b; }
.text-red { color: #DC2626; }
.divider { height: 1px; background: #f1f5f9; width: 100%; }
.icon-small { font-size: 18px; }

@media (max-width: 640px) {
  .settings-view { padding: 1rem; }
  .form-row.split { grid-template-columns: 1fr; }
  .action-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .btn-secondary, .btn-danger { width: 100%; justify-content: center; }
}
</style>
