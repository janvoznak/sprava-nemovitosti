<template>
  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-icon green">
        <span class="material-icons">business</span>
      </div>
      <div class="stat-content">
        <div class="stat-label">Celkem jednotek</div>
        <div class="stat-value">{{ totalUnits }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon blue">
        <span class="material-icons">check_circle</span>
      </div>
      <div class="stat-content">
        <div class="stat-label">Pronajato</div>
        <div class="stat-value">{{ occupiedUnits }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon orange">
        <span class="material-icons">meeting_room</span>
      </div>
      <div class="stat-content">
        <div class="stat-label">Volné jednotky</div>
        <div class="stat-value">{{ vacantUnits }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalUnits: {
    type: Number,
    required: true
  },
  occupiedUnits: {
    type: Number,
    required: true
  },
  vacantUnits: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.green {
  background: #dcfce7;
  color: #166534;
}

.stat-icon.blue {
  background: #dbeafe;
  color: #1e40af;
}

.stat-icon.orange {
  background: #ffedd5;
  color: #9a3412;
}

.stat-label {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
