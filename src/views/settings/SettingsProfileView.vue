<template>
  <div class="settings-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Nastavení', to: '/settings' },
      { label: 'Profil' }
    ]" />

    <h1 class="page-title">Můj Profil</h1>

    <div class="profile-layout">
      <!-- Sidebar Navigation for Settings -->
      <div class="settings-nav">
        <div 
          class="nav-item" 
          :class="{ active: currentTab === 'personal' }"
          @click="currentTab = 'personal'"
        >
          <span class="material-icons">person</span> Osobní údaje
        </div>
        <div 
          class="nav-item" 
          :class="{ active: currentTab === 'security' }"
          @click="currentTab = 'security'"
        >
          <span class="material-icons">lock</span> Zabezpečení
        </div>
        <div 
          class="nav-item" 
          :class="{ active: currentTab === 'notifications' }"
          @click="currentTab = 'notifications'"
        >
          <span class="material-icons">notifications</span> Upozornění
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-area">
        <!-- TAB: Personal Info -->
        <div v-if="currentTab === 'personal'" class="settings-card">
          <h3>Osobní informace</h3>
          <div class="avatar-section">
            <div class="avatar-large">JN</div>
            <div class="avatar-actions">
              <button class="btn-outline">Změnit fotku</button>
              <button class="btn-text text-danger">Odstranit</button>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Jméno</label>
              <input type="text" v-model="profile.firstName">
            </div>
            <div class="form-group">
              <label>Příjmení</label>
              <input type="text" v-model="profile.lastName">
            </div>
            <div class="form-group span-2">
              <label>E-mail</label>
              <input type="email" v-model="profile.email">
            </div>
            <div class="form-group">
              <label>Telefon</label>
              <input type="tel" v-model="profile.phone">
            </div>
            <div class="form-group">
              <label>Pozice</label>
              <input type="text" v-model="profile.role" disabled>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" @click="save">Uložit změny</button>
          </div>
        </div>

        <!-- TAB: Security -->
        <div v-if="currentTab === 'security'" class="settings-card">
          <h3>Zabezpečení účtu</h3>
          
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Současné heslo</label>
              <input type="password" v-model="security.currentPassword" placeholder="Zadejte aktuální heslo">
            </div>
            <div class="form-group">
              <label>Nové heslo</label>
              <input type="password" v-model="security.newPassword" placeholder="Minimálně 8 znaků">
            </div>
            <div class="form-group">
              <label>Potvrzení hesla</label>
              <input type="password" v-model="security.confirmPassword" placeholder="Zadejte nové heslo znovu">
            </div>
          </div>

          <div class="security-options" style="margin-top: 2rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem;">
            <h4>Dvoufázové ověření (2FA)</h4>
            <div class="checkbox-row" style="margin-top: 1rem; display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" id="2fa" v-model="security.twoFactor" style="width: auto;">
              <label for="2fa" style="margin: 0; color: #0f172a;">Povolit dvoufázové ověření při přihlášení</label>
            </div>
          </div>

          <div class="form-actions">
             <button class="btn-primary" @click="saveSecurity">Aktualizovat heslo</button>
          </div>
        </div>

        <!-- TAB: Notifications -->
        <div v-if="currentTab === 'notifications'" class="settings-card">
          <h3>Nastavení upozornění</h3>
          
          <div class="notification-settings" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="checkbox-row" style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" id="emailAlerts" v-model="notifications.emailAlerts" style="width: auto;">
              <label for="emailAlerts" style="margin: 0; color: #0f172a;">E-mailová upozornění (nové platby, úkoly)</label>
            </div>
            
            <div class="checkbox-row" style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" id="smsAlerts" v-model="notifications.smsAlerts" style="width: auto;">
              <label for="smsAlerts" style="margin: 0; color: #0f172a;">SMS upozornění (kritické havárie)</label>
            </div>

            <div class="checkbox-row" style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" id="weeklyReport" v-model="notifications.weeklyReport" style="width: auto;">
              <label for="weeklyReport" style="margin: 0; color: #0f172a;">Zasílat týdenní přehledy</label>
            </div>

            <div class="checkbox-row" style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" id="newsletters" v-model="notifications.newsletters" style="width: auto;">
              <label for="newsletters" style="margin: 0; color: #0f172a;">Novinky a aktualizace systému</label>
            </div>
          </div>

          <div class="form-actions">
             <button class="btn-primary" @click="saveNotifications">Uložit preference</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { useNotification } from '@/composables/useNotification';

const { showSuccess, showInfo } = useNotification();

const currentTab = ref('personal');

const profile = reactive({
  firstName: 'Jan',
  lastName: 'Novák',
  email: 'jan.novak@poskireal.cz',
  phone: '+420 777 123 456',
  role: 'Hlavní správce'
});

const security = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false
});

const notifications = reactive({
  emailAlerts: true,
  smsAlerts: false,
  newsletters: true,
  weeklyReport: true
});

const save = () => {
  showSuccess('Profil byl aktualizován');
};

const saveSecurity = () => {
  showSuccess('Heslo bylo úspěšně změněno');
  security.currentPassword = '';
  security.newPassword = '';
  security.confirmPassword = '';
};

const saveNotifications = () => {
  showSuccess('Nastavení upozornění uloženo');
};
</script>

<style scoped>
.settings-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { background: #f1f5f9; color: #0f172a; }
.nav-item.active { background: rgba(0, 200, 83, 0.05); color: var(--save-color); }

.settings-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
}

.settings-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-large {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: var(--save-color);
  color: white;
  font-size: 2rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.avatar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.span-2 { grid-column: span 2; }

label { font-weight: 500; font-size: 0.85rem; color: #64748b; }

input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}
input:disabled { background: #f8fafc; color: #94a3b8; }

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--save-color);
  color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px;
  font-weight: 600; cursor: pointer;
}
.btn-primary:hover { background: var(--save-color-hover); }


.btn-outline {
  background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
  font-weight: 500; color: #0f172a;
}

.btn-text { background: none; border: none; cursor: pointer; font-weight: 500; }
.text-danger { color: #dc2626; }

@media (max-width: 768px) {
  .profile-layout { grid-template-columns: 1fr; }
}
</style>
