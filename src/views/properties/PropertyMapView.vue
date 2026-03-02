<template>
  <div class="map-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Nemovitosti', to: '/properties' },
      { label: 'Mapa' }
    ]" />

    <h1 class="page-title">Mapa nemovitostí</h1>

    <div class="map-layout">
      <!-- Sidebar List -->
      <div class="properties-sidebar">
        <div class="sidebar-header">
          <input type="text" placeholder="Hledat adresu..." class="search-input">
          <button class="filter-btn">
            <span class="material-icons">tune</span>
          </button>
        </div>

        <div class="properties-list">
          <div 
            v-for="prop in properties" 
            :key="prop.id"
            class="property-card"
            :class="{ active: selectedId === prop.id }"
            @click="selectProperty(prop.id)"
          >
            <div class="prop-icon">
              <span class="material-icons">{{ getIcon(prop.type) }}</span>
            </div>
            <div class="prop-info">
              <div class="prop-name">{{ prop.name }}</div>
              <div class="prop-addr">{{ prop.street }}, {{ prop.city }}</div>
              <div class="prop-status" :class="prop.status">
                {{ prop.statusLabel }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Area (Mock) -->
      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-bg"></div>
          
          <!-- Mock Pins -->
          <div 
            v-for="prop in properties" 
            :key="prop.id"
            class="map-pin"
            :class="{ active: selectedId === prop.id }"
            :style="{ top: prop.y + '%', left: prop.x + '%' }"
            @click="selectProperty(prop.id)"
          >
            <span class="material-icons">location_on</span>
            <div class="pin-tooltip">{{ prop.name }}</div>
          </div>

          <!-- Zoom Controls -->
          <div class="map-controls">
            <button><span class="material-icons">add</span></button>
            <button><span class="material-icons">remove</span></button>
            <button><span class="material-icons">my_location</span></button>
          </div>
        </div>

        <!-- Selected Property Detail Overlay -->
        <transition name="slide-up">
          <div v-if="selectedProperty" class="map-detail-card">
            <div class="detail-header">
              <h3>{{ selectedProperty.name }}</h3>
              <button @click="selectedId = null" class="close-btn">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="detail-body">
              <img :src="selectedProperty.image" alt="Property" class="detail-img">
              <div class="detail-stats">
                <div class="stat">
                  <span class="label">Jednotek</span>
                  <span class="val">{{ selectedProperty.units }}</span>
                </div>
                <div class="stat">
                  <span class="label">Obsazenost</span>
                  <span class="val">{{ selectedProperty.occupancy }}%</span>
                </div>
              </div>
              <button class="btn-primary full-width" @click="goToDetail(selectedProperty.id)">
                Zobrazit detail
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';

const router = useRouter();
const selectedId = ref(null);

const properties = ref([
  { 
    id: 1, name: 'Bytový dům Na Kopci', street: 'Na Kopci 123', city: 'Praha 5', 
    type: 'apartment', status: 'ok', statusLabel: 'V pořádku',
    units: 12, occupancy: 92, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    x: 40, y: 30 
  },
  { 
    id: 2, name: 'Villa Nová', street: 'Vila Nova 45', city: 'Praha 6', 
    type: 'house', status: 'warning', statusLabel: 'Oprava střechy',
    units: 3, occupancy: 100, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d',
    x: 65, y: 45 
  },
  { 
    id: 3, name: 'Komerční centrum A2', street: 'Průmyslová 88', city: 'Brno', 
    type: 'commercial', status: 'ok', statusLabel: 'V pořádku',
    units: 15, occupancy: 85, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    x: 25, y: 70 
  },
   { 
    id: 4, name: 'Apartmány Slunečná', street: 'Slunečná 12', city: 'Lipno', 
    type: 'apartment', status: 'ok', statusLabel: 'V pořádku',
    units: 8, occupancy: 50, image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    x: 55, y: 75 
  }
]);

const selectedProperty = computed(() => 
  properties.value.find(p => p.id === selectedId.value)
);

const selectProperty = (id) => {
  selectedId.value = id;
};

const goToDetail = (id) => {
  router.push({ name: 'PropertyDetail', params: { id } });
};

const getIcon = (type) => {
  const map = { apartment: 'apartment', house: 'home', commercial: 'store' };
  return map[type] || 'business';
};
</script>

<style scoped>
.map-view {
  height: calc(100vh - 80px); /* Adjust based on header height */
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

.map-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  flex: 1;
  gap: 1.5rem;
  overflow: hidden;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

/* Sidebar */
.properties-sidebar {
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.filter-btn {
  padding: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
}

.properties-list {
  flex: 1;
  overflow-y: auto;
}

.property-card {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.property-card:hover { background: #f8fafc; }
.property-card.active { background: #eff6ff; border-left: 3px solid #3b82f6; }

.prop-icon {
  width: 40px; height: 40px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.property-card.active .prop-icon { background: #dbeafe; color: #2563eb; }

.prop-name { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
.prop-addr { font-size: 0.85rem; color: #64748b; margin: 2px 0; }
.prop-status { font-size: 0.75rem; font-weight: 500; }
.prop-status.ok { color: #16a34a; }
.prop-status.warning { color: #d97706; }

/* Map Area */
.map-container {
  position: relative;
  background: #eff6ff;
  overflow: hidden;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="%23e2e8f0"><path d="M0 0h100v100H0z" fill="white"/><path d="M20 0v100M40 0v100M60 0v100M80 0v100M0 20h100M0 40h100M0 60h100M0 80h100" stroke="%23f1f5f9" stroke-width="2"/></g></svg>');
}

.map-controls {
  position: absolute;
  right: 1rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.map-controls button {
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px; height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.map-controls button:hover { background: #f8fafc; color: #0f172a; }

/* Pins */
.map-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  color: #ef4444;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}
.map-pin .material-icons { font-size: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }

.map-pin:hover { transform: translate(-50%, -110%) scale(1.1); color: #dc2626; }
.map-pin.active { color: #2563eb; transform: translate(-50%, -110%) scale(1.2); z-index: 20; }

.pin-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.map-pin:hover .pin-tooltip { opacity: 1; }

/* Detail Overlay */
.map-detail-card {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 30;
}

.detail-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-header h3 { margin: 0; font-size: 1rem; }
.close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; }

.detail-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.detail-body { padding: 1rem; }

.detail-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.stat { display: flex; flex-direction: column; }
.stat .label { font-size: 0.75rem; color: #64748b; }
.stat .val { font-weight: 600; color: #0f172a; }

.full-width { width: 100%; justify-content: center; }

@media (max-width: 768px) {
  .map-layout { grid-template-columns: 1fr; }
  .properties-sidebar { height: 200px; order: 2; }
}
</style>
