<template>
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="dropdown-container" v-click-outside="close">
      <div class="dropdown-header">
        <h3>Upozornění</h3>
        <button @click="markAllAsRead" class="text-btn">Označit vše jako přečtené</button>
      </div>
      
      <div class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="`type-${notification.type}`">
            <span class="material-icons">{{ getIconForType(notification.type) }}</span>
          </div>
          <div class="notification-content">
            <p class="notification-title">{{ notification.title }}</p>
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">{{ notification.time }}</span>
          </div>
          <div v-if="!notification.read" class="unread-dot"></div>
        </div>
      </div>

      <div class="dropdown-footer">
        <router-link to="/notifications" class="footer-link" @click="close">
          Zobrazit vše
        </router-link>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  notifications: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'mark-all-read', 'notification-click']);

const close = () => {
  emit('close');
};

const markAllAsRead = () => {
  emit('mark-all-read');
};

const handleNotificationClick = (notification) => {
  emit('notification-click', notification);
};

const getIconForType = (type) => {
  const iconMap = {
    'maintenance': 'build',
    'payment': 'payment',
    'contract': 'description',
    'revision': 'warning',
    'tenant': 'person',
    'general': 'info'
  };
  return iconMap[type] || 'notifications';
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
.dropdown-container {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.text-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-item.unread:hover {
  background: #dbeafe;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon .material-icons {
  font-size: 20px;
}

.type-maintenance {
  background: #fef3c7;
  color: #d97706;
}

.type-payment {
  background: #fee2e2;
  color: #dc2626;
}

.type-contract {
  background: #dbeafe;
  color: #2563eb;
}

.type-revision {
  background: #fef2f2;
  color: #ef4444;
}

.type-tenant {
  background: #dcfce7;
  color: #16a34a;
}

.type-general {
  background: #e0e7ff;
  color: #6366f1;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.notification-message {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
}

.dropdown-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  background: #f8fafc;
}

.footer-link {
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Transition */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
