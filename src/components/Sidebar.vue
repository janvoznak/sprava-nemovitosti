<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.svg" alt="Poski REAL" class="logo-img">
      </router-link>
    </div>

    <nav class="nav-menu">
      <ul>
        <!-- Dashboard (no submenu) -->
        <li>
          <router-link to="/" class="nav-item" :class="{ active: isActiveRoute('/') }" exact>
            <span class="material-icons nav-icon">dashboard</span>
            <span class="nav-label">Dashboard</span>
          </router-link>
        </li>

        <!-- Nemovitosti (with submenu) -->
        <li class="menu-group">
          <div 
            class="nav-item parent-item" 
            :class="{ active: isActiveSection('properties'), expanded: expandedMenus.properties }"
            @click="toggleMenu('properties')"
          >
            <span class="material-icons nav-icon">business</span>
            <span class="nav-label">Nemovitosti</span>
            <span class="material-icons chevron-icon" :class="{ rotated: expandedMenus.properties }">
              expand_more
            </span>
          </div>
          <transition name="submenu">
            <ul v-if="expandedMenus.properties" class="submenu">
              <li>
                <router-link to="/properties" class="submenu-item" exact>
                  Přehled
                </router-link>
              </li>
              <li>
                <router-link to="/units" class="submenu-item">
                  Jednotky
                </router-link>
              </li>
              <li>
                <router-link to="/properties/add" class="submenu-item">
                  Nová
                </router-link>
              </li>
              <li>
                <router-link to="/properties/map" class="submenu-item">
                  Mapa
                </router-link>
              </li>
              <li>
                <router-link to="/properties/import-export" class="submenu-item">
                  Import/Export
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- Adresář (with submenu) -->
        <li class="menu-group">
          <div 
            class="nav-item parent-item" 
            :class="{ active: isActiveSection('tenants'), expanded: expandedMenus.tenants }"
            @click="toggleMenu('tenants')"
          >
            <span class="material-icons nav-icon">people</span>
            <span class="nav-label">Adresář</span>
            <span class="material-icons chevron-icon" :class="{ rotated: expandedMenus.tenants }">
              expand_more
            </span>
          </div>
          <transition name="submenu">
            <ul v-if="expandedMenus.tenants" class="submenu">
              <li>
                <router-link to="/tenants" class="submenu-item" exact>
                  Přehled
                </router-link>
              </li>
              <li>
                <router-link to="/tenants/new" class="submenu-item">
                  Nový
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- Údržba (with submenu) -->
        <li class="menu-group">
          <div 
            class="nav-item parent-item" 
            :class="{ active: isActiveSection('maintenance'), expanded: expandedMenus.maintenance }"
            @click="toggleMenu('maintenance')"
          >
            <span class="material-icons nav-icon">build</span>
            <span class="nav-label">Údržba</span>
            <span class="material-icons chevron-icon" :class="{ rotated: expandedMenus.maintenance }">
              expand_more
            </span>
          </div>
          <transition name="submenu">
            <ul v-if="expandedMenus.maintenance" class="submenu">
              <li>
                <router-link to="/maintenance" class="submenu-item" exact>
                  Kanban
                </router-link>
              </li>
              <li>
                <router-link to="/maintenance/new" class="submenu-item">
                  Nový požadavek
                </router-link>
              </li>
              <li>
                <router-link to="/maintenance/calendar" class="submenu-item">
                  Kalendář
                </router-link>
              </li>
              <li>
                <router-link to="/maintenance/suppliers" class="submenu-item">
                  Dodavatelé
                </router-link>
              </li>
              <li>
                <router-link to="/maintenance/history" class="submenu-item">
                  Historie
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- Finance (with submenu) -->
        <li class="menu-group">
          <div 
            class="nav-item parent-item" 
            :class="{ active: isActiveSection('finance'), expanded: expandedMenus.finance }"
            @click="toggleMenu('finance')"
          >
            <span class="material-icons nav-icon">payments</span>
            <span class="nav-label">Finance</span>
            <span class="material-icons chevron-icon" :class="{ rotated: expandedMenus.finance }">
              expand_more
            </span>
          </div>
          <transition name="submenu">
            <ul v-if="expandedMenus.finance" class="submenu">
              <li>
                <router-link to="/finance" class="submenu-item" exact>
                  Dashboard
                </router-link>
              </li>
              <li>
                <router-link to="/debtors" class="submenu-item">
                  Dlužníci
                </router-link>
              </li>
              <li>
                <router-link to="/finance/payments" class="submenu-item">
                  Platby
                </router-link>
              </li>
              <li>
                <router-link to="/finance/invoices" class="submenu-item">
                  Faktury
                </router-link>
              </li>
              <li>
                <router-link to="/finance/expenses" class="submenu-item">
                  Náklady
                </router-link>
              </li>
              <li>
                <router-link to="/finance/budget" class="submenu-item">
                  Rozpočet
                </router-link>
              </li>
            </ul>
          </transition>
        </li>

        <!-- Nastavení (with submenu) -->
        <li class="menu-group">
          <div 
            class="nav-item parent-item" 
            :class="{ active: isActiveSection('settings'), expanded: expandedMenus.settings }"
            @click="toggleMenu('settings')"
          >
            <span class="material-icons nav-icon">settings</span>
            <span class="nav-label">Nastavení</span>
            <span class="material-icons chevron-icon" :class="{ rotated: expandedMenus.settings }">
              expand_more
            </span>
          </div>
          <transition name="submenu">
            <ul v-if="expandedMenus.settings" class="submenu">
              <li>
                <router-link to="/settings/profile" class="submenu-item">
                  Profil
                </router-link>
              </li>
              <li>
                <router-link to="/settings/notifications" class="submenu-item">
                  Notifikace
                </router-link>
              </li>
              <li>
                <router-link to="/settings/templates" class="submenu-item">
                  Šablony
                </router-link>
              </li>
              <li>
                <router-link to="/settings/system" class="submenu-item">
                  Systém
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>

  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Track which menus are expanded
const expandedMenus = ref({
  properties: false,
  tenants: false,
  maintenance: false,
  finance: false,
  settings: false
});

// Toggle menu expansion (Accordion behavior)
const toggleMenu = (menuKey) => {
  // If we are opening a menu, close all others first
  if (!expandedMenus.value[menuKey]) {
    for (const key in expandedMenus.value) {
      expandedMenus.value[key] = false;
    }
    expandedMenus.value[menuKey] = true;
  } else {
    // If closing, just close it
    expandedMenus.value[menuKey] = false;
  }
};

// Check if current route is active
const isActiveRoute = (path) => {
  return route.path === path;
};

// Check if a section is active (parent or any child)
const isActiveSection = (section) => {
  return route.path.startsWith(`/${section}`);
};

// Auto-expand menu when navigating to a sub-page
watch(() => route.path, (newPath) => {
  // Reset all menus first to ensure only the active one is open
  for (const key in expandedMenus.value) {
    expandedMenus.value[key] = false;
  }

  if (newPath.startsWith('/properties') || newPath.startsWith('/units')) {
    expandedMenus.value.properties = true;
  } else if (newPath.startsWith('/tenants')) {
    expandedMenus.value.tenants = true;
  } else if (newPath.startsWith('/maintenance')) {
    expandedMenus.value.maintenance = true;
  } else if (newPath.startsWith('/finance')) {
    expandedMenus.value.finance = true;
  } else if (newPath.startsWith('/settings')) {
    expandedMenus.value.settings = true;
  }
}, { immediate: true });
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #2563eb;
  color: #FFFFFF;
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: 4px 0 10px rgba(0,0,0,0.05);
  z-index: 10;
}

.sidebar-header {
  margin-bottom: 2.5rem;
  padding: 0 1rem;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo-img {
  max-width: 100%;
  height: 56px;
  object-fit: contain;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
}

.nav-menu > ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-group {
  margin-bottom: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  user-select: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.parent-item {
  margin-bottom: 0;
}

.parent-item.expanded {
  background: rgba(255, 255, 255, 0.15);
}

.nav-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

.nav-label {
  flex: 1;
}

.chevron-icon {
  font-size: 1.25rem;
  opacity: 0.6;
  font-weight: 400;
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Submenu Styles */
.submenu {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0.5rem 0;
  overflow: hidden;
}

.submenu-item {
  display: block;
  padding: 0.75rem 1.25rem 0.75rem 3.5rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 2px 0.5rem;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.submenu-item.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
}

/* Submenu Transition */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  margin: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
