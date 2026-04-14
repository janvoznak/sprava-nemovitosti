<template>
  <header class="top-header">
    <div class="search-container" v-click-outside="closeSearch">
      <span class="material-icons search-icon">search</span>
      <input 
        type="text" 
        placeholder="Rychlé hledání v softwaru" 
        class="search-input"
        v-model="searchQuery"
        @focus="isSearchOpen = true"
      >
      <!-- Results Dropdown -->
      <GlobalSearchResults 
        v-if="isSearchOpen && searchQuery.length >= 2"
        :results="searchResults"
        :showNoResults="true"
        @select="handleSelection"
      />
    </div>

    <div class="header-right">
      <!-- Notifications -->
      <div class="header-action" v-click-outside="closeNotifications">
        <button 
          class="action-btn" 
          @click.stop="toggleNotifications"
          :class="{ active: showNotifications }"
        >
          <span class="material-icons">notifications</span>
          <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
        </button>
        <NotificationDropdown
          :isOpen="showNotifications"
          :notifications="notifications"
          @close="closeNotifications"
          @mark-all-read="markAllNotificationsRead"
          @notification-click="handleNotificationClick"
        />
      </div>

      <!-- Quick Actions -->
      <div class="header-action" v-click-outside="closeQuickActions">
        <button 
          class="action-btn" 
          @click.stop="toggleQuickActions"
          :class="{ active: showQuickActions }"
        >
          <span class="material-icons">add_circle_outline</span>
        </button>
        <QuickActionsDropdown
          :isOpen="showQuickActions"
          @close="closeQuickActions"
          @action-click="handleQuickAction"
        />
      </div>

      <!-- Daily Tasks -->
      <div class="header-action" v-click-outside="closeDailyTasks">
        <button 
          class="action-btn" 
          @click.stop="toggleDailyTasks"
          :class="{ active: showDailyTasks }"
        >
          <span class="material-icons">event_note</span>
          <span v-if="dailyTasks.length > 0" class="badge tasks-badge">{{ dailyTasks.length }}</span>
        </button>
        <DailyTasksDropdown
          :isOpen="showDailyTasks"
          :tasks="dailyTasks"
          @close="closeDailyTasks"
          @toggle-complete="handleTaskToggle"
        />
      </div>

      <!-- User Profile -->
      <div class="user-profile-container" v-click-outside="closeUserMenu">
        <div 
          class="user-profile-header" 
          @click="toggleUserMenu"
          :class="{ active: showUserMenu }"
        >
          <span class="user-name">Jan Novák</span>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="Jan Novák" 
            class="user-avatar"
          >
          <span class="material-icons expand-icon">expand_more</span>
        </div>
        <UserDropdown 
          :isOpen="showUserMenu"
          @close="closeUserMenu"
          @action="handleUserAction"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { searchService } from '@/services/searchService';
import GlobalSearchResults from './GlobalSearchResults.vue';
import NotificationDropdown from './NotificationDropdown.vue';
import QuickActionsDropdown from './QuickActionsDropdown.vue';
import DailyTasksDropdown from './DailyTasksDropdown.vue';
import UserDropdown from './UserDropdown.vue'; // New Import
import { useNotification } from '@/composables/useNotification';

const router = useRouter();
const { showSuccess, showInfo } = useNotification();

// Search state
const searchQuery = ref('');
const searchResults = ref({ properties: [], tickets: [], tenants: [] });
const isSearchOpen = ref(false);
let searchTimeout = null;

// Dropdown states
const showNotifications = ref(false);
const showQuickActions = ref(false);
const showDailyTasks = ref(false);
const showUserMenu = ref(false); // New State

// Mock notifications data
const notifications = ref([
  {
    id: 1,
    type: 'maintenance',
    title: 'Nový požadavek na údržbu',
    message: 'Bytový dům Na Kopci 123 - Nefunkční topení v jednotce 2.3',
    time: 'před 5 min',
    read: false
  },
  {
    id: 2,
    type: 'payment',
    title: 'Přijata platba',
    message: 'Petr Novák uhradil nájem za leden 2026 - 18 500 Kč',
    time: 'před 1 hod',
    read: false
  },
  {
    id: 3,
    type: 'revision',
    title: 'Blížící se revize',
    message: 'Elektrorevize vyprší za 14 dní - Vila Nová 45',
    time: 'před 3 hod',
    read: false
  },
  {
    id: 4,
    type: 'contract',
    title: 'Smlouva končí',
    message: 'Nájemní smlouva Martiny Novotné vyprší za 30 dní',
    time: 'dnes',
    read: true
  },
  {
    id: 5,
    type: 'tenant',
    title: 'Nový nájemce',
    message: 'Jan Dvořák potvrdil nastěhování do bytu 1.2',
    time: 'včera',
    read: true
  }
]);

// Mock daily tasks data
const dailyTasks = ref([
  {
    id: 1,
    title: 'Prohlídka bytu s potenciálním nájemcem',
    property: 'Bytový dům Na Kopci 123',
    time: '14:00',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Kontrola opravy topení',
    property: 'Villa Nová 45',
    time: '16:30',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: 'Odeslat fakturu za leden',
    property: 'Apartmány Slunečná',
    time: '',
    priority: 'low',
    completed: false
  }
]);

// Computed
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Search functionality
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (newVal.length >= 2) {
    searchTimeout = setTimeout(async () => {
      searchResults.value = await searchService.search(newVal);
      isSearchOpen.value = true;
    }, 300);
  } else {
    searchResults.value = { properties: [], tickets: [], tenants: [] };
  }
});

const closeSearch = () => {
  isSearchOpen.value = false;
};

const handleSelection = (item) => {
  isSearchOpen.value = false;
  searchQuery.value = '';

  if (item.type === 'property') {
    router.push(`/property/${item.id}`);
  } else if (item.type === 'ticket') {
    router.push({ path: '/maintenance', query: { ticket: item.id }});
  } else if (item.type === 'tenant') {
    router.push(`/property/${item.id}`);
  }
};

// Notifications
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    showQuickActions.value = false;
    showDailyTasks.value = false;
    showUserMenu.value = false;
  }
};

const closeNotifications = () => {
  showNotifications.value = false;
};

const markAllNotificationsRead = () => {
  notifications.value.forEach(n => n.read = true);
  showSuccess('Všechna upozornění označena jako přečtená');
};

const handleNotificationClick = (notification) => {
  notification.read = true;
  closeNotifications();
  // Navigate based on notification type
  showInfo(`Navigace k upozornění: ${notification.title}`);
};

// Quick Actions
const toggleQuickActions = () => {
  showQuickActions.value = !showQuickActions.value;
  if (showQuickActions.value) {
    showNotifications.value = false;
    showDailyTasks.value = false;
    showUserMenu.value = false;
  }
};

const closeQuickActions = () => {
  showQuickActions.value = false;
};

const handleQuickAction = (action) => {
  showInfo(`Rychlá akce: ${action.title}`);
  // Handle different actions
  // For now just showing notification
};

// Daily Tasks
const toggleDailyTasks = () => {
  showDailyTasks.value = !showDailyTasks.value;
  if (showDailyTasks.value) {
    showNotifications.value = false;
    showQuickActions.value = false;
    showUserMenu.value = false;
  }
};

const closeDailyTasks = () => {
  showDailyTasks.value = false;
};

const handleTaskToggle = (task) => {
  task.completed = !task.completed;
  if (task.completed) {
    showSuccess(`Úkol dokončen: ${task.title}`);
  }
};

// User Menu
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showNotifications.value = false;
    showQuickActions.value = false;
    showDailyTasks.value = false;
  }
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleUserAction = (action) => {
  closeUserMenu();
  if (action === 'logout') {
    showInfo('Byli jste úspěšně odhlášeni');
    router.push('/');
  } else if (action === 'profile') {
    router.push('/settings/profile');
  } else if (action === 'settings') {
    router.push('/settings');
  }
};

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.top-header {
  height: 64px;
  background: #1565C0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
  z-index: 50;
}

.search-container {
  position: relative;
  width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.125rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid transparent;
  border-radius: 6px;
  color: #FFFFFF;
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  transition: all 0.2s;
  outline: none;
}

.search-input::placeholder {
  color: #FFFFFF;
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  opacity: 0.7;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: var(--save-color);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.2);
}


/* Header Right Section */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-action {
  position: relative;
}

.action-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-btn.active {
  background: rgba(255, 255, 255, 0.25);
}

.action-btn .material-icons {
  font-size: 22px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #1565C0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tasks-badge {
  background: #2563eb;
}

/* User Profile */
.user-profile-container {
  position: relative;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.user-profile-header:hover, .user-profile-header.active {
  background: rgba(255, 255, 255, 0.1);
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.expand-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s;
}

.user-profile-header.active .expand-icon {
  transform: rotate(180deg);
}
</style>
