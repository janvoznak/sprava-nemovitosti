<template>
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="dropdown-container" v-click-outside="close">
      <div class="dropdown-header">
        <h3>Rychlé akce</h3>
      </div>
      
      <div class="actions-list">
        <button 
          v-for="action in actions" 
          :key="action.id"
          class="action-item"
          @click="handleAction(action)"
        >
          <div class="action-icon" :style="{ background: action.color }">
            <span class="material-icons">{{ action.icon }}</span>
          </div>
          <div class="action-content">
            <p class="action-title">{{ action.title }}</p>
            <p class="action-description">{{ action.description }}</p>
          </div>
          <span class="material-icons chevron">chevron_right</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'action-click']);

const actions = ref([
  {
    id: 'add-property',
    title: 'Přidat nemovitost',
    description: 'Vytvořit novou nemovitost v portfoliu',
    icon: 'business',
    color: 'rgba(0, 200, 83, 0.05)',
    iconColor: '#00C853'
  },
  {
    id: 'new-maintenance',
    title: 'Nový požadavek na údržbu',
    description: 'Zaznamenat problém nebo servis',
    icon: 'build',
    color: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    id: 'record-payment',
    title: 'Zaznamenat platbu',
    description: 'Evidovat přijatou platbu nájemného',
    icon: 'payments',
    color: '#dcfce7',
    iconColor: '#16a34a'
  },
  {
    id: 'create-note',
    title: 'Vytvořit poznámku',
    description: 'Přidat poznámku nebo připomínku',
    icon: 'note_add',
    color: '#e0e7ff',
    iconColor: '#6366f1'
  },
  {
    id: 'schedule-viewing',
    title: 'Naplánovat prohlídku',
    description: 'Domluvit prohlídku nemovitosti',
    icon: 'event',
    color: '#fce7f3',
    iconColor: '#db2777'
  },
  {
    id: 'new-contract',
    title: 'Nová smlouva',
    description: 'Vytvořit nájemní smlouvu',
    icon: 'description',
    color: '#f3e8ff',
    iconColor: '#9333ea'
  }
]);

const close = () => {
  emit('close');
};

const handleAction = (action) => {
  emit('action-click', action);
  close();
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
  width: 360px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.actions-list {
  padding: 0.5rem;
  max-height: 450px;
  overflow-y: auto;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.action-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon .material-icons {
  font-size: 22px;
  color: inherit;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.125rem 0;
}

.action-description {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: #cbd5e1;
  font-size: 20px;
  transition: all 0.2s;
}

.action-item:hover .chevron {
  color: var(--save-color);
  transform: translateX(4px);
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
