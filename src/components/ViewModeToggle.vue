<template>
  <div class="view-mode-toggle">
    <button 
      class="toggle-btn"
      :class="{ active: viewMode === VIEW_MODE_PROPERTIES }"
      @click="setViewMode(VIEW_MODE_PROPERTIES)"
    >
      <span class="material-icons">business</span>
      <span class="toggle-label">Nemovitosti</span>
    </button>
    <button 
      class="toggle-btn"
      :class="{ active: viewMode === VIEW_MODE_UNITS }"
      @click="setViewMode(VIEW_MODE_UNITS)"
    >
      <span class="material-icons">meeting_room</span>
      <span class="toggle-label">Jednotky</span>
    </button>
  </div>
</template>

<script setup>
import { useViewMode } from '@/composables/useViewMode';
import { useRouter } from 'vue-router';
import { watch, onMounted } from 'vue';

const router = useRouter();
const { viewMode, setViewMode, VIEW_MODE_PROPERTIES, VIEW_MODE_UNITS } = useViewMode();

// Sync viewMode with current route on mount
onMounted(() => {
  const currentRoute = router.currentRoute.value;
  
  // Set viewMode based on what page we're on
  if (currentRoute.name === 'UnitList') {
    if (viewMode.value !== VIEW_MODE_UNITS) {
      setViewMode(VIEW_MODE_UNITS);
    }
  } else if (currentRoute.name === 'PropertyList') {
    if (viewMode.value !== VIEW_MODE_PROPERTIES) {
      setViewMode(VIEW_MODE_PROPERTIES);
    }
  }
});

// Watch for mode changes and navigate accordingly
watch(viewMode, (newMode) => {
  const currentRoute = router.currentRoute.value;
  
  // Only navigate if we're on properties or units list
  if (currentRoute.name === 'PropertyList' || currentRoute.name === 'UnitList') {
    if (newMode === VIEW_MODE_UNITS && currentRoute.name !== 'UnitList') {
      router.push({ name: 'UnitList' });
    } else if (newMode === VIEW_MODE_PROPERTIES && currentRoute.name !== 'PropertyList') {
      router.push({ name: 'PropertyList' });
    }
  }
});
</script>

<style scoped>
.view-mode-toggle {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
}

.toggle-btn:hover {
  color: #475569;
}

.toggle-btn.active {
  background: white;
  color: #1976D2;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-btn .material-icons {
  font-size: 1.125rem;
}

.toggle-label {
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 640px) {
  .toggle-label {
    display: none;
  }
  
  .toggle-btn {
    padding: 0.5rem 0.75rem;
  }
}
</style>
