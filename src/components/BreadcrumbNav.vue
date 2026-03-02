<template>
  <nav class="breadcrumb-nav" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <template v-if="index < items.length - 1">
        <router-link v-if="item.to" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-text">
          {{ item.label }}
        </span>
        <span class="breadcrumb-separator">/</span>
      </template>
      <span v-else class="breadcrumb-current">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // Each item: { label: String, to: [String, Object] }
  }
});
</script>

<style scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.breadcrumb-link:hover {
  color: #2563eb;
}

.breadcrumb-text {
  color: #64748b;
}

.breadcrumb-separator {
  color: #cbd5e1;
  user-select: none;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 500;
}
</style>
