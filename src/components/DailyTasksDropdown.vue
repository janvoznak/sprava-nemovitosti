<template>
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="dropdown-container" v-click-outside="close">
      <div class="dropdown-header">
        <h3>Dnešní úkoly</h3>
        <span class="task-count">{{ tasks.length }}</span>
      </div>
      
      <div v-if="tasks.length === 0" class="empty-state">
        <span class="material-icons">check_circle</span>
        <p>Žádné úkoly pro dnešek</p>
        <span class="empty-subtitle">Skvělá práce! 🎉</span>
      </div>

      <div v-else class="tasks-list">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="task-item"
          :class="`priority-${task.priority}`"
        >
          <div class="task-checkbox">
            <input 
              type="checkbox" 
              :checked="task.completed"
              @change="handleToggleComplete(task)"
            />
          </div>
          <div class="task-content">
            <div class="task-header">
              <p class="task-title">{{ task.title }}</p>
              <span v-if="task.time" class="task-time">
                <span class="material-icons">schedule</span>
                {{ task.time }}
              </span>
            </div>
            <p class="task-property">
              <span class="material-icons">business</span>
              {{ task.property }}
            </p>
            <div v-if="task.priority === 'high'" class="priority-badge">
              Vysoká priorita
            </div>
          </div>
        </div>
      </div>

      <div v-if="tasks.length > 0" class="dropdown-footer">
        <router-link to="/tasks" class="footer-link" @click="close">
          Kalendář úkolů
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
  tasks: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'toggle-complete', 'task-click']);

const close = () => {
  emit('close');
};

const handleToggleComplete = (task) => {
  emit('toggle-complete', task);
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

.task-count {
  background: #2563eb;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  min-width: 24px;
  text-align: center;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
}

.empty-state .material-icons {
  font-size: 48px;
  color: #22c55e;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.tasks-list {
  max-height: 400px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.task-item:hover {
  background: #f8fafc;
}

.task-item.priority-high {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.task-item.priority-high:hover {
  background: #fee2e2;
}

.task-checkbox {
  padding-top: 0.125rem;
}

.task-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  flex: 1;
}

.task-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

.task-time .material-icons {
  font-size: 14px;
}

.task-property {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
}

.task-property .material-icons {
  font-size: 16px;
}

.priority-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #dc2626;
  background: #fee2e2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.025em;
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
