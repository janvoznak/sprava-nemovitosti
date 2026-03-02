<template>
  <div class="calendar-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Údržba', to: '/maintenance' },
      { label: 'Kalendář' }
    ]" />

    <div class="header-section">
      <h1 class="page-title">Kalendář údržby</h1>
      <div class="view-controls">
        <button class="nav-btn" @click="changeMonth(-1)">
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="current-month">{{ currentMonthName }} {{ currentYear }}</span>
        <button class="nav-btn" @click="changeMonth(1)">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
      <button class="btn-primary" @click="handleNewEvent">
        <span class="material-icons">add</span> Nová událost
      </button>
    </div>

    <div class="calendar-container">
      <!-- Main Calendar Grid -->
      <div class="calendar-grid">
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="day-cell"
            :class="{ 
              'other-month': !day.isCurrentMonth,
              'today': isToday(day.date),
              'selected': isSelected(day.date)
            }"
            @click="selectDate(day.date)"
          >
            <span class="day-number">{{ day.date.getDate() }}</span>
            <div class="day-events">
              <div 
                v-for="event in getEventsForDate(day.date)" 
                :key="event.id"
                class="event-dot"
                :class="event.type"
                :title="event.title"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Tasks -->
      <div class="calendar-sidebar">
        <h3 class="sidebar-title">
          {{ selectedDate ? formatDate(selectedDate) : 'Vyberte den' }}
        </h3>
        
        <div v-if="selectedDayEvents.length > 0" class="events-list">
          <div 
            v-for="event in selectedDayEvents" 
            :key="event.id" 
            class="event-card interactive"
            :class="event.type"
            @click="handleEventClick(event)"
          >
            <div class="event-time">{{ event.time }}</div>
            <div class="event-details">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-subtitle">{{ event.property }}</div>
            </div>
            <span class="material-icons arrow-icon">arrow_forward</span>
          </div>
        </div>
        <div v-else class="no-events">
          <span class="material-icons">event_busy</span>
          <p>Žádné události pro tento den</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';

const route = useRoute();
const router = useRouter();

const weekdays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const currentDate = ref(new Date());
const selectedDate = ref(new Date());

const handleEventClick = (event) => {
  // Logic to determine target property and tab
  // For demo purposes, we map specific events to properties
  // In real app, event object would allow propertyId
  
  let propertyId = 'P0001'; // Default
  if (event.property.includes('Novák') || event.property.includes('Kovář') || event.property.includes('301')) propertyId = 'P0002';
  if (event.property.includes('42')) propertyId = 'P0001';
  
  const query = {};
  if (event.type === 'revision') query.tab = 'technical';
  if (event.type === 'contract') query.tab = 'tenants'; // Maps to finance/tenants
  if (event.type === 'repair' || event.type === 'maintenance') query.tab = 'technical';

  router.push({ name: 'PropertyDetail', params: { id: propertyId }, query });
};

const handleNewEvent = () => {
    // Navigate to the create form
    router.push('/maintenance/new');
};

// Initialize from URL
const initDateFromUrl = () => {
  if (route.query.date) {
    const [year, month, day] = route.query.date.split('-').map(Number);
    if (year && month && day) {
      const newDate = new Date(year, month - 1, day);
      currentDate.value = newDate;
      selectedDate.value = newDate;
    }
  }
};

onMounted(() => {
  initDateFromUrl();
});

watch(() => route.query.date, () => {
  initDateFromUrl();
});

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('cs-CZ', { month: 'long' });
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth(); // 0-indexed

// Mock Events (Synced with Dashboard)
const events = ref([
  // Existing + Dashboard items
  { id: 1, date: new Date(thisYear, thisMonth, 3), time: '09:00', title: 'Revize plynu', property: 'Bytový dům Na Kopci', type: 'revision' },
  { id: 2, date: new Date(thisYear, thisMonth, 3), time: '14:00', title: 'Podpis smlouvy', property: 'Villa Nová', type: 'contract' },
  { id: 3, date: new Date(thisYear, thisMonth, 5), time: '10:00', title: 'Oprava topení', property: 'Byt 301', type: 'repair' },
  { id: 4, date: new Date(thisYear, thisMonth, 12), time: '13:00', title: 'Kontrola hasičáků', property: 'Všechny objekty', type: 'revision' },
  
  // Dashboard Items
  { id: 10, date: new Date(thisYear, 1, 15), time: '08:00', title: 'Splatnost nájemného', property: 'Automatická kontrola', type: 'contract' }, 
  { id: 11, date: new Date(thisYear, 1, 20), time: '10:00', title: 'Revize plynu', property: 'Václavské nám. 42', type: 'revision' },
  { id: 12, date: new Date(thisYear, 1, 25), time: '14:00', title: 'Konec smlouvy', property: 'Byt 301 - Kovář', type: 'contract' },

  { id: 5, date: new Date(thisYear, thisMonth, 15), time: '08:00', title: 'Úklid sněhu', property: 'Exteriéry', type: 'maintenance' },
  { id: 6, date: new Date(), time: '09:30', title: 'Předání bytu', property: 'Centrum A2', type: 'contract' },
  { id: 7, date: new Date(), time: '15:00', title: 'Výměna zámku', property: 'Sklad B', type: 'repair' }
]);

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + delta);
  currentDate.value = newDate;
};

const getEventsForDate = (date) => {
  return events.value.filter(e => 
    e.date.getDate() === date.getDate() && 
    e.date.getMonth() === date.getMonth() && 
    e.date.getFullYear() === date.getFullYear()
  );
};

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return [];
  return getEventsForDate(selectedDate.value);
});

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

const isSelected = (date) => {
  return selectedDate.value && 
         date.getDate() === selectedDate.value.getDate() && 
         date.getMonth() === selectedDate.value.getMonth() && 
         date.getFullYear() === selectedDate.value.getFullYear();
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const formatDate = (date) => {
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
};

// Calendar Grid Logic
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // 0 = Sunday, 1 = Monday. We want Monday=0, Sunday=6
  let firstDayWeekday = firstDayOfMonth.getDay() - 1; 
  if (firstDayWeekday === -1) firstDayWeekday = 6;
  
  const days = [];
  
  // Previous Month Padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }
  
  // Current Month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Next Month Padding
  const remainingCells = 42 - days.length; // 6 rows of 7
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }
  
  return days;
});
</script>

<style scoped>
/* ... existing styles ... */
/* Add interaction styles */
.event-card.interactive {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-card.interactive:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.arrow-icon {
  opacity: 0;
  transition: opacity 0.2s;
  color: #64748b;
  font-size: 18px;
}

.event-card.interactive:hover .arrow-icon {
  opacity: 1;
}

.calendar-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #64748b;
}

.nav-btn:hover { background: #f1f5f9; color: #0f172a; }

.current-month {
  font-weight: 600;
  font-size: 1.125rem;
  min-width: 140px;
  text-align: center;
  text-transform: capitalize;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

/* Grid Styles */
.calendar-grid {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.weekday {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 120px;
}

.day-cell {
  position: relative;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.day-cell:nth-child(7n) { border-right: none; }
.day-cell:hover { background: #f8fafc; }
.day-cell.selected { background: #eff6ff; }
.day-cell.today { background: #fffbeb; }

.day-number {
  font-weight: 600;
  color: #334155;
}

.other-month {
  background: #fcfcfc;
  color: #cbd5e1;
}

.day-events {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.event-dot.revision { background: #ef4444; } /* Red */
.event-dot.contract { background: #3b82f6; } /* Blue */
.event-dot.repair { background: #22c55e; } /* Green */
.event-dot.maintenance { background: #f59e0b; } /* Orange */


/* Sidebar Styles */
.calendar-sidebar {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 400px;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
  text-transform: capitalize;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  background: #f8fafc;
}

.event-card.revision { border-color: #ef4444; background: #fef2f2; }
.event-card.contract { border-color: #3b82f6; background: #eff6ff; }
.event-card.repair { border-color: #22c55e; background: #f0fdf4; }
.event-card.maintenance { border-color: #f59e0b; background: #fffbeb; }

.event-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.event-title {
  font-weight: 600;
  color: #0f172a;
}

.event-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 2px;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #94a3b8;
  gap: 1rem;
}

.no-events .material-icons { font-size: 3rem; opacity: 0.5; }

@media (max-width: 1024px) {
  .calendar-container {
    grid-template-columns: 1fr;
  }
}
</style>
