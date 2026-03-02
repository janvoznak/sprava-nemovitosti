<template>
  <div class="property-detail-wrapper">
    <!-- Breadcrumbs -->
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Správa nemovitostí', to: { name: 'PropertyList' } },
      { label: 'Detail nemovitosti' }
    ]" />

    <!-- Compact Header Card -->
    <div class="property-header-card">
      <div class="header-main-content">
        <PropertyScoreBadge :property="form" size="large" class="mr-4" />
        
        <div class="title-address-group">
          <div class="id-title-row">
            <span class="property-id-badge">{{ form.id }}</span>
            <h1 class="property-title-compact">{{ form.name || 'Detail nemovitosti' }}</h1>
          </div>
          <div class="property-address-compact">
            <span class="material-icons">place</span>
            {{ form.street }} {{ form.houseNumber }}, {{ form.city }}
          </div>
        </div>

        <div class="header-stats-row">
          <div class="stat-pill">
            <span class="stat-label">Obsazenost</span>
            <span class="stat-value">{{ form.occupancyPercentage }}%</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Jednotky</span>
            <span class="stat-value">{{ form.units?.length || 0 }}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Typ</span>
            <span class="stat-value">{{ form.type || 'Budova' }}</span>
          </div>
        </div>

        <div class="header-actions-compact">
          <!-- <button class="btn-header-action" title="Upravit" @click="handleHeaderEdit">
            <span class="material-icons">edit</span>
            <span>Upravit</span>
          </button> -->
          <button class="btn-header-icon action-btn" @click="showActionMenu = !showActionMenu">
            <span class="material-icons">more_vert</span>
          </button>
          <ActionMenu 
            v-if="showActionMenu" 
            @close="showActionMenu = false"
            @action="handleActionMenuAction"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Bar -->
    <div class="nav-bar">
      <div class="tabs">
        <button 
          v-for="tab in smartTabs" 
          :key="tab.id"
          class="tab-item" 
          :class="{ active: activeTab === tab.id }" 
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge" :class="tab.badgeColor">
            {{ tab.badge }}
          </span>
        </button>
      </div>
     <div class="nav-actions">
           <button class="save-btn" @click="handleUpdate">
            <span class="material-icons icon-small">save</span> ULOŽIT
          </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="detail-content">
      <!-- Základní info Tab -->
      <div v-if="activeTab === 'basic'" class="tab-pane">
        <!-- Header Cards -->
        <div class="info-header-cards">
          <AppInput 
            v-model="form.internalRef" 
            label="Vnitřní označení"
            placeholder="např. P0001"
            help
          />
          <AppInput 
            v-model="form.listingDate"
            label="Datum zařazení do portfolia"
            type="date"
            help
          />
          <AppSelect 
            v-model="form.ownershipType" 
            label="Typ vlastnictví"
            help
          >
            <option value="vlastni">Vlastní</option>
            <option value="pronajem">Pronájem</option>
            <option value="sprava">Správa</option>
          </AppSelect>
        </div>


        <!-- Two Column Layout -->
        <div class="info-two-columns">
          <!-- Left Column: Forms -->
          <div class="info-left">
            <!-- Address Section -->
            <section class="form-section">
              <div class="section-header">
                <span class="icon-box-small">
                  <span class="material-icons icon-red">place</span>
                </span>
                <h3>Adresa</h3>
              </div>
              
              <div class="form-grid-compact">
                <!-- Address Lookup Field -->
                <AppInput 
                  v-model="addressSearchQuery"
                  label="Zadejte adresu"
                  placeholder="Začněte psát adresu..."
                  @input="handleAddressSearch"
                  @focus="showAddressSuggestions = true"
                  help
                >
                  <template #suggestions>
                    <div 
                      v-if="showAddressSuggestions && addressSuggestions.length > 0" 
                      class="address-suggestions-dropdown"
                    >
                      <div 
                        v-for="suggestion in addressSuggestions" 
                        :key="suggestion.id"
                        @click="selectAddress(suggestion)"
                        class="suggestion-item"
                      >
                        <span class="material-icons suggestion-icon">location_on</span>
                        <div class="suggestion-text">
                          <div class="suggestion-main">{{ suggestion.fullAddress }}</div>
                          <div class="suggestion-meta">{{ suggestion.cadastralArea }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                </AppInput>

                <div class="form-row-compact">
                  <AppSelect v-model="form.country" label="Země" help>
                    <option value="cz">Česká republika</option>
                    <option value="sk">Slovensko</option>
                  </AppSelect>
                  <AppInput v-model="form.region" label="Kraj" placeholder="např. Praha" help />
                </div>

                <div class="form-row-compact">
                  <AppInput v-model="form.cadastralArea" label="Katastrální území" help />
                  <AppInput v-model="form.district" label="Okres" placeholder="např. Praha 1" help />
                </div>

                <div class="form-row-compact">
                  <AppInput v-model="form.city" label="Město" help />
                  <AppInput v-model="form.cityPart" label="Část obce" placeholder="volitelné" help />
                </div>

                <div class="form-row-compact">
                  <AppInput v-model="form.street" label="Ulice" help />
                  <AppInput v-model="form.houseNumber" label="č.p./č.e." placeholder="např. 28" help />
                </div>

                <div class="form-row-compact">
                  <AppInput v-model="form.zipCode" label="PSČ" placeholder="např. 110 00" help />
                  <AppInput v-model="form.parcelNumber" label="Č. parcely" placeholder="volitelné" help />
                </div>
              </div>

            </section>

            <!-- Technical Data Section -->
            <section class="form-section">
              <div class="section-header">
                <span class="icon-box-small">
                  <span class="material-icons icon-orange">home</span>
                </span>
                <h3>Základní údaje</h3>
              </div>
              
              <div class="form-grid-compact">
                <div class="form-row-compact">
                  <AppSelect v-model="form.type" label="Typ nemovitosti" help>
                    <option>Bytový dům</option>
                    <option>Rodinný dům</option>
                    <option>Kancelářská budova</option>
                    <option>Průmyslový objekt</option>
                  </AppSelect>
                  <AppInput v-model.number="form.vymera_m2" label="Výměra (m²)" type="number" help />
                </div>

                <div class="form-row-compact">
                  <AppInput v-model="form.name" label="Název nemovitosti" placeholder="např. Václavské náměstí 28" help />
                </div>
              </div>

            </section>
          </div>

          <!-- Right Column: Map -->
          <div class="info-right">
            <section class="map-section">
              <div class="section-header">
                <span class="icon-box-small">
                  <span class="material-icons icon-blue">map</span>
                </span>
                <h3>Mapa</h3>
              </div>
              
              <div class="map-container">
                <div class="map-placeholder">
                  <span class="material-icons map-icon">location_on</span>
                  <p class="map-text">Mapa bude zobrazena po zadání adresy</p>
                  <p class="map-coords" v-if="form.latitude && form.longitude">
                    GPS: {{ form.latitude }}, {{ form.longitude }}
                  </p>
                </div>
              </div>
              
              <div class="map-actions">
                <button class="map-btn" @click="openGoogleMaps">
                  <span class="material-icons">map</span>
                  Zobrazit v mapě
                </button>
                <button class="map-btn" @click="openStreetView">
                  <span class="material-icons">streetview</span>
                  Street View
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Technické údaje Tab -->
      <div v-else-if="activeTab === 'tech'" class="tab-pane grid-columns">
        <!-- Energy Data -->
        <div class="content-card">
          <div class="card-header">
            <span class="icon-box-small">
              <span class="material-icons icon-orange">bolt</span>
            </span>
            <h2 class="card-title">Energetické údaje</h2>
          </div>
          
          <div class="form-grid">
            <div class="form-row split">
              <AppInput 
                v-model="form.ean_kod" 
                label="EAN kód (elektřina)"
                help
              />
              <AppInput 
                v-model="form.eic_kod" 
                label="EIC kód (plyn)"
                help
              />
            </div>

            <div class="form-row">
              <AppInput 
                v-model="form.cislo_odberneho_mist" 
                label="Číslo odběrného místa"
                class="full"
                help
              />
            </div>

            <div class="form-row full">
              <AppSelect v-model="form.energy_class" label="Třída energetické náročnosti" help>
                <option>A - Mimořádně úsporná</option>
                <option>B - Velmi úsporná</option>
                <option>C - Úsporná</option>
                <option>D - Méně úsporná</option>
                <option>E - Nehospodárná</option>
                <option>F - Velmi nehospodárná</option>
                <option>G - Mimořádně nehospodárná</option>
              </AppSelect>
            </div>

            <div class="form-row split">
              <AppInput 
                v-model.number="form.energy_indicator" 
                label="Ukazatel (kWh/m²)"
                type="number"
                help
              />
              <AppInput 
                v-model="form.energy_heating" 
                label="Vytápění"
                help
              />
            </div>
          </div>

        </div>

        <!-- Technical Parameters -->
        <div class="content-card">
          <div class="card-header">
            <span class="icon-box-small">
              <span class="material-icons icon-blue">construction</span>
            </span>
            <h2 class="card-title">Technické parametry</h2>
          </div>
          
          <div class="form-grid">
            <div class="form-row">
              <AppSelect v-model="form.tech_state" label="Stav objektu" help>
                <option>Velmi dobrý</option>
                <option>Dobrý</option>
                <option>Udržovaný</option>
                <option>Novostavba</option>
                <option>Před rekonstrukcí</option>
              </AppSelect>
            </div>

            <div class="form-row split">
              <AppInput 
                v-model.number="form.tech_floors" 
                label="Počet podlaží"
                type="number"
                help
              />
              <AppInput 
                v-model.number="form.tech_floors_under" 
                label="Podzemní podlaží"
                type="number"
                help
              />
            </div>
            
            <div class="form-row">
              <AppInput 
                v-model="form.tech_construction" 
                label="Typ stavby"
                help
              />
            </div>

            <div class="form-row">
              <AppInput 
                v-model.number="form.tech_land_area" 
                label="Plocha pozemku (m²)"
                type="number"
                help
              />
            </div>
          </div>

        </div>

        <!-- Revisions and Meters (Full Width) -->
        <div class="content-card col-span-2" style="grid-column: span 2;">
          <div class="card-header">
            <span class="icon-box-small">
              <span class="material-icons icon-blue">speed</span>
            </span>
            <h2 class="card-title">Revize a měřidla</h2>
          </div>

          <div class="grid-columns">
             <!-- Revisions Table -->
            <div class="table-section">
              <h4 class="section-subtitle">Platné revize</h4>
              <table class="data-table small">
                <thead>
                  <tr>
                    <th>Typ</th>
                    <th>Platnost do</th>
                    <th>Stav</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rev in form.revisions" :key="rev.id">
                     <td>{{ rev.type }}</td>
                     <td>{{ rev.validUntil }}</td>
                     <td>
                        <span class="status-badge" :class="rev.status === 'Platná' ? 'occupied' : 'vacant'">
                           {{ rev.status === 'Platná' ? 'Platné' : 'Propadlé' }}
                        </span>
                     </td>
                  </tr>
                  <tr v-if="!form.revisions?.length">
                    <td colspan="3" class="text-center text-gray-500 py-4">Žádné revize</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Meters Table -->
            <div class="table-section">
              <h4 class="section-subtitle">Stavy měřidel</h4>
              <table class="data-table small">
                <thead>
                  <tr>
                    <th>Měřidlo</th>
                    <th>Poslední stav</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="meter in form.meters" :key="meter.id">
                     <td>
                       <div class="flex items-center gap-2">
                         <span class="material-icons text-gray-400 text-sm">
                           {{ meter.type === 'Elektřina' ? 'bolt' : meter.type === 'Plyn' ? 'local_fire_department' : 'water_drop' }}
                         </span>
                         <div>
                            <div class="meter-type">{{ meter.type }}</div>
                            <div class="meter-serial">{{ meter.serialNumber }}</div>
                         </div>
                       </div>
                     </td>
                     <td><strong>{{ meter.lastValue }}</strong></td>
                     <td>
                       <button class="btn-text-blue" @click="openSettlement(meter)">
                         Vyúčtovat
                       </button>
                     </td>
                  </tr>
                   <tr v-if="!form.meters?.length">
                    <td colspan="3" class="text-center text-gray-500 py-4">Žádná měřidla</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Units Tab -->
      <div v-else-if="activeTab === 'units'" class="tab-pane">
        <UnitsTab 
          :property-id="form.id"
          :units="form.units || []"
          @unit-updated="handleUnitUpdated"
          @unit-created="handleUnitCreated"
          @unit-deleted="handleUnitDeleted"
          @print-settlement="handlePrintSettlement"
        />
      </div>

      <!-- Nájemci Tab -->
      <div v-else-if="activeTab === 'tenants'" class="tab-pane">
        <div class="content-card">
          <div class="card-header-flex">
            <div class="header-left-flex">
               <span class="material-icons icon-orange mr-2">group</span>
               <h2 class="card-title">Seznam nájemníků</h2>
            </div>
            <button class="btn-primary-small" @click="handleGlobalAddTenant">
              <span class="material-icons icon-tiny">add</span> Přidat nájemníka
            </button>
          </div>
          
          <div class="tenants-table-container">
            <table class="tenants-table">
              <thead>
                <tr>
                  <th>Jednotka</th>
                  <th>Nájemce</th>
                  <th>Kontakt</th>
                  <th>Smlouva</th>
                  <th>Nájemné</th>
                  <th>Kauce</th>
                  <th>Stav</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="unit in form.units" 
                  :key="unit.id"
                  class="tenant-row"
                  :class="{ 
                    'vacant-row': unit.status === 'Volné',
                    'clickable-row': unit.status === 'Pronajato'
                  }"
                  @click="handleTenantClick(unit)"
                >
                  <td class="unit-cell">
                    <div class="unit-label">{{ unit.label }}</div>
                    <div class="unit-disposition">{{ unit.disposition }}</div>
                  </td>
                  <td class="tenant-cell">
                    <template v-if="unit.status === 'Pronajato'">
                      <div class="tenant-info">
                        <div class="tenant-name">{{ unit.tenant }}</div>
                        <div class="occupancy-info">{{ unit.occupancy }}</div>
                      </div>
                    </template>
                    <span v-else class="vacant-label">Volná jednotka</span>
                  </td>
                  <td class="contact-cell">
                    <template v-if="unit.status === 'Pronajato'">
                      <div class="contact-item">
                        <span class="material-icons contact-icon">phone</span>
                        <span>{{ unit.phone }}</span>
                      </div>
                      <div class="contact-item">
                        <span class="material-icons contact-icon">email</span>
                        <span>{{ unit.email }}</span>
                      </div>
                    </template>
                    <span v-else class="no-data">-</span>
                  </td>
                  <td class="contract-cell">
                    <template v-if="unit.status === 'Pronajato'">
                      <div class="contract-dates">
                        <div class="date-from">Od: {{ unit.contractStart }}</div>
                        <div class="date-to">Do: {{ unit.contractEnd }}</div>
                      </div>
                    </template>
                    <span v-else class="no-data">-</span>
                  </td>
                  <td class="rent-cell">
                    <div class="rent-amount">{{ formatCurrency(unit.rent) }}</div>
                    <div v-if="unit.serviceCharges" class="service-charges">
                      + {{ formatCurrency(unit.serviceCharges) }} (sl.)
                    </div>
                  </td>
                  <td class="deposit-cell">
                    <span v-if="unit.isDeposited" class="deposit-badge paid">
                      ✓ {{ formatCurrency(unit.depositAmount) }}
                    </span>
                    <span v-else-if="unit.status === 'Pronajato'" class="deposit-badge unpaid">
                      ⚠ Nezaplacena
                    </span>
                    <span v-else class="no-data">-</span>
                  </td>
                  <td class="status-cell">
                    <span class="status-badge" :class="getStatusClass(unit.status)">
                      {{ unit.status }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button 
                        v-if="unit.status === 'Pronajato'" 
                        class="btn-icon btn-edit"
                        @click.stop="handleEditTenant(unit)"
                        title="Upravit nájemce"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button 
                        v-if="unit.status === 'Pronajato'" 
                        class="btn-icon btn-view"
                        @click.stop="navigateToTenantDetail(unit)"
                        title="Zobrazit detail nájemce"
                      >
                        <span class="material-icons">arrow_forward</span>
                      </button>
                      <button 
                        v-else 
                        class="btn-icon btn-add"
                        @click.stop="handleAddTenant(unit)"
                        title="Přidat nájemce"
                      >
                        <span class="material-icons">person_add</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="!form.units || form.units.length === 0" class="empty-state">
              <span class="material-icons">inbox</span>
              <p>Žádné jednotky k zobrazení</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Komunikace Tab -->
      <div v-else-if="activeTab === 'communication'" class="tab-pane">
        <!-- Tenant Filter Bar -->
        <div class="tenant-filter-bar">
          <div 
            class="filter-chip" 
            :class="{ active: !selectedTenantId }"
            @click="clearTenantSelection"
          >
            <span class="material-icons">business</span>
            Celý objekt
          </div>
          <div 
            v-for="unit in occupiedUnits" 
            :key="unit.id"
            class="filter-chip"
            :class="{ active: selectedUnitId === unit.id }"
            @click="selectTenant(unit)"
          >
            <div class="chip-avatar">{{ getInitials(unit.tenant) }}</div>
            <div class="chip-name">
              <span class="tenant-label">{{ unit.tenant }}</span>
              <span class="unit-label">{{ unit.label }}</span>
            </div>
          </div>
        </div>

        <!-- Communication Timeline Section -->
        <div v-if="selectedTenantId" class="content-card">
          <CommunicationTimeline 
            ref="communicationTimeline"
            :tenant-id="selectedTenantId"
            :property-id="form.id"
            @add-note="openNoteModal()"
            @quick-reminder="openNoteModal('reminder')"
            @quick-payment="openNoteModal('payment')"
          />
        </div>

        <!-- Show all property communications if no tenant selected -->
        <div v-else class="content-card">
          <div class="comm-header-info">
            <span class="material-icons info-icon">info</span>
            <p>Zobrazuji historii celého objektu. Vyberte nájemníka výše pro filtrování jeho specifické historie.</p>
          </div>
          
          <CommunicationTimeline 
            ref="propertyComm"
            :property-id="form.id"
            :show-quick-actions="false"
            @add-note="openNoteModal()"
          />
        </div>
      </div>

      <!-- Dokumenty Tab -->
      <div v-else-if="activeTab === 'documents'" class="tab-pane">
        <DocumentsTab :property-id="form.id" />
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="notification-toast">
      <span class="material-icons">check_circle</span> {{ notification }}
    </div>

    <!-- Modals -->
    <DocumentGeneratorModal 
      :isOpen="showDocModal"
      :property="form"
      :settlement-data="selectedSettlementForPrint"
      @close="showDocModal = false"
    />

    <EnergySettlementModal
      :isOpen="showSettlementModal"
      :meter="selectedMeter"
      @close="showSettlementModal = false"
      @save="showToast('Vyúčtování uloženo')"
    />

    <AddNoteModal
      :isOpen="showNoteModal"
      :tenant-id="selectedTenantId || 'T001'"
      :tenant-name="selectedTenantName || 'Nájemník'"
      :property-id="form.id"
      :unit-id="selectedUnitId"
      :quick-action="noteModalQuickAction"
      @close="showNoteModal = false"
      @save="handleNoteSave"
    />
    
    <AddTenantModal
      :isOpen="showAddTenantModal"
      :unit-id="selectedUnitId"
      :unit-name="selectedUnitLabel"
      :tenant="selectedTenantData"
      @close="showAddTenantModal = false"
      @save="handleTenantSave"
    />

    <!-- Mobile Action Bar (Sticky Bottom) -->
    <div class="mobile-action-bar">
      <a :href="'tel:' + (mainTenant?.phone || '')" class="mobile-action-btn primary" v-if="mainTenant">
        <span class="material-icons">call</span>
        <span>Volat</span>
      </a>
      <a :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(form.street + ' ' + form.houseNumber + ', ' + form.city)" target="_blank" class="mobile-action-btn secondary">
        <span class="material-icons">navigation</span>
        <span>Navigovat</span>
      </a>
      <button class="mobile-action-btn secondary" @click="showCommunicationModal = true" v-if="mainTenant">
        <span class="material-icons">chat</span>
        <span>Zpráva</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps, defineEmits, watch } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';

import { useRoute, useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { propertyService } from '../services/propertyService';
import { communicationService } from '../services/communicationService';
import { documentService } from '../services/documentService';
import DocumentGeneratorModal from './DocumentGeneratorModal.vue';
import EnergySettlementModal from './EnergySettlementModal.vue';
import DocumentsTab from './property/DocumentsTab.vue';
import CommunicationTimeline from './property/CommunicationTimeline.vue';
import AddNoteModal from './property/AddNoteModal.vue';
import AddTenantModal from './property/AddTenantModal.vue';
import TenantCard from './property/TenantCard.vue';
import UnitsTab from './property/UnitsTab.vue';
import PropertyScoreBadge from './property/PropertyScoreBadge.vue';
import ActionMenu from './ActionMenu.vue';
import { useNotification } from '@/composables/useNotification';
import { useRuianAutocomplete } from '@/composables/useRuianAutocomplete';

const props = defineProps({
  propertyId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['back']);
const { showSuccess, showInfo, showError } = useNotification();
const route = useRoute();
const router = useRouter();

// RUIAN Autocomplete
const { isLoading: isLoadingAddresses, suggestions: addressSuggestions, searchAddresses } = useRuianAutocomplete();
const addressSearchQuery = ref('');
const showAddressSuggestions = ref(false);
let addressSearchTimeout = null;

// State
const activeTab = ref(route.query.tab || 'basic');

// Sync tab with route query


watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    if (newTab === 'finance') {
      activeTab.value = 'tenants'; // Debt info is in tenants tab
    } else if (newTab === 'technical') {
      activeTab.value = 'tech'; // Map technical -> tech
    } else {
      activeTab.value = newTab;
    }
  }
}, { immediate: true });
const showCommunicationModal = ref(false); // Quick mock for messaging
const showDocModal = ref(false);
const showSettlementModal = ref(false);
const selectedMeter = ref(null);
const selectedTenantId = ref(null);
const selectedTenantName = ref(null);
const selectedUnitId = ref(null);
const selectedUnitLabel = ref('');
const selectedTenantData = ref(null);
const showNoteModal = ref(false);
const showAddTenantModal = ref(false);
const noteModalQuickAction = ref(null);
const communicationTimeline = ref(null);
const notification = ref(null);

const form = ref({
  id: '',
  name: '',
  // New header fields
  internalRef: '',
  listingDate: '',
  ownershipType: 'vlastni',
  // Address fields
  country: 'cz',
  region: '',
  district: '',
  street: '',
  houseNumber: '',
  city: '',
  cityPart: '',
  zipCode: '',
  cadastralArea: '',
  parcelNumber: '',
  // GPS coordinates
  latitude: null,
  longitude: null,
  // Basic data
  vymera_m2: 0,
  typ_vlastnictvi: '',
  image: '', 
  occupancyPercentage: 0,
  type: 'Bytový dům',
  revisions: [],
  meters: [],
  units: [],
  // Technical Data
  ean_kod: '',
  eic_kod: '',
  cislo_odberneho_mist: '',
  energy_class: '',
  energy_law: '',
  energy_indicator: 0,
  energy_heating: '',
  tech_state: '',
  tech_construction: '',
  tech_floors: 0,
  tech_floors_under: 0,
  tech_land_area: 0,
  tech_type: ''
});

import { calculatePropertyScore } from '@/utils/propertyScoring';

// Health Score Checks
const showActionMenu = ref(false);

const scoringData = computed(() => {
  return calculatePropertyScore(form.value);
});

const healthScore = computed(() => scoringData.value.score);
const healthStatus = computed(() => scoringData.value.status);
const scoreBreakdown = computed(() => scoringData.value.breakdown);

// Smart Tabs
const smartTabs = computed(() => {
  const expiredDocs = form.value.revisions?.filter(r => r.status !== 'Platná').length || 0;
  const debtTenants = form.value.units?.filter(u => u.paymentHistory?.some(p => p.status === 'unpaid')).length || 0;
  
  return [
    { id: 'basic', label: 'Základní info' },
    { id: 'tech', label: 'Technické údaje' },
    { id: 'units', label: 'Jednotky' },
    { 
      id: 'tenants', 
      label: 'Nájemci',
      badge: debtTenants > 0 ? `${debtTenants}` : null,
      badgeColor: 'amber'
    },
    { id: 'communication', label: 'Komunikace' },
    { 
      id: 'documents', 
      label: 'Dokumenty', 
      badge: expiredDocs > 0 ? `${expiredDocs}` : null,
      badgeColor: 'red'
    }
  ];
});

const mainTenant = computed(() => {
  if (!form.value.units || form.value.units.length === 0) return null;
  const occupiedUnit = form.value.units.find(u => u.tenant && u.tenant !== '-');
  return occupiedUnit ? { name: occupiedUnit.tenant, phone: occupiedUnit.phone } : null;
});

const occupiedUnits = computed(() => {
  return form.value.units?.filter(u => u.tenant && u.tenant !== '-') || [];
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(amount);
};

const getStatusClass = (status) => {
  const classMap = {
    'Pronajato': 'status-occupied',
    'Volné': 'status-vacant',
    'Výpověď': 'status-notice',
    'Rezervováno': 'status-reserved'
  };
  return classMap[status] || '';
};

// Tenant navigation handlers
const handleTenantClick = (unit) => {
  if (unit.status === 'Pronajato') {
    navigateToTenantDetail(unit);
  }
};

const navigateToTenantDetail = (unit) => {
  // Navigate to tenant detail page with both propertyId and tenantId
  router.push({ 
    name: 'TenantDetail', 
    params: { 
      propertyId: form.value.id,
      tenantId: `${form.value.id}-${unit.id}`
    }
  });
};

const clearTenantSelection = () => {
  selectedTenantId.value = null;
  selectedTenantName.value = null;
  selectedUnitId.value = null;
};

const handleHeaderEdit = () => {
  activeTab.value = 'basic';
  // Optional: scroll to first input
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleActionMenuAction = (action) => {
  console.log('Action selected:', action);
  showActionMenu.value = false;
  
  if (action === 'edit') {
    handleHeaderEdit();
  } else if (action === 'export-pdf') {
    showToast('Generuji PDF export...');
  } else if (action === 'generate-report') {
    showToast('Připravuji kompletní sestavu...');
  } else if (action === 'share-access') {
    showToast('Otevírám nastavení sdílení...');
  } else if (action === 'archive') {
    if (confirm('Opravdu chcete tuto nemovitost archivovat?')) {
      showToast('Nemovitost byla archivována');
    }
  } else if (action === 'delete') {
    if (confirm('Opravdu chcete tuto nemovitost smazat? Tato akce je nevratná.')) {
      showToast('Nemovitost byla smazána');
    }
  }
};


const openSettlement = (meter) => {
  selectedMeter.value = meter;
  showSettlementModal.value = true;
};

const selectTenant = (unit) => {
  const tenantMap = {
    'U001': 'T001', 'U002': 'T002', 'U003': 'T003', 'U004': 'T004', 'U005': 'T005'
  };
  
  selectedTenantId.value = tenantMap[unit.id] || null;
  selectedTenantName.value = unit.tenant;
  selectedUnitId.value = unit.id;
};

const handleViewContract = async (unit) => {
  try {
    showToast(`Hledám smlouvu pro: ${unit.tenant}...`);
    // Mock functionality
    setTimeout(() => {
        showToast('Smlouva zobrazena (mock)');
    }, 1000);
  } catch (error) {
    console.error('Error fetching contract:', error);
    showToast('Chyba při hledání smlouvy');
  }
};

const handleGlobalAddTenant = () => {
  const emptyUnit = form.value.units?.find(u => !u.tenant || u.tenant === '-' || u.status === 'Volné');
  if (emptyUnit) {
    selectedUnitId.value = emptyUnit.id;
    selectedUnitLabel.value = emptyUnit.label || `Jednotka ${emptyUnit.id}`;
    handleAddTenant(emptyUnit);
  } else {
    showToast('Žádná volná jednotka k dispozici');
  }
  showAddTenantModal.value = true;
};

// Unit event handlers
const handleUnitUpdated = (updatedUnit) => {
  const unitIndex = form.value.units?.findIndex(u => u.id === updatedUnit.id);
  if (unitIndex !== -1) {
    form.value.units[unitIndex] = { ...form.value.units[unitIndex], ...updatedUnit };
    showSuccess('Jednotka byla aktualizována');
  }
};

const handleUnitCreated = (newUnit) => {
  if (!form.value.units) {
    form.value.units = [];
  }
  form.value.units.push(newUnit);
  showSuccess('Nová jednotka byla přidána');
};

const handleUnitDeleted = (unitId) => {
  const unitIndex = form.value.units?.findIndex(u => u.id === unitId);
  if (unitIndex !== -1) {
    form.value.units.splice(unitIndex, 1);
  }
};


// Map helper functions
const openGoogleMaps = () => {
  const address = `${form.value.street} ${form.value.houseNumber}, ${form.value.city}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(url, '_blank');
};

const openStreetView = () => {
  const address = `${form.value.street} ${form.value.houseNumber}, ${form.value.city}`;
  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${form.value.latitude || 50.0755},${form.value.longitude || 14.4378}`;
  window.open(url, '_blank');
};

// Address autocomplete handlers
const handleAddressSearch = () => {
  // Debounce the search
  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
  }
  
  addressSearchTimeout = setTimeout(async () => {
    if (addressSearchQuery.value && addressSearchQuery.value.length >= 3) {
      await searchAddresses(addressSearchQuery.value);
      showAddressSuggestions.value = true;
    } else {
      showAddressSuggestions.value = false;
    }
  }, 300);
};

const selectAddress = (suggestion) => {
  // Fill all address fields
  form.value.street = suggestion.street || '';
  form.value.houseNumber = suggestion.houseNumber || '';
  if (suggestion.orientationNumber) {
    form.value.houseNumber += `/${suggestion.orientationNumber}`;
  }
  form.value.city = suggestion.city || '';
  form.value.cityPart = suggestion.cityPart || '';
  form.value.zipCode = suggestion.zipCode || '';
  form.value.district = suggestion.district || '';
  form.value.region = suggestion.region || '';
  form.value.cadastralArea = suggestion.cadastralArea || '';
  form.value.latitude = suggestion.latitude;
  form.value.longitude = suggestion.longitude;
  
  // Update search query to show selected address
  addressSearchQuery.value = suggestion.fullAddress;
  
  // Hide suggestions
  showAddressSuggestions.value = false;
  
  // Show success message
  showSuccess('Adresa byla automaticky vyplněna z RUIAN');
};

// Click outside handler to close suggestions
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.address-lookup-field')) {
      showAddressSuggestions.value = false;
    }
  });
}


const handleAddTenant = (unit) => {
  selectedUnitId.value = unit.id;
  selectedUnitLabel.value = unit.label;
  selectedTenantData.value = null; // Clear any previous tenant data
  showAddTenantModal.value = true;
};

const handleEditTenant = (unit) => {
  selectedUnitId.value = unit.id;
  selectedUnitLabel.value = unit.label;
  // Pass existing tenant data to the modal
  selectedTenantData.value = {
    tenant: unit.tenant,
    phone: unit.phone,
    email: unit.email,
    rent: unit.rent,
    depositAmount: unit.depositAmount,
    contractStart: unit.contractStart,
    contractEnd: unit.contractEnd
  };
  showAddTenantModal.value = true;
};

const handleTenantSave = (data) => {
  // Find unit and update it
  const unitIndex = form.value.units.findIndex(u => u.id === selectedUnitId.value);
  if (unitIndex !== -1) {
    const unit = form.value.units[unitIndex];
    unit.tenant = data.fullName;
    unit.phone = data.phone;
    unit.email = data.email;
    unit.rent = data.rent;
    unit.contractStart = data.startDate;
    unit.contractEnd = data.endDate;
    unit.status = 'Pronajato'; // Correct status
    unit.isOccupied = true; // Set occupied flag
    unit.isDeposited = !!data.deposit;
    unit.depositAmount = data.deposit || 0;
    
    // Reset payment history for new tenant only if it's a new tenant (not edit)
    if (!selectedTenantData.value) {
      unit.paymentHistory = [];
      showToast(`Nájemník ${data.fullName} byl úspěšně přidán.`);
    } else {
      showToast(`Data nájemníka ${data.fullName} byla aktualizována.`);
    }
  }
};

const openNoteModal = (quickAction = null) => {
  noteModalQuickAction.value = quickAction;
  showNoteModal.value = true;
};

const handleNoteSave = async (data) => {
  try {
    // Determine target ID (tenant or unit or property)
    const targetId = selectedTenantId.value || 'T001'; 
    await communicationService.addCommunication(targetId, data);
    showNoteModal.value = false;
    
    if (communicationTimeline.value) {
      communicationTimeline.value.refresh();
    }
    
    showToast('Záznam byl přidán');
  } catch (error) {
    console.error('Error saving note:', error);
    showToast('Chyba při ukládání záznamu');
  }
};

const selectedSettlementForPrint = ref(null);

const handlePrintSettlement = (settlement) => {
  selectedSettlementForPrint.value = settlement;
  showDocModal.value = true;
};

const showToast = (msg) => {
  notification.value = msg;
  setTimeout(() => { notification.value = null; }, 3000);
};

const handleUpdate = async () => {
  const updated = await propertyService.updateProperty(form.value.id, form.value);
  if (updated) {
    showToast('Uloženo successfully');
  }
};

onMounted(async () => {
  const data = await propertyService.getPropertyById(props.propertyId);
  if (data) {
    Object.assign(form.value, data);
    // Ensure lists are initialized
    if (!form.value.revisions) form.value.revisions = [];
    if (!form.value.meters) form.value.meters = [];
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.property-detail-wrapper {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 2rem;
}

/* Compact Header Card */
.property-header-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.header-main-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.health-badge-mini {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  background: white;
  flex-shrink: 0;
}

.health-badge-mini.green { border-color: #22c55e; color: #166534; background: #f0fdf4; }
.health-badge-mini.amber { border-color: #f59e0b; color: #92400e; background: #fffbeb; }
.health-badge-mini.red { border-color: #ef4444; color: #991b1b; background: #fef2f2; }

.health-score {
  font-size: 1rem;
  font-weight: 800;
}

.health-label {
  font-size: 0.65rem;
  font-weight: 700;
  margin-left: 1px;
}

.title-address-group {
  flex: 1;
  min-width: 0;
}

.property-title-compact {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.125rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.property-address-compact {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.property-address-compact .material-icons {
  font-size: 14px;
  color: #94a3b8;
}

.id-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.property-id-badge {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
  border: 1px solid #e2e8f0;
}

.header-stats-row {
  display: flex;
  gap: 1.5rem;
  padding: 0 1.5rem;
  border-left: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 80px;
}

.stat-label {
  font-size: 0.6875rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.header-actions-compact {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.btn-header-action {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-header-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.btn-header-icon {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-header-icon:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* Nav Bar */
.nav-bar {
  background: white;
  padding: 0 2rem;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  max-width: 1600px;
  margin: 0 auto 2rem auto;
}

.tabs {
  display: flex;
  gap: 2rem;
}

.tab-item {
  padding: 1.25rem 0.5rem;
  background: none;
  border: none;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-item:hover { color: #1e293b; }
.tab-item.active { color: #2563eb; border-bottom-color: #2563eb; }

/* Tab Badge */
.tab-badge {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 99px;
  font-weight: 700;
  line-height: 1.4;
}
.tab-badge.red { background: #fee2e2; color: #dc2626; }

/* Tenant Filter Bar */
.tenant-filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.tenant-filter-bar::-webkit-scrollbar {
  height: 4px;
}

.tenant-filter-bar::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.tenant-filter-bar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.filter-chip:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.filter-chip.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.chip-avatar {
  width: 32px;
  height: 32px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}

.filter-chip.active .chip-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.chip-name {
  display: flex;
  flex-direction: column;
}

.tenant-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.unit-label {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.filter-chip.active .unit-label {
  color: white;
}
.tab-badge.amber { background: #FFF7ED; color: #9A3412; }
.tab-badge.blue { background: #EFF6FF; color: #1E40AF; }

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-btn-secondary {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.action-btn-secondary:hover { background: #f8fafc; color: #1e293b; }

.save-btn {
  background: var(--save-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}
.save-btn:hover { background: var(--save-color-hover); }



/* Info Header Cards */
.info-header-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.info-card label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-card .card-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #0f172a;
  transition: all 0.2s;
}

.info-card .card-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Two Column Layout */
.info-two-columns {
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 2rem;
}

.info-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-right {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

/* Form Sections */
.form-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.form-grid-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row-compact .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-row-compact .form-group:only-child {
  grid-column: 1 / -1;
}

.form-row-compact label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-row-compact input,
.form-row-compact select {
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #0f172a;
  transition: all 0.2s;
  background: white;
}

.form-row-compact input:focus,
.form-row-compact select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Map Section */
.map-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  background: #f8fafc;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.map-icon {
  font-size: 4rem;
  color: #cbd5e1;
}

.map-text {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.map-coords {
  font-size: 0.8rem;
  color: #94a3b8;
  font-family: monospace;
  margin: 0;
}

.map-actions {
  display: flex;
  gap: 0.5rem;
}

.map-btn {
  flex: 1;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.map-btn:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.map-btn .material-icons {
  font-size: 18px;
}

/* Address Autocomplete */
.address-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 0.5rem;
}

.suggestion-item {

  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.suggestion-icon {
  color: #ef4444;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.suggestion-text {
  flex: 1;
  min-width: 0;
}

.suggestion-main {
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.suggestion-meta {
  font-size: 0.8rem;
  color: #64748b;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

.field-hint .material-icons {
  font-size: 16px;
  color: #2563eb;
}

/* Content Area */
.detail-content {
  padding: 0;
  max-width: 1600px;
  margin: 0 auto;
}

.tab-pane {
  display: grid;
  gap: 1.5rem;
}

.grid-columns {
  grid-template-columns: repeat(2, 1fr);
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.col-span-2 { grid-column: span 2; }

/* Existing Form Styles */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.form-row.split .form-group {
  flex: 1;
}

.form-row.full .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input.bg-gray, select.bg-gray {
  background-color: #f8fafc;
}

.input-icon {
  position: absolute;
  right: 12px;
  color: #94a3b8;
  font-size: 18px;
  cursor: help;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.icon-box-small {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.icon-orange { color: #ea580c; }
.icon-red { color: #dc2626; }
.icon-blue { color: #2563eb; }

/* Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  font-size: 0.825rem;
  text-transform: uppercase;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.occupied { background: #DCFCE7; color: #166534; }
.status-badge.vacant { background: #FEE2E2; color: #991B1B; }

.section-subtitle {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #475569;
    font-size: 0.95rem;
}

.meter-type { font-weight: 600; }
.meter-serial { font-size: 0.75rem; color: #64748b; }
.btn-text-blue { 
    background: none; border: none; color: #2563eb; font-weight: 600; cursor: pointer; text-decoration: underline;
}

.card-header-flex {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
}
.header-left-flex { display: flex; align-items: center; }
.btn-primary-small {
    background: #2563eb; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.85rem;
}
.icon-tiny { font-size: 16px; }

/* Tenants Table */
.tenants-table-container {
  margin-top: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.tenants-table {
  width: 100%;
  border-collapse: collapse;
}

.tenants-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.tenants-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.tenants-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.tenants-table tbody tr.clickable-row {
  cursor: pointer;
}

.tenants-table tbody tr.clickable-row:hover {
  background: #f8fafc;
}

.tenants-table tbody tr.vacant-row {
  background: #fefce8;
}

.tenants-table tbody tr.vacant-row:hover {
  background: #fef9c3;
}

.tenants-table td {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #334155;
  vertical-align: middle;
}

/* Table cells */
.unit-cell {
  font-weight: 600;
}

.unit-label {
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.unit-disposition {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 400;
}

.tenant-cell {
  vertical-align: middle;
}

/* Avatar removed per user request */

.tenant-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tenant-name {
  font-weight: 600;
  color: #0f172a;
}

.occupancy-info {
  font-size: 0.75rem;
  color: #64748b;
}

.vacant-label {
  color: #d97706;
  font-style: italic;
}

.contact-cell {
  vertical-align: middle;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.contract-dates {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-from, .date-to {
  font-size: 0.8125rem;
}

.date-from {
  color: #64748b;
}

.date-to {
  font-weight: 500;
  color: #0f172a;
}

.rent-cell {
  vertical-align: middle;
}

.rent-amount {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.service-charges {
  font-size: 0.75rem;
  color: #64748b;
}

.deposit-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.deposit-badge.paid {
  color: #166534;
  background: #dcfce7;
}

.deposit-badge.unpaid {
  color: #92400e;
  background: #fef3c7;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.status-occupied {
  background: #dcfce7;
  color: #166534;
}

.status-vacant {
  background: #fee2e2;
  color: #991b1b;
}

.status-notice {
  background: #fef3c7;
  color: #92400e;
}

.status-reserved {
  background: #dbeafe;
  color: #1e40af;
}

.actions-cell {
  text-align: center;
}

.btn-view-detail,
.btn-add-tenant {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #2563eb;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-view-detail:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.btn-add-tenant {
  color: #059669;
}

.btn-add-tenant:hover {
  background: #d1fae5;
  color: #047857;
}

.no-data {
  color: #cbd5e1;
  font-style: italic;
}


.comm-header-info {
    display: flex; gap: 1rem; color: #64748b; padding: 1rem; background: #f8fafc; border-radius: 8px; align-items: center;
}


.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.btn-icon .material-icons {
  font-size: 18px;
}

.btn-icon:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.btn-edit:hover {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.btn-view:hover {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.btn-add:hover {
  color: #16a34a;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

/* Mobile Action Bar */
.mobile-action-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
  gap: 0.75rem;
}

.mobile-action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.mobile-action-btn.primary { background: #2563eb; color: white; }
.mobile-action-btn.secondary { background: #f1f5f9; color: #475569; }
.mobile-action-btn .material-icons { font-size: 20px; }

/* Notification */
.notification-toast {
    position: fixed; bottom: 2rem; right: 2rem; background: #064e3b; color: white; padding: 1rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); z-index: 100;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-section { padding: 2rem; height: auto; }
  .grid-columns { grid-template-columns: 1fr; }
  .nav-bar, .detail-content { padding: 0 2rem; }
  .hero-meta { gap: 1rem; }
}

@media (max-width: 640px) {
  .hero-title { font-size: 2rem; }
  .nav-bar { overflow-x: auto; }
  .col-span-2 { grid-column: span 1; }
  .mobile-action-bar { display: flex; }
  .property-detail-wrapper { padding-bottom: 80px; }
}
</style>
