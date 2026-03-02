<script setup>
import { computed, ref } from 'vue';
import PropertyRow from './PropertyRow.vue';
import PropertyUnitsTable from './PropertyUnitsTable.vue';

const props = defineProps({
  properties: {
    type: Array,
    required: true
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['preview', 'delete', 'update:selectedIds', 'quick-contact', 'quick-contract', 'quick-maintenance', 'quick-payment']);

const headers = [
  'ID',
  'Nemovitost',
  'Typ',
  'Stav',
  'Obsazenost',
  'Revize', 
  'Scoring',  // Changed from Kauce
  'Měsíční nájem',
  '' // Actions
];

const expandedIds = ref([]);

const toggleExpand = (id) => {
  const index = expandedIds.value.indexOf(id);
  if (index === -1) {
    expandedIds.value.push(id);
  } else {
    expandedIds.value.splice(index, 1);
  }
};

const toggleSelection = (id) => {
  const newSelection = [...props.selectedIds];
  const index = newSelection.indexOf(id);
  if (index === -1) {
    newSelection.push(id);
  } else {
    newSelection.splice(index, 1);
  }
  emit('update:selectedIds', newSelection);
};

const allSelected = computed(() => {
  return props.properties.length > 0 && props.selectedIds.length === props.properties.length;
});

const someSelected = computed(() => {
  return props.selectedIds.length > 0;
});

const toggleSelectAll = () => {
  if (allSelected.value) {
    emit('update:selectedIds', []);
  } else {
    emit('update:selectedIds', props.properties.map(p => p.id));
  }
};
</script>

<template>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px;">
          <input 
            type="checkbox" 
            :checked="allSelected" 
            :indeterminate="someSelected && !allSelected"
            @change="toggleSelectAll"
          >
        </th>
        <th 
          v-for="header in headers" 
          :key="header"
          :style="{ textAlign: header === 'Měsíční nájem' ? 'right' : 'left' }"
        >
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="property in properties" :key="property.id">
        <PropertyRow 
          :property="property"
          :expanded="expandedIds.includes(property.id)" 
          :selected="selectedIds.includes(property.id)"
          @preview="(id) => $emit('preview', id)"
          @delete="(id) => $emit('delete', id)"
          @toggle-expand="toggleExpand"
          @select="toggleSelection"
          @quick-contact="(id) => $emit('quick-contact', id)"
          @quick-contract="(id) => $emit('quick-contract', id)"
          @quick-maintenance="(id) => $emit('quick-maintenance', id)"
          @quick-payment="(id) => $emit('quick-payment', id)"
        />
        <tr v-if="expandedIds.includes(property.id)" class="units-row">
          <td colspan="10" style="padding: 0;">
             <PropertyUnitsTable :units="property.units" />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 1rem 1.5rem; /* Increased padding */
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* Animation for expansion */
.units-row td {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
