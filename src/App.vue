<script setup>
import Sidebar from '@/components/Sidebar.vue';
import TopHeader from '@/components/TopHeader.vue';
</script>

<template>
  <div class="layout-container">
    <Sidebar />
    
    <main class="main-content-wrapper">
      <TopHeader />
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: #f8fafc;
}

.layout-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem; /* Reduced top/bottom padding slightly */
  background: #f8fafc;
}

/* Error Banner - Global */
.error-banner {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: slideDown 0.3s ease-out;
}

.error-icon {
  font-size: 1.5rem;
}

.error-message {
  flex: 1;
  color: #991b1b;
  font-weight: 500;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #dc2626;
}

/* Loading Container - Global */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>