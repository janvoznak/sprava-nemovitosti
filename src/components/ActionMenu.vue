<script setup>
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['close']);

const menuItems = [
  { label: 'Upravit nemovitost', icon: 'edit', action: 'edit' },
  { label: 'Exportovat do PDF', icon: 'picture_as_pdf', action: 'export-pdf' },
  { label: 'Generovat sestavu', icon: 'analytics', action: 'generate-report' },
  { label: 'Sdílet přístup', icon: 'share', action: 'share-access' },
  { divider: true },
  { label: 'Archivovat nemovitost', icon: 'archive', action: 'archive' },
  { label: 'Smazat', icon: 'delete', action: 'delete' }
];


const handleClickOutside = (event) => {
  if (!event.target.closest('.action-menu-container') && !event.target.closest('.action-btn')) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="action-menu-container">
    <div class="action-menu">
      <template v-for="(item, index) in menuItems" :key="index">
        <div v-if="item.divider" class="menu-divider"></div>
        <div 
          v-else
          class="menu-item"
          :class="{ 'delete-item': item.action === 'delete' }"
          @click="$emit('action', item.action)"
        >
          <span class="material-icons menu-icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.action-menu-container {
  position: absolute;
  top: 90%;
  right: 0;
  z-index: 50;
  min-width: 220px;
}

.action-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 0.5rem;
  animation: fadeIn 0.15s ease-out;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.2s;
  color: #475569;
}

.menu-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.menu-icon {
  font-size: 18px;
  color: #94a3b8;
}

.menu-item:hover .menu-icon {
  color: #3b82f6;
}

.menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.25rem 0;
}

.delete-item {
  color: #ef4444 !important;
}

.delete-item .menu-icon {
  color: #ef4444 !important;
}

.delete-item:hover {
  background: #fef2f2 !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
