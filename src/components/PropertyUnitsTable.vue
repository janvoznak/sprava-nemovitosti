<template>
  <div class="units-table-wrapper">
    <table class="units-table">
      <thead>
        <tr>
          <th>Jednotka</th>
          <th>Nájemník</th>
          <th>Nájem</th>
          <th>Stav</th>
          <th>Platnost</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in units" :key="unit.id">
          <td>
            <div class="unit-cell">
              <span class="material-icons icon-tiny">meeting_room</span>
              <span class="unit-label">{{ unit.label }}</span>
            </div>
          </td>
          <td>{{ unit.tenant }}</td>
          <td>{{ unit.rent }} Kč</td>
          <td>
            <span class="status-badge" :class="unit.status === 'Pronajato' ? 'occupied' : 'vacant'">
              {{ unit.status }}
            </span>
          </td>
          <td class="text-muted">{{ unit.validity }}</td>
          <td class="text-right">
             <button class="icon-btn-small" title="Detail jednotky">
                <span class="material-icons">chevron_right</span>
             </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  units: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.units-table-wrapper {
  background: #f8fafc;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: inset 0 4px 6px -4px rgba(0,0,0,0.05);
}

.units-table {
  width: 100%;
  border-collapse: collapse;
}

.units-table th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.units-table td {
  padding: 0.75rem 0;
  font-size: 0.85rem;
  color: #475569;
  border-bottom: 1px dashed #e2e8f0;
}

.units-table tr:last-child td {
  border-bottom: none;
}

.unit-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.icon-tiny {
  font-size: 16px;
  color: #cbd5e1;
}

.status-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 600;
}
.status-badge.occupied { background: #dcfce7; color: #166534; }
.status-badge.vacant { background: #fee2e2; color: #991b1b; }

.text-muted { color: #94a3b8; font-size: 0.8rem; }
.text-right { text-align: right; }

.icon-btn-small {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}
.icon-btn-small:hover {
  background: #e2e8f0;
  color: #475569;
}
</style>
