<template>
  <div class="tenant-list-view">
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <router-link to="/">Dashboard</router-link>
      <span class="separator">›</span>
      <span>Adresář</span>
      <span class="separator">›</span>
      <span class="current">Přehled</span>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Nájemníci</h1>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-icon-only" @click="showFilterModal = true" title="Filtrovat">
          <span class="material-icons">filter_list</span>
        </button>
        <router-link to="/tenants/new" class="btn-primary">
          <span class="material-icons">add</span>
          Nový nájemce
        </router-link>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon green">
          <span class="material-icons">home</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Aktivní nájemníci</div>
          <div class="stat-value">{{ activeTenants }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">
          <span class="material-icons">payments</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Měsíční příjem</div>
          <div class="stat-value">{{ formatCurrency(totalMonthlyRevenue) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <span class="material-icons">event_busy</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Končící smlouvy (30 dní)</div>
          <div class="stat-value">{{ expiringContracts }}</div>
        </div>
      </div>
    </div>

    <!-- Tenant Table -->
    <div class="table-container">
      <table class="tenant-table">
        <thead>
          <tr>
            <th style="width: 80px">ID</th>
            <th style="width: 25%">Nájemník</th>
            <th style="width: 25%">Kontakt</th>
            <th style="width: 130px">Kontakt přidán</th>
            <th style="width: 130px">Začátek smlouvy</th>
            <th style="width: 20%">Nemovitost</th>
            <th style="width: 100px; text-align: center;">Akce</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="tenant in paginatedTenants" 
            :key="tenant.id"
            class="tenant-row"
          >
            <td>
              <span class="tenant-property-id">{{ tenant.propertyId }}</span>
            </td>
            <td @click="navigateToTenantDetail(tenant)">
              <div class="tenant-cell clickable">
                <div class="tenant-avatar">{{ tenant.initials }}</div>
                <div class="tenant-info">
                  <div class="tenant-name">{{ tenant.tenant }}</div>
                  <div class="tenant-unit">{{ tenant.label }}</div>
                  <div v-if="tenant.debt" class="tenant-debt-badge" :class="tenant.debt.severity">
                     <span class="material-icons">money_off</span>
                     Dluh: {{ formatCurrency(tenant.debt.totalDebt) }}
                  </div>
                </div>
                <!-- Ticket badges -->
                <div v-if="getOpenTicketsForTenant(tenant.tenant, tenant.propertyId).length > 0" class="ticket-badges">
                  <span 
                    v-if="getOpenTicketsForTenant(tenant.tenant, tenant.propertyId).length === 1"
                    class="ticket-badge single animate-pulse-subtle"
                    @click.stop="navigateToTicket(getOpenTicketsForTenant(tenant.tenant, tenant.propertyId)[0].id)"
                    :title="getOpenTicketsForTenant(tenant.tenant, tenant.propertyId)[0].subject"
                  >
                    <span class="material-icons">build</span>
                    {{ getOpenTicketsForTenant(tenant.tenant, tenant.propertyId)[0].id }}
                  </span>
                  <span 
                    v-else
                    class="ticket-badge multiple animate-pulse-subtle"
                    @click.stop="showAllTickets(tenant)"
                    title="Zobrazit všechny tikety nájemce"
                  >
                    <span class="material-icons">engineering</span>
                    +{{ getOpenTicketsForTenant(tenant.tenant, tenant.propertyId).length }}
                  </span>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-cell">
                <div class="contact-phone">{{ tenant.phone }}</div>
                <div class="contact-email truncate" :title="tenant.email">{{ tenant.email }}</div>
              </div>
            </td>
            <td>{{ tenant.joinedDate || '-' }}</td>
            <td>{{ tenant.contractStart || '-' }}</td>
            <td @click="navigateToProperty(tenant.propertyId)">
              <div class="property-cell">
                <span class="property-name truncate" :title="tenant.propertyName">{{ tenant.propertyName }}</span>
              </div>
            </td>
            <td class="action-cell">
              <div class="action-wrapper">
                <button 
                  class="action-btn menu-btn" 
                  @click.stop="toggleMenu(tenant.id)" 
                  title="Více akcí"
                >
                  <span class="material-icons">more_vert</span>
                </button>
                <div class="menu-container" v-if="activeMenuId === tenant.id">
                  <ActionMenu 
                    @close="closeMenu" 
                    @action="(action) => handleAction(action, tenant)" 
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredTenants.length === 0" class="empty-state">
        <span class="material-icons empty-icon">person_off</span>
        <p>Nebyli nalezeni žádní nájemníci</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredTenants.length > 0" class="pagination-container">
      <div class="pagination-info">
        Zobrazeno <b>{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredTenants.length) }}</b> z <b>{{ filteredTenants.length }}</b> nájemníků
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Filter Modal -->
    <FilterModal 
      :is-open="showFilterModal"
      :properties="properties"
      :active-filters="activeFilters"
      @close="showFilterModal = false"
      @apply="handleApplyFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { propertyService } from '@/services/propertyService';
import { mockIncomes } from '@/mock/finance';
import { maintenanceService } from '@/services/maintenanceService';
import { calculateDebtSummary } from '@/utils/debtCalculations';
import { useNotification } from '@/composables/useNotification';
import FilterModal from '@/components/tenants/FilterModal.vue';
import ActionMenu from '@/components/ActionMenu.vue';

const router = useRouter();
const { showInfo, showSuccess } = useNotification();

// Data
const properties = ref([]);
const tenants = ref([]);
const maintenanceTickets = ref([]);
const showFilterModal = ref(false);
const activeMenuId = ref(null);

const activeFilters = reactive({
  status: '',
  propertyId: ''
});

// Click outside to close menu
const handleClickOutside = (event) => {
  if (!event.target.closest('.action-wrapper')) {
    activeMenuId.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Load data
onMounted(async () => {
  try {
    properties.value = await propertyService.getProperties();
    maintenanceTickets.value = await maintenanceService.getTickets();
    tenants.value = extractTenantsFromProperties(properties.value, mockIncomes);
  } catch (error) {
    console.error('Failed to load tenants:', error);
  }
});

// Extract tenants from properties
const extractTenantsFromProperties = (props, incomes) => {
  const tenantList = [];
  
  props.forEach(property => {
    if (property.units && property.units.length > 0) {
      property.units.forEach(unit => {
        if (unit.tenant && unit.tenant !== '-') {
          const debtSummary = calculateDebtSummary(incomes, unit.tenant, property.id);
          
          tenantList.push({
            id: `${property.id}-${unit.id}`,
            tenant: unit.tenant,
            email: unit.email,
            phone: unit.phone,
            status: unit.status,
            contractStart: unit.contractStart,
            contractEnd: unit.contractEnd,
            joinedDate: unit.joinedDate,
            label: unit.label,
            propertyId: property.id,
            propertyName: property.name,
            rent: unit.rent || 0,
            initials: getInitials(unit.tenant),
            debt: debtSummary
          });
        }
      });
    }
  });
  
  return tenantList;
};

// Helper to get initials
const getInitials = (name) => {
  if (!name || name === '-') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0] + (name[1] || '');
};

// Get open tickets for a tenant
const getOpenTicketsForTenant = (tenantName, propertyId) => {
  return maintenanceTickets.value.filter(ticket => 
    ticket.propertyId === propertyId && 
    ticket.status !== 'done' &&
    (ticket.description?.toLowerCase().includes(tenantName.toLowerCase()) ||
     ticket.subject?.toLowerCase().includes(tenantName.toLowerCase()))
  );
};

// Computed Stats
const activeTenants = computed(() => {
  return tenants.value.filter(t => t.status === 'Pronajato').length;
});

const totalMonthlyRevenue = computed(() => {
  return tenants.value
    .filter(t => t.status === 'Pronajato')
    .reduce((sum, t) => sum + t.rent, 0);
});

const expiringContracts = computed(() => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return tenants.value.filter(t => {
    if (!t.contractEnd) return false;
    const endDate = parseContractDate(t.contractEnd);
    return endDate && endDate <= thirtyDaysFromNow && endDate >= now;
  }).length;
});

const parseContractDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  return new Date(parts[2], parts[1] - 1, parts[0]);
};

// Filtered Tenants
const filteredTenants = computed(() => {
  let result = [...tenants.value];
  
  // Status filter
  if (activeFilters.status) {
    result = result.filter(t => t.status === activeFilters.status);
  }
  
  // Property filter
  if (activeFilters.propertyId) {
    result = result.filter(t => t.propertyId === activeFilters.propertyId);
  }
  
  return result;
});

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredTenants.value.length / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const paginatedTenants = computed(() => filteredTenants.value.slice(startIndex.value, endIndex.value));

// Methods
const handleApplyFilters = (filters) => {
  activeFilters.status = filters.status;
  activeFilters.propertyId = filters.propertyId;
  currentPage.value = 1; // Reset to first page
};

const getStatusClass = (status) => {
  if (status === 'Pronajato') return 'status-active';
  if (status === 'Volné') return 'status-vacant';
  return 'status-reserved';
};

const navigateToProperty = (propertyId) => {
  router.push(`/properties/${propertyId}`);
};

const navigateToTenantDetail = (tenant) => {
  router.push(`/tenants/${tenant.propertyId}/${tenant.id}`);
};

const navigateToTicket = (ticketId) => {
  router.push({ path: '/maintenance', query: { ticket: ticketId } });
};

const showAllTickets = (tenant) => {
  router.push({ path: '/maintenance', query: { search: tenant.tenant } });
};

// Action Menu Handlers
const toggleMenu = (id) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
  } else {
    activeMenuId.value = id;
  }
};

const closeMenu = () => {
  activeMenuId.value = null;
};

const handleAction = (action, tenant) => {
  closeMenu();
  switch (action) {
    case 'preview':
    case 'edit':
      navigateToTenantDetail(tenant);
      break;
    case 'quick-contact':
      contactTenant(tenant);
      break;
    case 'quick-contract':
      showInfo(`Správa smluv pro ${tenant.tenant}`);
      break;
    case 'quick-maintenance':
      router.push({ path: '/maintenance/new', query: { propertyId: tenant.propertyId, tenant: tenant.tenant } });
      break;
    case 'quick-payment':
      showInfo(`Nová platba pro ${tenant.tenant}`);
      break;
    case 'delete':
      if (confirm(`Opravdu chcete odstranit nájemníka ${tenant.tenant}?`)) {
        showSuccess('Nájemník byl odstraněn');
        // In real app, call delete API and refresh
      }
      break;
    default:
      console.warn('Unknown action:', action);
  }
};

const contactTenant = (tenant) => {
  showInfo(`Kontaktovat: ${tenant.tenant} (${tenant.email})`);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<style scoped>
.tenant-list-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Breadcrumbs */
.breadcrumbs {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumbs a {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.separator {
  color: #cbd5e1;
}

.current {
  color: #0f172a;
  font-weight: 500;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: #1976D2;
  color: white;
}

.btn-primary:hover {
  background: #1565C0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Stats Bar */
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
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

/* Filters */
.filters-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 20px;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #1976D2;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #1976D2;
}

/* Table */
/* Table */
.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  /* overflow: hidden; Removed to allow dropdowns to show */
}

/* ... */

.tenant-table th,
.tenant-table td {
  padding: 1.25rem 1.5rem;
  font-size: 0.9375rem;
  color: #334155;
  vertical-align: middle;
  text-align: left;
}

.action-cell {
  text-align: center;
  position: relative;
  overflow: visible; /* Important for menu to show */
}

/* Action Wrapper to position menu */
.action-wrapper {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  position: relative;
}

.menu-container {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
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

/* Tenant Cell */
.tenant-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.tenant-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0; /* Important for flex truncation */
  flex: 1;
}

.tenant-debt-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
  width: fit-content;
}

.tenant-debt-badge .material-icons {
  font-size: 12px;
}

.tenant-debt-badge.critical {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

.tenant-debt-badge.medium {
  color: #d97706;
  background: #fffbeb;
  border: 1px solid #fef3c7;
}

.tenant-debt-badge.low {
  color: #16a34a; /* Maybe stick to red/orange for debt? Usually any debt is bad. Let's use generic warning color or keep green only for 0-30 days */
  /* Actually for debt, 'low' usually means recent. Let's make it yellow/orange too or softer red. */
  color: #ea580c;
  background: #fff7ed;
  border: 1px solid #ffedd5;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tenant-unit {
  font-size: 0.8125rem;
  color: #64748b;
}

.tenant-property-id {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.025em;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-vacant {
  background: #fee2e2;
  color: #991b1b;
}

.status-reserved {
  background: #dbeafe;
  color: #1e40af;
}



/* Property Cell */
.property-cell {
  min-width: 0;
}

.property-name {
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  display: block;
}

.property-name:hover {
  text-decoration: underline;
}

/* Ticket Badges */
.ticket-badges {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.ticket-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  white-space: nowrap;
}

.ticket-badge.single {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
}

.ticket-badge.multiple {
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #854d0e;
}

.ticket-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.ticket-badge.single:hover {
  background: #ffedd5;
  border-color: #fb923c;
}

.ticket-badge.multiple:hover {
  background: #fef9c3;
  border-color: #facc15;
}

.ticket-badge .material-icons {
  font-size: 14px;
}

.animate-pulse-subtle {
  animation: pulseSubtle 3s infinite;
}

@keyframes pulseSubtle {
  0% { opacity: 1; }
  50% { opacity: 0.85; }
  100% { opacity: 1; }
}

.tenant-cell.clickable {
  cursor: pointer;
}

.tenant-cell.clickable:hover .tenant-name {
  color: #1976D2;
  text-decoration: underline;
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.contact-phone {
  font-weight: 500;
  color: #0f172a;
}

.contact-email {
  font-size: 0.8125rem;
  color: #64748b;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #1976D2;
  color: #1976D2;
}

.action-btn .material-icons {
  font-size: 18px;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0.5rem;
  margin-top: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-info b {
  color: #0f172a;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn, .page-number {
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 0.5rem;
}

.page-btn:hover:not(:disabled), .page-number:hover:not(.active) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1976D2;
}

.page-number.active {
  background: #1976D2;
  color: white;
  border-color: #1976D2;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
}

.page-btn .material-icons {
  font-size: 20px;
}
</style>
