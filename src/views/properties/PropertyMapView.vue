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
          <input
            v-model="search"
            type="text"
            placeholder="Hledat nemovitost..."
            class="search-input"
          />
        </div>

        <div v-if="loading" class="loading-list">
          <div class="mini-spinner"></div>
        </div>

        <div v-else class="properties-list">
          <div
            v-for="prop in filteredProperties"
            :key="prop.id"
            class="property-card"
            :class="{ active: selectedId === prop.id }"
            @click="selectProperty(prop)"
          >
            <div class="prop-icon">
              <span class="material-icons">{{ getIcon(prop.type) }}</span>
            </div>
            <div class="prop-info">
              <div class="prop-name">{{ prop.name }}</div>
              <div class="prop-addr">{{ prop.street }}, {{ prop.city }}</div>
              <div class="prop-meta">
                <span class="occupancy-badge" :class="getOccupancyClass(prop.occupancyPercentage)">
                  {{ prop.occupancyPercentage }}% obsazeno
                </span>
              </div>
            </div>
          </div>

          <div v-if="filteredProperties.length === 0" class="empty-list">
            <span class="material-icons">search_off</span>
            <p>Žádné výsledky</p>
          </div>
        </div>
      </div>

      <!-- Leaflet Map -->
      <div class="map-container">
        <l-map
          ref="mapRef"
          :zoom="zoom"
          :center="center"
          class="leaflet-map"
          @ready="onMapReady"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <l-marker
            v-for="prop in propertiesWithCoords"
            :key="prop.id"
            :lat-lng="[prop.lat, prop.lng]"
            @click="selectProperty(prop)"
          >
            <l-popup>
              <div class="popup-content">
                <strong>{{ prop.name }}</strong>
                <p class="popup-addr">{{ prop.street }}, {{ prop.city }}</p>
                <div class="popup-stats">
                  <span>{{ prop.occupancyRatio }} obsazeno</span>
                  <span>{{ prop.type }}</span>
                </div>
                <button class="popup-btn" @click="goToDetail(prop.id)">
                  Zobrazit detail →
                </button>
              </div>
            </l-popup>
          </l-marker>
        </l-map>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { propertyService } from '@/services/propertyService';

// Fix Leaflet default icon paths broken by Vite
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const router = useRouter();
const mapRef = ref(null);
const loading = ref(true);
const allProperties = ref([]);
const selectedId = ref(null);
const search = ref('');

const zoom = ref(7);
const center = ref([49.8, 15.5]); // Centrum ČR

onMounted(async () => {
  try {
    allProperties.value = await propertyService.getProperties();
  } finally {
    loading.value = false;
  }
});

const propertiesWithCoords = computed(() =>
  allProperties.value.filter(p => p.lat && p.lng)
);

const filteredProperties = computed(() => {
  if (!search.value.trim()) return propertiesWithCoords.value;
  const q = search.value.toLowerCase();
  return propertiesWithCoords.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.city.toLowerCase().includes(q) ||
    p.street.toLowerCase().includes(q)
  );
});

const selectProperty = (prop) => {
  selectedId.value = prop.id;
  if (prop.lat && prop.lng && mapRef.value?.leafletObject) {
    mapRef.value.leafletObject.flyTo([prop.lat, prop.lng], 14, { duration: 1 });
  }
};

const goToDetail = (id) => {
  router.push({ name: 'PropertyDetail', params: { id } });
};

const getIcon = (type) => {
  const map = { 'Bytový dům': 'apartment', 'Rodinný dům': 'home', 'Komerční': 'store' };
  return map[type] || 'business';
};

const getOccupancyClass = (pct) => {
  if (pct >= 80) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
};

const onMapReady = () => {
  // Map is ready
};
</script>

<style scoped>
.map-view {
  height: calc(100vh - 80px);
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
  margin-bottom: 1.5rem;
}

.map-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  flex: 1;
  gap: 1.5rem;
  overflow: hidden;
  min-height: 0;
}

/* Sidebar */
.properties-sidebar {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus { border-color: #2563eb; }

.properties-list {
  flex: 1;
  overflow-y: auto;
}

.property-card {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.property-card:hover { background: #f8fafc; }
.property-card.active { background: #eff6ff; border-left: 3px solid #2563eb; }

.prop-icon {
  width: 36px; height: 36px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.property-card.active .prop-icon { background: #dbeafe; color: #2563eb; }

.prop-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
.prop-addr { font-size: 0.8rem; color: #64748b; margin: 2px 0; }
.prop-meta { margin-top: 4px; }

.occupancy-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.occupancy-badge.high { background: #dcfce7; color: #166534; }
.occupancy-badge.mid  { background: #fef9c3; color: #713f12; }
.occupancy-badge.low  { background: #fee2e2; color: #991b1b; }

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94a3b8;
  gap: 0.5rem;
}
.empty-list .material-icons { font-size: 2rem; }

.loading-list {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.mini-spinner {
  width: 28px; height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Map */
.map-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  min-height: 0;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* Popup */
.popup-content {
  min-width: 180px;
}

.popup-content strong {
  display: block;
  font-size: 0.95rem;
  color: #0f172a;
  margin-bottom: 4px;
}

.popup-addr {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 8px;
}

.popup-stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #475569;
  margin-bottom: 10px;
}

.popup-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s;
}

.popup-btn:hover { background: #1d4ed8; }

@media (max-width: 768px) {
  .map-layout { grid-template-columns: 1fr; }
  .properties-sidebar { height: 200px; }
}
</style>
