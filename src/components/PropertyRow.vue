<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import ActionMenu from './ActionMenu.vue';
import PropertyScoreBadge from './property/PropertyScoreBadge.vue';

const router = useRouter();

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const goToProperty = () => {
  router.push(`/properties/${props.property.id}`);
};

const vacantUnits = computed(() => {
  if (!props.property.units) return [];
  return props.property.units
    .filter(u => u.status === 'Volné' || !u.tenant || u.tenant === '-')
    .map(u => u.label);
});

const formatRent = (rent) => {
  if (!rent) return '-';
  // Extract number from string like "49797 Kč"
  const num = parseInt(rent.toString().replace(/\D/g, ''));
  if (isNaN(num)) return rent;
  
  return new Intl.NumberFormat('cs-CZ').format(num) + ' Kč';
};
</script>

<template>
  <tr @click="goToProperty" class="cursor-pointer row-hover" :class="{ 'expanded': expanded, 'selected': selected }">
    <td @click.stop class="checkbox-cell">
      <div class="selection-cell">
        <button class="expand-btn" @click.stop="$emit('toggle-expand', property.id)">
           <span class="material-icons">{{ expanded ? 'expand_more' : 'chevron_right' }}</span>
        </button>
        <input 
          type="checkbox" 
          class="modern-checkbox" 
          :checked="selected"
          @change="$emit('select', property.id)"
          @click.stop
        >
        <span v-if="property.isParent" title="Hlavní nemovitost" class="material-icons text-blue">domain</span>
      </div>
    </td>
    <td>
      <span class="property-id">{{ property.id }}</span>
    </td>
    <td>
      <div class="property-cell">
        <div class="property-main-info">
          <span class="property-nm" :title="property.name">{{ property.name }}</span>
          <span class="property-loc" :title="property.city">{{ property.city }}</span>
        </div>
      </div>
    </td>
    <td>
      <div class="type-badge">
        <span class="material-icons type-icon">apartment</span>
        <span>{{ property.type }}</span>
      </div>
    </td>
    <td>
      <span :class="['status-badge', property.status === 'Aktivní' ? 'active' : 'renovation']">
        <span class="status-dot"></span>
        {{ property.status }}
      </span>
      <!-- Debt Indicator -->
      <div v-if="property.hasDebt" class="debt-indicator" title="Evidován dluh">
        <span class="debt-dot"></span>
        <span class="debt-label">Dluh</span>
      </div>
    </td>
    <td>
      <div class="occupancy-container">
        <div class="occupancy-header">
          <span class="occupancy-ratio">{{ property.occupancyRatio }}</span>
          <span class="occupancy-percent">{{ property.occupancyPercentage }}%</span>
        </div>
        <div class="occupancy-bar-bg">
          <div class="occupancy-bar-fill" :style="{ width: property.occupancyPercentage + '%' }"></div>
        </div>
        
        <!-- Hover Tooltip -->
        <div class="occupancy-tooltip" v-if="vacantUnits.length > 0">
          <div class="tooltip-title">Volné jednotky:</div>
          <ul class="tooltip-list">
            <li v-for="unitName in vacantUnits" :key="unitName">{{ unitName }}</li>
          </ul>
        </div>
      </div>
    </td>
    <!-- Revisions Column -->
    <td>
      <div class="progress-col">
        <div class="progress-header">
          <span class="text-xs font-medium">{{ property.revisionStatus.valid }}/{{ property.revisionStatus.total }}</span>
          <span v-if="property.revisionStatus.expired" class="material-icons icon-tiny text-red">error</span>
          <span v-else-if="property.revisionStatus.expiring" class="material-icons icon-tiny text-orange">warning</span>
          <span v-else class="material-icons icon-tiny text-green">check_circle</span>
        </div>
        <div class="progress-mini-bg">
           <div 
             class="progress-mini-fill" 
             :class="property.revisionStatus.expired ? 'bg-red' : property.revisionStatus.expiring ? 'bg-orange' : 'bg-green'"
             :style="{ width: (property.revisionStatus.valid / property.revisionStatus.total * 100) + '%' }"
           ></div>
        </div>
      </div>
    </td>
    <!-- Scoring Column -->
    <td>
      <PropertyScoreBadge :property="property" />
    </td>
    <td class="rent-cell">
      <span class="price-normal">{{ formatRent(property.rent) }}</span>
    </td>
    <td @click.stop class="actions-cell">
      <div class="action-wrapper">
        <!-- Menu Action -->
        <button class="action-btn menu-btn" @click.stop="toggleMenu" title="Více akcí">
          <span class="material-icons">more_vert</span>
        </button>
      </div>
      <ActionMenu 
        v-if="showMenu" 
        @close="showMenu = false" 
        @action="(action) => { 
          showMenu = false; 
          if (action === 'preview') $emit('preview', property.id);
          else if (action === 'delete') $emit('delete', property.id);
          else if (action === 'quick-contact') $emit('quick-contact', property.id);
          else if (action === 'quick-contract') $emit('quick-contract', property.id);
          else if (action === 'quick-maintenance') $emit('quick-maintenance', property.id);
          else if (action === 'quick-payment') $emit('quick-payment', property.id);
          else if (action === 'edit') $emit('preview', property.id); // Placeholder for edit
        }" 
      />
    </td>
  </tr>
</template>

<style scoped>
tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

tr:hover, tr.expanded, tr.selected {
  background-color: #f8fafc;
}

tr.selected {
  background-color: #eff6ff;
}

tr.expanded {
  border-bottom-color: transparent;
}

tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Lift effect */
  z-index: 10;
  position: relative;
}

td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
}

.cursor-pointer { cursor: pointer; }

/* Custom Checkbox Placeholder */
.expand-btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0;
  margin-right: 4px;
}
.expand-btn:hover { color: #3b82f6; }

.modern-checkbox {
  accent-color: #2563eb;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.selection-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-id {
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  letter-spacing: 0.025em;
}

.img-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.property-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

tr:hover .property-img {
  transform: scale(1.1);
}

.property-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.property-main-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-nm {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.property-loc {
  font-size: 0.815rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
}
.type-icon { font-size: 18px; color: #94a3b8; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.active { background: #DCFCE7; color: #166534; }
.status-badge.renovation { background: #FEF3C7; color: #B45309; }

.occupancy-container {
  width: 140px;
}

.occupancy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.occupancy-ratio { color: #0f172a; }
.occupancy-percent { color: #64748b; }

.occupancy-bar-bg {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.occupancy-bar-fill {
  background: linear-gradient(90deg, #3B82F6, #2563eb);
  border-radius: 99px;
  height: 100%;
}

/* Tooltip */
.occupancy-container {
  position: relative;
  width: 140px;
}

.occupancy-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: #1e293b;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  z-index: 20;
  min-width: 140px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  pointer-events: none;
}

.occupancy-container:hover .occupancy-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.occupancy-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

.tooltip-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.tooltip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tooltip-list li {
  margin-bottom: 2px;
  white-space: nowrap;
}

.price-normal {
  font-weight: 500;
  color: #475569;
  font-size: 0.875rem;
  letter-spacing: -0.01em;
}

.rent-cell {
  text-align: right;
}

.action-wrapper {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn .material-icons { font-size: 20px; }

.action-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.delete-btn:hover {
  background: #FEF2F2;
  color: #EF4444;
}

.actions-cell {
  position: relative;
}

/* Debt Indicator */
.debt-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.7rem;
  color: #ef4444;
  font-weight: 600;
}

.debt-dot {
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Revisions Progress */
.progress-col {
  width: 100px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.progress-mini-bg {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-mini-fill {
  height: 100%;
  border-radius: 2px;
}

.bg-red { background-color: #ef4444; }
.bg-orange { background-color: #f97316; }
.bg-green { background-color: #10b981; }

.text-red { color: #ef4444; }
.text-orange { color: #f97316; }
.text-green { color: #10b981; }
.icon-tiny { font-size: 14px; }

/* Scoring Styles */
.scoring-container {
  display: flex;
  justify-content: center;
}

.score-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  border: 2px solid currentColor;
}

.score-badge.green { color: #10b981; background: #ecfdf5; border-color: #10b981; }
.score-badge.amber { color: #f59e0b; background: #fffbeb; border-color: #f59e0b; }
.score-badge.red { color: #ef4444; background: #fef2f2; border-color: #ef4444; }

.score-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: white;
  color: #0f172a;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  z-index: 50;
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  pointer-events: none;
  transition: all 0.2s;
}

.scoring-container:hover .score-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: #64748b;
}

.tooltip-row.total {
  color: #0f172a;
  font-weight: 600;
  margin-bottom: 0;
  font-size: 0.85rem;
}

.tooltip-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 6px 0;
}
</style>
