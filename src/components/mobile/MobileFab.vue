<template>
  <div class="mobile-fab-container">
    <transition name="pop">
      <div v-if="isOpen" class="fab-menu">
        <button class="fab-menu-item" @click="$emit('action', 'search')">
          <span class="material-icons">search</span>
          <span class="fab-label">Hledat</span>
        </button>
        <button class="fab-menu-item" @click="$emit('action', 'new-issue')">
          <span class="material-icons">build</span>
          <span class="fab-label">Závada</span>
        </button>
        <button class="fab-menu-item" @click="$emit('action', 'new-note')">
          <span class="material-icons">edit_note</span>
          <span class="fab-label">Poznámka</span>
        </button>
      </div>
    </transition>

    <button class="fab-main" @click="toggleMenu" :class="{ 'open': isOpen }">
      <span class="material-icons">{{ isOpen ? 'close' : 'add' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
const emit = defineEmits(['action']);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.mobile-fab-container {
  display: none; /* Hidden on desktop */
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 99;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.fab-main:active {
  transform: scale(0.95);
}

.fab-main.open {
  background: #1e293b;
  transform: rotate(90deg);
}

.fab-main .material-icons {
  font-size: 24px;
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white; /* Transparent button, just icon and label */
  border: none;
  cursor: pointer;
  padding: 0;
}

.fab-menu-item .material-icons {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 20px;
}

.fab-label {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Animation */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

@media (max-width: 640px) {
  .mobile-fab-container {
    display: flex;
    bottom: 90px; /* Above action bar */
    right: 1.5rem;
  }
}
</style>
