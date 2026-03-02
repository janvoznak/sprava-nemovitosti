<template>
  <transition name="dropdown-fade">
    <div v-if="isOpen" class="user-dropdown">
      <div class="dropdown-header">
        <div class="user-info">
          <div class="user-name">Jan Novák</div>
          <div class="user-role">Administrátor</div>
        </div>
      </div>
      
      <div class="dropdown-items">
        <button class="dropdown-item" @click="$emit('action', 'profile')">
          <span class="material-icons">account_circle</span>
          <span>Můj profil</span>
        </button>
        
        <div class="divider"></div>
        
        <button class="dropdown-item logout" @click="$emit('action', 'logout')">
          <span class="material-icons">logout</span>
          <span>Odhlásit se</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: Boolean
});

defineEmits(['action']);
</script>

<style scoped>
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.75rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  width: 240px;
  overflow: hidden;
  color: #0f172a;
  z-index: 100;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.dropdown-items {
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dropdown-item .material-icons {
  font-size: 20px;
  color: #94a3b8;
}

.dropdown-item:hover .material-icons {
  color: #3b82f6;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.5rem 0;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout .material-icons {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
