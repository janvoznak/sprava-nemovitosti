<template>
  <div class="tenant-detail-view">
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <router-link to="/">Dashboard</router-link>
      <span class="separator">›</span>
      <router-link to="/tenants">Adresář</router-link>
      <span class="separator">›</span>
      <span class="current">{{ tenant?.tenant || 'Detail nájemce' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="material-icons">error_outline</span>
      <p>{{ error }}</p>
      <router-link to="/tenants" class="btn-secondary">Zpět na seznam</router-link>
    </div>

    <!-- Tenant Detail -->
    <div v-else-if="tenant" class="tenant-detail">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-left">
          <div class="tenant-avatar-large">{{ tenant.initials }}</div>
          <div class="header-info">
            <h1 class="tenant-name-large">{{ tenant.tenant }}</h1>
            <p class="tenant-unit-info">{{ tenant.label }} · {{ property?.name }}</p>
            <span class="status-badge" :class="getStatusClass(tenant.status)">
              {{ tenant.status }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-secondary" @click="contactTenant">
            <span class="material-icons">email</span>
            Kontaktovat
          </button>
          <button class="btn-primary" @click="isEditModalOpen = true">
            <span class="material-icons">edit</span>
            Upravit
          </button>

        </div>
      </div>

      <!-- Debt Alert Banner -->
      <div v-if="tenant.debt" class="debt-alert-banner" :class="tenant.debt.severity">
        <div class="debt-info">
          <span class="material-icons">money_off</span>
          <div class="debt-text">
            <strong>Evidován dluh: {{ formatCurrency(tenant.debt.totalDebt) }}</strong>
            <span class="debt-detail">({{ tenant.debt.debtAgeDays }} dní po splatnosti)</span>
          </div>
        </div>
        <button class="debt-action-btn" @click="navigateToDebtorDetail(tenant.tenant)">
          Spravovat dluhy
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>

      <!-- Detail Tabs -->
      <div class="detail-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          <span class="material-icons">{{ tab.icon }}</span>
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab: Basic Info -->
        <div v-if="currentTab === 'basic'" class="info-grid animate-fade-in">
          <!-- Contact Information -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="material-icons">contacts</span>
              Kontaktní údaje
            </h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">E-mail</span>
                <a :href="`mailto:${tenant.email}`" class="info-value link">{{ tenant.email }}</a>
              </div>
              <div class="info-item">
                <span class="info-label">Telefon</span>
                <a :href="`tel:${tenant.phone}`" class="info-value link">{{ tenant.phone }}</a>
              </div>
              <div class="info-item">
                <span class="info-label">Kontakt přidán</span>
                <span class="info-value">{{ tenant.joinedDate || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- New: Personal Info Card -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="material-icons">person</span>
              Osobní údaje
            </h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Datum narození</span>
                <span class="info-value">{{ tenant?.birthDate || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Číslo OP/Pasu</span>
                <span class="info-value">{{ tenant?.idNumber || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trvalé bydliště</span>
                <span class="info-value">{{ tenant?.permanentAddress || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Zaměstnavatel</span>
                <span class="info-value">{{ tenant?.employer || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- New: Household Members Card -->
          <div v-if="tenant?.householdMembers && tenant.householdMembers.length > 0" class="info-card">
            <h3 class="card-title">
              <span class="material-icons">group</span>
              Spolubydlící
            </h3>
            <div class="info-list">
              <div v-for="(member, idx) in tenant.householdMembers" :key="idx" class="info-item">
                <div class="member-info">
                  <span class="info-value">{{ member.name }}</span>
                  <span class="info-label small">{{ member.relation }}, *{{ member.birthDate }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contract Information -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="material-icons">gavel</span>
              Smlouva
            </h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Platnost od</span>
                <span class="info-value">{{ tenant?.contractStart || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Platnost do</span>
                <div class="value-col">
                  <span class="info-value">{{ tenant?.contractEnd || '-' }}</span>
                  <span v-if="daysToExpiration > 0 && daysToExpiration < 60" class="warning-badge">
                    Končí za {{ daysToExpiration }} dní
                  </span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">Typ smlouvy</span>
                <span class="info-value">Doba určitá</span>
              </div>
              <div class="info-item" v-if="tenant?.insurancePolicy">
                <span class="info-label">Pojištění</span>
                <span class="info-value" :title="tenant.insurancePolicy.number">
                   {{ tenant.insurancePolicy.provider }} (do {{ tenant.insurancePolicy.validUntil }})
                </span>
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="material-icons">payments</span>
              Finance
            </h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Nájemné</span>
                <span class="info-value">{{ formatCurrency(tenant?.rent) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Zálohy</span>
                <span class="info-value">{{ formatCurrency(tenant?.serviceCharges) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Kauce</span>
                <span class="info-value">{{ tenant.depositAmount ? formatCurrency(tenant.depositAmount) : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Variabilní symbol</span>
                <span class="info-value">2024001</span>
              </div>
              <div class="info-item">
                 <span class="info-label">Bankovní spojení</span>
                 <span class="info-value monospace">{{ tenant?.bankAccount || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Kauce zaplacena</span>
                <span class="info-value">
                  <span v-if="tenant.isDeposited" class="success-badge">
                    <span class="material-icons">check_circle</span>
                    Ano
                  </span>
                  <span v-else class="warning-badge">
                    <span class="material-icons">cancel</span>
                    Ne
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Property Information -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="material-icons">home</span>
              Nemovitost
            </h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Název</span>
                <router-link :to="`/properties/${property.id}`" class="info-value link">
                  {{ property.name }}
                </router-link>
              </div>
              <div class="info-item">
                <span class="info-label">Adresa</span>
                <span class="info-value">{{ property.address }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Jednotka</span>
                <span class="info-value">{{ tenant.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Communications -->
        <div v-if="currentTab === 'communications'" class="communications-tab animate-fade-in">
          <div class="section-actions">
            <button class="btn-primary btn-sm" @click="isAddCommModalOpen = true">
              <span class="material-icons">add</span>
              Nová zpráva
            </button>
          </div>
          
          <div v-if="communications.length > 0" class="timeline">
            <div v-for="comm in communications" :key="comm.id" class="timeline-item">
              <div class="timeline-icon" :style="{ color: getTypeColor(comm.type) }">
                <span class="material-icons">{{ getTypeIcon(comm.type) }}</span>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4 class="timeline-title">{{ comm.title }}</h4>
                  <span class="timeline-date">{{ formatDateWithTime(comm.createdAt) }}</span>
                </div>
                <p class="timeline-text">{{ comm.content }}</p>
                <div v-if="comm.tags && comm.tags.length > 0" class="timeline-tags">
                  <span v-for="tag in comm.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-tab-state">
            <span class="material-icons">chat_bubble_outline</span>
            <p>Žádná historie komunikace</p>
          </div>
        </div>

        <!-- Tab: Documents -->
        <div v-if="currentTab === 'documents'" class="documents-tab animate-fade-in">
          <div class="section-actions">
            <button class="btn-primary btn-sm" @click="isAddDocModalOpen = true">
              <span class="material-icons">upload</span>
              Nahrát dokument
            </button>
          </div>

          <div v-if="tenantDocuments.length > 0" class="documents-list">
            <div v-for="doc in tenantDocuments" :key="doc.id" class="document-item">
              <div class="document-icon">
                <span class="material-icons">{{ getFileIcon(doc.fileType) }}</span>
              </div>
              <div class="document-info">
                <div class="document-name" :title="doc.name">{{ doc.name }}</div>
                <div class="document-meta-row">
                  <span class="document-meta-text">
                    {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.uploadDate) }}
                  </span>
                  <!-- Status Badges - Moved to meta row -->
                  <span v-if="doc.status === 'signed'" class="doc-status signed" title="Podepsáno elektronicky">
                    <span class="material-icons">verified</span>
                    Podepsáno {{ formatDate(doc.signedDate) }}
                  </span>
                  <span v-else-if="doc.status === 'pending'" class="doc-status pending" title="Čeká na podpis">
                    <span class="material-icons">hourglass_empty</span>
                    Čeká na podpis
                  </span>
                </div>
              </div>
              <div class="document-actions">
                <button 
                  v-if="doc.status === 'pending'" 
                  class="btn-primary btn-xs" 
                  @click="openSignModal(doc)"
                >
                  <span class="material-icons">draw</span>
                  Podepsat
                </button>

                <button class="action-btn" @click="downloadDoc(doc.id)" title="Stáhnout">
                  <span class="material-icons">download</span>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-tab-state">
            <span class="material-icons">folder_off</span>
            <p>Žádné dokumenty pro tohoto nájemníka</p>
          </div>
        </div>

        <!-- Tab: Maintenance -->
        <div v-if="currentTab === 'maintenance'" class="tickets-tab animate-fade-in">
          <div v-if="openTickets.length > 0" class="tickets-list">
            <div 
              v-for="ticket in openTickets" 
              :key="ticket.id"
              class="ticket-card"
              @click="navigateToTicket(ticket.id)"
            >
              <div class="ticket-header">
                <span class="ticket-id">{{ ticket.id }}</span>
                <span class="priority-badge" :class="`priority-${ticket.priority}`">
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </div>
              <h4 class="ticket-subject">{{ ticket.subject }}</h4>
              <p class="ticket-description">{{ ticket.description }}</p>
              <div class="ticket-footer">
                <span class="ticket-date">{{ formatDate(ticket.createdAt) }}</span>
                <span class="ticket-status-badge" :class="`status-${ticket.status}`">
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-tab-state">
            <span class="material-icons">check_circle_outline</span>
            <p>Žádné otevřené tikety</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Tenant Modal -->
    <AddTenantModal
      :is-open="isEditModalOpen"
      :unit-id="tenant?.unitId"
      :unit-name="tenant?.label"
      :tenant="tenant"
      @close="isEditModalOpen = false"
      @save="handleUpdateTenant"
    />

    <!-- Sign Document Modal -->
    <SignDocumentModal 
      v-if="isSignModalOpen"
      :is-open="isSignModalOpen"
      :document-name="documentToSign?.name"
      @close="isSignModalOpen = false"
      @sign="handleSignature"
    />

    <!-- Add Communication Modal -->
    <div v-if="isAddCommModalOpen" class="modal-overlay" @click.self="isAddCommModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Přidat záznam do historie</h3>
          <button class="close-btn" @click="isAddCommModalOpen = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Typ komunikace</label>
            <select v-model="newComm.type" class="form-input">
              <option value="note">Poznámka</option>
              <option value="reminder">Upomínka</option>
              <option value="complaint">Reklamace</option>
              <option value="payment">Platba</option>
              <option value="termination">Výpověď</option>
            </select>
          </div>
          <div class="form-group">
            <label>Název / Předmět</label>
            <input v-model="newComm.title" type="text" class="form-input" placeholder="Např. Osobní schůzka ohledně...">
          </div>
          <div class="form-group">
            <label>Obsah zprávy</label>
            <textarea v-model="newComm.content" class="form-input" rows="4" placeholder="Zde uveďte podrobnosti..."></textarea>
          </div>
          <div class="form-group">
            <label>Štítky (oddělené čárkou)</label>
            <input v-model="newComm.tags" type="text" class="form-input" placeholder="např. smlouva, urgence">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="isAddCommModalOpen = false">Zrušit</button>
          <button class="btn-primary" @click="handleAddCommunication">
            <span class="material-icons">save</span>
            Uložit záznam
          </button>
        </div>
      </div>
    </div>

    <!-- Add Document Modal -->
    <div v-if="isAddDocModalOpen" class="modal-overlay" @click.self="isAddDocModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Nahrát dokument</h3>
          <button class="close-btn" @click="isAddDocModalOpen = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Kategorie</label>
            <select v-model="newDoc.category" class="form-input">
              <option value="contracts">Smlouvy</option>
              <option value="revisions">Revize</option>
              <option value="invoices">Faktury</option>
              <option value="insurance">Pojištění</option>
              <option value="photos">Fotky</option>
            </select>
          </div>
          <div class="form-group">
            <label>Název dokumentu</label>
            <input v-model="newDoc.name" type="text" class="form-input" placeholder="Název souboru (volitelné)">
          </div>
          <div class="form-group">
            <label>Soubor</label>
            <input type="file" @change="handleFileUpload" class="form-input">
            <p v-if="newDoc.file" class="file-info">
              Vybráno: {{ newDoc.file.name }} ({{ formatFileSize(newDoc.file.size) }})
            </p>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-container">
              <input v-model="newDoc.signable" type="checkbox">
              <span class="checkmark"></span>
              <span class="checkbox-label">Vyžadovat podpis nájemníka</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="isAddDocModalOpen = false">Zrušit</button>
          <button class="btn-primary" @click="handleAddDocument" :disabled="!newDoc.file">
            <span class="material-icons">upload</span>
            Nahrát nyní
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { propertyService } from '@/services/propertyService';
import { maintenanceService } from '@/services/maintenanceService';
import { communicationService } from '@/services/communicationService';
import { documentService } from '@/services/documentService';
import { mockIncomes } from '@/mock/finance';
import { calculateDebtSummary } from '@/utils/debtCalculations';
import { useNotification } from '@/composables/useNotification';
import AddTenantModal from '@/components/property/AddTenantModal.vue';
import SignDocumentModal from '@/components/documents/SignDocumentModal.vue';

const router = useRouter();
const route = useRoute();
const { showInfo, showSuccess, showError } = useNotification();

// State
const loading = ref(true);
const error = ref(null);
const property = ref(null);
const tenant = ref(null);
const allTickets = ref([]);
const communications = ref([]);
const tenantDocuments = ref([]);
const currentTab = ref('basic');
const isEditModalOpen = ref(false);
const isAddCommModalOpen = ref(false);
const isAddDocModalOpen = ref(false);
const isSignModalOpen = ref(false);
const documentToSign = ref(null);

const newComm = ref({
  type: 'note',
  title: '',
  content: '',
  tags: ''
});

const newDoc = ref({
  category: 'contracts',
  name: '',
  file: null,
  signable: false
});

const tabs = computed(() => [
  { id: 'basic', label: 'Základní info', icon: 'info' },
  { id: 'communications', label: 'Komunikace', icon: 'chat', badge: communications.value.length },
  { id: 'documents', label: 'Dokumenty', icon: 'folder', badge: tenantDocuments.value.length },
  { id: 'maintenance', label: 'Opravy', icon: 'build', badge: openTickets.value.length }
]);

// Load data
onMounted(async () => {
  await loadTenantData();
});

const loadTenantData = async () => {
  try {
    loading.value = true;
    
    const propertyId = route.params.propertyId;
    const tenantId = route.params.tenantId;
    
    // Load property
    property.value = await propertyService.getPropertyById(propertyId);
    
    if (!property.value) {
      error.value = 'Nemovitost nenalezena';
      loading.value = false;
      return;
    }
    
    // Find tenant in units - handle both composite ID and simple unit ID
    if (property.value.units) {
      tenant.value = property.value.units.find(unit => {
        const compositeId = `${propertyId}-${unit.id}`;
        return (unit.id === tenantId || compositeId === tenantId) && 
               unit.tenant && unit.tenant !== '-';
      });

      if (tenant.value) {
        // Enrich tenant object with necessary IDs and initials
        tenant.value = {
          ...tenant.value,
          unitId: tenant.value.id,
          propertyId: propertyId,
          initials: getInitials(tenant.value.tenant)
        };
      }
    }
    
    if (!tenant.value) {
      error.value = 'Nájemce nenalezen';
      loading.value = false;
      return;
    }
    
    // Load tickets
    allTickets.value = await maintenanceService.getTickets();

    // Load communications - fetch by name since mock data uses names
    const allComms = await communicationService.getCommunicationsByProperty(propertyId);
    communications.value = allComms.filter(c => c.tenantName === tenant.value.tenant)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Load documents - filter by tenant name in metadata
    const allDocs = await documentService.getDocuments(propertyId);
    tenantDocuments.value = allDocs.filter(d => 
      d.metadata?.tenant === tenant.value.tenant || 
      d.name.includes(tenant.value.tenant)
    );
    
    // Calculate debt (New)
    const debtSummary = calculateDebtSummary(mockIncomes, tenant.value.tenant, propertyId);
    if (debtSummary) {
      tenant.value.debt = debtSummary;
    }
    
    loading.value = false;
  } catch (err) {
    console.error('Failed to load tenant details:', err);
    error.value = 'Nepodařilo se načíst data nájemce';
    loading.value = false;
  }
};

// Computed
const openTickets = computed(() => {
  if (!tenant.value || !allTickets.value) return [];
  
  return allTickets.value.filter(ticket => 
    ticket.propertyId === tenant.value.propertyId && 
    ticket.status !== 'done' &&
    (ticket.description?.toLowerCase().includes(tenant.value.tenant.toLowerCase()) ||
     ticket.subject?.toLowerCase().includes(tenant.value.tenant.toLowerCase()))
  );
});

const isContractExpiring = computed(() => {
  if (!tenant.value?.contractEnd) return false;
  const endDate = parseContractDate(tenant.value.contractEnd);
  if (!endDate) return false;
  
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return endDate <= thirtyDaysFromNow && endDate >= now;
});

const daysToExpiration = computed(() => {
  if (!tenant.value?.contractEnd) return 0;
  const endDate = parseContractDate(tenant.value.contractEnd);
  if (!endDate) return 0;
  
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Methods
const handleUpdateTenant = async (updatedData) => {
  try {
    const updatedUnits = property.value.units.map(unit => {
      if (unit.id === tenant.value.unitId) {
        return { ...unit, ...updatedData };
      }
      return unit;
    });

    await propertyService.updateProperty(property.value.id, { units: updatedUnits });
    showSuccess('Data nájemce byla aktualizována');
    await loadTenantData();
  } catch (error) {
    console.error('Failed to update tenant:', error);
    showError('Nepodařilo se aktualizovat data nájemce');
  }
};

const parseContractDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  return new Date(parts[2], parts[1] - 1, parts[0]);
};

const getInitials = (name) => {
  if (!name || name === '-') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0] + (name[1] || '');
};

const getStatusClass = (status) => {
  if (status === 'Pronajato') return 'status-active';
  if (status === 'Volné') return 'status-vacant';
  return 'status-reserved';
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Nízká',
    medium: 'Střední',
    high: 'Vysoká',
    critical: 'Kritická'
  };
  return labels[priority] || priority;
};

const getStatusLabel = (status) => {
  const labels = {
    new: 'Nový',
    in_progress: 'Probíhá',
    done: 'Dokončeno'
  };
  return labels[status] || status;
};

const getTypeIcon = (type) => communicationService.getTypeIcon(type);
const getTypeColor = (type) => communicationService.getTypeColor(type);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateWithTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const navigateToTicket = (ticketId) => {
  router.push({ path: '/maintenance', query: { ticket: ticketId } });
};

const contactTenant = () => {
  showInfo(`Kontaktovat: ${tenant.value.tenant} (${tenant.value.email})`);
};

// Add Communication
const handleAddCommunication = async () => {
  try {
    if (!newComm.value.title || !newComm.value.content) {
      showError('Vyplňte prosím název a obsah zprávy');
      return;
    }

    const data = {
      tenantName: tenant.value.tenant,
      propertyId: tenant.value.propertyId,
      unitId: tenant.value.unitId,
      type: newComm.value.type,
      title: newComm.value.title,
      content: newComm.value.content,
      tags: newComm.value.tags.split(',').map(t => t.trim()).filter(t => t),
      createdBy: 'Admin'
    };

    await communicationService.addCommunication(tenant.value.id, data);
    showSuccess('Záznam byl přidán do historie');
    isAddCommModalOpen.value = false;
    
    // Reset form
    newComm.value = { type: 'note', title: '', content: '', tags: '' };
    
    // Reload data
    await loadTenantData();
  } catch (error) {
    console.error('Failed to add communication:', error);
    showError('Nepodařilo se přidat záznam');
  }
};

// Upload Document
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newDoc.value.file = file;
    if (!newDoc.value.name) {
      newDoc.value.name = file.name;
    }
  }
};

const getFileIcon = (fileType) => {
  if (fileType === 'application/pdf') return 'picture_as_pdf';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('word') || fileType.includes('document')) return 'description';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'table_view';
  return 'insert_drive_file';
};

const handleAddDocument = async () => {
  try {
    if (!newDoc.value.file) {
      showError('Vyberte prosím soubor');
      return;
    }

    const metadata = {
      category: newDoc.value.category,
      name: newDoc.value.name || newDoc.value.file.name,
      signable: newDoc.value.signable,
      metadata: {
        tenant: tenant.value.tenant,
        propertyId: tenant.value.propertyId
      }
    };

    await documentService.uploadDocument(tenant.value.propertyId, newDoc.value.file, metadata);
    showSuccess('Dokument byl úspěšně nahrán');
    isAddDocModalOpen.value = false;
    
    // Reset form
    newDoc.value = { category: 'contracts', name: '', file: null, signable: false };
    
    // Reload data
    await loadTenantData();
  } catch (error) {
    console.error('Failed to upload document:', error);
    showError('Nepodařilo se nahrát dokument');
  }
};

const downloadDoc = async (docId) => {
  try {
    const url = await documentService.downloadDocument(docId);
    if (!url || url.includes('mock')) {
       showInfo('V demo režimu nelze stahovat soubory');
       return;
    }
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to download document:', error);
    showError('Nepodařilo se stáhnout dokument');
  }
};

const navigateToDebtorDetail = (tenantName) => {
  router.push({ path: '/debtors', query: { search: tenantName } });
};

// Signing Logic
const openSignModal = (doc) => {
  documentToSign.value = doc;
  isSignModalOpen.value = true;
};

const handleSignature = async (signatureData) => {
  try {
    if (!documentToSign.value) return;

    await documentService.signDocument(documentToSign.value.id, signatureData);
    showSuccess('Dokument byl úspěšně podepsán');
    isSignModalOpen.value = false;
    documentToSign.value = null;

    // Refresh data
    await loadTenantData();
  } catch (error) {
    console.error('Failed to sign document:', error);
    showError('Podepisování selhalo: ' + error.message);
  }
};
</script>

<style scoped>
.tenant-detail-view {
  padding: 1.5rem 0;
  max-width: 1600px;
  margin: 0 auto;
}

/* Tabs */
.detail-tabs {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.125rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #1976D2;
}

.tab-btn.active {
  color: #1976D2;
  border-bottom-color: #1976D2;
}

.tab-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 99px;
  min-width: 20px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: #dbeafe;
  color: #1e40af;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Actions */
.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Debt Alert Banner */
.debt-alert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid transparent;
}

.debt-alert-banner.critical {
  background: #fef2f2;
  border-color: #fee2e2;
  color: #991b1b;
}

.debt-alert-banner.medium {
  background: #fffbeb;
  border-color: #fef3c7;
  color: #92400e;
}

.debt-alert-banner.low {
  background: #fff7ed;
  border-color: #ffedd5;
  color: #9a3412;
}

.debt-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.debt-info .material-icons {
  font-size: 24px;
}

.debt-text {
  display: flex;
  flex-direction: column;
}

.debt-detail {
  font-size: 0.875rem;
  opacity: 0.9;
}

.debt-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid currentColor;
  border-radius: 6px;
  color: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.9;
}

.debt-action-btn:hover {
  opacity: 1;
  background: rgba(255,255,255,0.8);
}

/* Timeline/Communications */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 31px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-icon {
  position: absolute;
  left: -2rem;
  width: 32px;
  height: 32px;
  background: white;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-icon .material-icons {
  font-size: 18px;
}

.timeline-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-left: 1rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.timeline-title {
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.timeline-date {
  font-size: 0.8125rem;
  color: #64748b;
}

.timeline-text {
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.timeline-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

/* Documents */
.documents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.document-item:hover {
  border-color: #1976D2;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.document-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976D2;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.document-meta {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Empty Tab State */
.empty-tab-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
}

.empty-tab-state .material-icons {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

/* Existing Styles (Refined) */
.breadcrumbs {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 2rem;
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

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #1976D2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state .material-icons {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.detail-header {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.tenant-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
  flex-shrink: 0;
}

.tenant-name-large {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.tenant-unit-info {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 0.75rem 0;
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-title .material-icons {
  color: #1976D2;
  font-size: 1.375rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #0f172a;
  font-weight: 500;
  text-align: right;
}

.info-value.link {
  color: #1976D2;
  text-decoration: none;
}

.info-value.link:hover {
  text-decoration: underline;
}

.info-value.highlight {
  color: #1976D2;
  font-weight: 700;
  font-size: 1.125rem;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 99px;
  font-size: 0.875rem;
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

.success-badge,
.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.success-badge {
  background: #dcfce7;
  color: #166534;
}

.warning-badge {
  background: #fef3c7;
  color: #92400e;
}

.tickets-tab {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-card:hover {
  background: #f8fafc;
  border-color: #1976D2;
  transform: translateY(-1px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ticket-id {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
}

.priority-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-low { background: #f1f5f9; color: #475569; }
.priority-medium { background: #dbeafe; color: #1e40af; }
.priority-high { background: #fef3c7; color: #92400e; }
.priority-critical { background: #fee2e2; color: #991b1b; }

.ticket-subject {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.ticket-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.75rem 0;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-date { font-size: 0.8125rem; color: #94a3b8; }

.ticket-status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-new { background: #dbeafe; color: #1e40af; }
.status-in_progress { background: #fef3c7; color: #92400e; }
.status-done { background: #dcfce7; color: #166534; }

.action-bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary { background: #1976D2; color: white; }
.btn-primary:hover { background: #1565C0; }
.btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #f8fafc; }
/* Document Styles */
.document-name-row {
  /* Removed - using simplified structure now */
  display: none; 
}

.document-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
}

.document-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.document-meta-text {
  color: #64748b;
  font-size: 0.8125rem;
}

.document-meta.info-label {
  color: #64748b;
  font-size: 0.875rem;
}

.info-label.small {
  font-size: 0.75rem;
  opacity: 0.8;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-value {
  color: #0f172a;
  font-weight: 500;
  font-size: 0.9375rem;
}

.info-value.monospace {
  font-family: 'Roboto Mono', monospace;
  letter-spacing: -0.5px;
}

.doc-status {
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.doc-status.pending {
  background: #FEF3C7;
  color: #B45309;
}

.doc-status.signed {
  background: #DCFCE7;
  color: #166534;
}

.doc-status .material-icons {
  font-size: 14px;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  gap: 0.25rem;
}

.btn-xs .material-icons {
  font-size: 14px;
}

/* Checkbox specific styles */
.checkbox-group {
  margin-top: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-container .checkmark {
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #2563eb;
  border-color: #2563eb;
}

.checkbox-container .checkmark:after {
  content: "✓";
  color: white;
  display: none;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label {
  font-size: 0.9375rem;
  color: #475569;
}

/* Modals */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}
.modal-content {
  background: white; border-radius: 12px; width: 100%; max-width: 550px;
  display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  animation: modalEnter 0.3s ease-out;
}
@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0;
}
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.close-btn { background: transparent; border: none; cursor: pointer; color: #64748b; font-size: 1.2rem; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; width: 100%; transition: border 0.2s; font-family: inherit; }
.form-input:focus { border-color: #1976D2; outline: none; }
textarea.form-input { resize: vertical; }
.modal-footer { padding: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; }

.file-info {
  font-size: 0.8125rem;
  color: #166534;
  background: #dcfce7;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}
</style>
