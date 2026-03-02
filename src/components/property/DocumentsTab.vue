<template>
  <div class="documents-tab">
    <!-- Header -->
    <div class="tab-header">
      <div class="header-left">
        <h3 class="tab-title">
          <span class="icon">📁</span>
          Dokumenty
        </h3>
        <span v-if="documents.length > 0" class="document-count">
          {{ documents.length }} dokumentů
        </span>
      </div>
      <button class="btn-primary" @click="openUploadModal">
        <span class="material-icons">upload_file</span>
        Nahrát dokument
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Načítání dokumentů...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filter & Search Bar -->
      <div v-if="documents.length > 0" class="filters-bar">
        <!-- Category Filters -->
        <div class="category-filters">
          <button 
            :class="['filter-btn', { active: activeCategory === 'all' }]"
            @click="activeCategory = 'all'"
          >
            Vše
            <span class="filter-count">{{ documents.length }}</span>
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['filter-btn', { active: activeCategory === cat.id }]"
            @click="activeCategory = cat.id"
          >
            <span class="filter-icon">{{ cat.icon }}</span>
            {{ cat.label }}
            <span class="filter-count">{{ getCategoryCount(cat.id) }}</span>
          </button>
        </div>

        <!-- Search & Sort -->
        <div class="search-sort-bar">
          <div class="search-box">
            <span class="material-icons search-icon">search</span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Hledat v dokumentech..."
              class="search-input"
            >
            <button 
              v-if="searchQuery" 
              class="clear-btn"
              @click="searchQuery = ''"
            >
              ×
            </button>
          </div>

          <select v-model="sortBy" class="sort-select">
            <option value="date-desc">Nejnovější</option>
            <option value="date-asc">Nejstarší</option>
            <option value="name-asc">Název A-Z</option>
            <option value="name-desc">Název Z-A</option>
            <option value="size-desc">Největší</option>
            <option value="size-asc">Nejmenší</option>
          </select>
        </div>
      </div>

      <!-- Documents List / Empty State -->
      <div v-if="filteredDocuments.length === 0 && searchQuery" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-text">Žádné výsledky pro "{{ searchQuery }}"</p>
        <button class="btn-secondary" @click="searchQuery = ''">Vymazat hledání</button>
      </div>

      <div v-else-if="filteredDocuments.length === 0 && activeCategory !== 'all'" class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">Žádné dokumenty v kategorii "{{ getActiveCategoryLabel() }}"</p>
        <button class="btn-primary" @click="openUploadModal">
          <span class="material-icons">upload_file</span>
          Nahrát první dokument
        </button>
      </div>

      <div v-else-if="documents.length === 0" class="empty-state-upload">
        <div class="empty-icon-large">📁</div>
        <h4>Zatím nejsou nahrané žádné dokumenty</h4>
        <p>Nahrajte první dokument kliknutím na tlačítko nebo přetažením souboru</p>
        <button class="btn-primary-large" @click="openUploadModal">
          <span class="material-icons">upload_file</span>
          Nahrát dokumenty
        </button>
      </div>

      <div v-else class="documents-list">
        <DocumentCard 
          v-for="doc in filteredDocuments" 
          :key="doc.id"
          :document="doc"
          @preview="handlePreview"
          @download="handleDownload"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Upload Modal -->
    <DocumentUpload
      :is-open="isUploadModalOpen"
      :property-id="propertyId"
      @close="isUploadModalOpen = false"
      @uploaded="handleUploaded"
    />

    <!-- Preview Modal -->
    <DocumentPreview
      :is-open="isPreviewModalOpen"
      :document="selectedDocument"
      @close="isPreviewModalOpen = false"
      @download="handleDownload"
    />

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click.self="showDeleteDialog = false">
      <div class="delete-dialog">
        <h3>Smazat dokument?</h3>
        <p>Opravdu chcete smazat dokument <strong>{{ documentToDelete?.name }}</strong>?</p>
        <p class="warning-text">Tato akce je nevratná.</p>
        <div class="dialog-actions">
          <button class="btn-secondary" @click="showDeleteDialog = false">Zrušit</button>
          <button class="btn-danger" @click="confirmDelete">Smazat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { documentService } from '@/services/documentService'
import { useNotification } from '@/composables/useNotification'
import DocumentCard from './DocumentCard.vue'
import DocumentUpload from './DocumentUpload.vue'
import DocumentPreview from './DocumentPreview.vue'

const props = defineProps({
  propertyId: {
    type: String,
    required: true
  }
})

const { showSuccess, showError } = useNotification()

const documents = ref([])
const loading = ref(true)
const activeCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('date-desc')
const isUploadModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const selectedDocument = ref(null)
const showDeleteDialog = ref(false)
const documentToDelete = ref(null)

const categories = [
  { id: 'contracts', icon: '📄', label: 'Smlouvy' },
  { id: 'revisions', icon: '🔧', label: 'Revize' },
  { id: 'invoices', icon: '💰', label: 'Faktury' },
  { id: 'insurance', icon: '🛡️', label: 'Pojištění' },
  { id: 'photos', icon: '📷', label: 'Fotky' }
]

const loadDocuments = async () => {
  try {
    loading.value = true
    documents.value = await documentService.getDocuments(props.propertyId)
  } catch (error) {
    showError('Nepodařilo se načíst dokumenty')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(doc => doc.category === activeCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (doc.metadata.tenant && doc.metadata.tenant.toLowerCase().includes(query))
    )
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.uploadDate) - new Date(a.uploadDate)
      case 'date-asc':
        return new Date(a.uploadDate) - new Date(b.uploadDate)
      case 'name-asc':
        return a.name.localeCompare(b.name, 'cs')
      case 'name-desc':
        return b.name.localeCompare(a.name, 'cs')
      case 'size-desc':
        return b.fileSize - a.fileSize
      case 'size-asc':
        return a.fileSize - b.fileSize
      default:
        return 0
    }
  })

  return filtered
})

const getCategoryCount = (categoryId) => {
  return documents.value.filter(doc => doc.category === categoryId).length
}

const getActiveCategoryLabel = () => {
  const cat = categories.find(c => c.id === activeCategory.value)
  return cat ? cat.label : ''
}

const openUploadModal = () => {
  isUploadModalOpen.value = true
}

const handlePreview = (document) => {
  selectedDocument.value = document
  isPreviewModalOpen.value = true
}

const handleDownload = async (document) => {
  try {
    const url = await documentService.downloadDocument(document.id)
    // In mock mode, just show success
    // In real app, would trigger actual download
    showSuccess(`Stahování: ${document.name}`)
    console.log('Download URL:', url)
  } catch (error) {
    showError('Nepodařilo se stáhnout dokument')
    console.error(error)
  }
}

const handleDelete = (document) => {
  documentToDelete.value = document
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await documentService.deleteDocument(documentToDelete.value.id)
    documents.value = documents.value.filter(d => d.id !== documentToDelete.value.id)
    showSuccess('Dokument byl smazán')
    showDeleteDialog.value = false
    documentToDelete.value = null
  } catch (error) {
    showError('Nepodařilo se smazat dokument')
    console.error(error)
  }
}

const handleUploaded = async () => {
  isUploadModalOpen.value = false
  await loadDocuments()
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.documents-tab {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tab-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-title .icon {
  font-size: 1.5rem;
}

.document-count {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary .material-icons {
  font-size: 18px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.filter-icon {
  font-size: 1rem;
}

.filter-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: center;
}

.filter-btn.active .filter-count {
  background: #2563eb;
  color: white;
}

.search-sort-bar {
  display: flex;
  gap: 0.75rem;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #94a3b8;
  font-size: 20px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.clear-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.sort-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  background: white;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.empty-state-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.empty-icon-large {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.empty-state-upload h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-state-upload p {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0 0 2rem 0;
}

.btn-primary-large {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-primary-large .material-icons {
  font-size: 24px;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
}

/* Delete Dialog */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.delete-dialog h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.delete-dialog p {
  margin: 0 0 0.75rem 0;
  font-size: 0.9375rem;
  color: #475569;
}

.warning-text {
  color: #dc2626;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
}
</style>
