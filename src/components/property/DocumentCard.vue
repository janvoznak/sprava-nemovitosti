<template>
  <div class="document-card" :class="`category-${document.category}`">
    <div class="document-icon-wrapper">
      <div class="document-icon">
        {{ getFileIcon(document.fileType) }}
      </div>
      <span class="category-badge">{{ getCategoryLabel(document.category) }}</span>
    </div>

    <div class="document-info">
      <h4 class="document-name" :title="document.name">{{ document.name }}</h4>
      <div class="document-meta">
        <span class="meta-item">
          <span class="meta-icon">📦</span>
          {{ formatFileSize(document.fileSize) }}
        </span>
        <span class="meta-separator">•</span>
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          {{ formatDate(document.uploadDate) }}
        </span>
        <span v-if="document.version > 1" class="meta-separator">•</span>
        <span v-if="document.version > 1" class="meta-item version">
          v{{ document.version }}
        </span>
      </div>

      <!-- Metadata highlights -->
      <div v-if="hasMetadata" class="document-metadata">
        <span v-if="document.metadata.tenant" class="metadata-tag">
          👤 {{ document.metadata.tenant }}
        </span>
        <span v-if="document.metadata.expirationDate" class="metadata-tag expiration">
          ⏰ Platnost do {{ formatDate(document.metadata.expirationDate) }}
        </span>
        <span v-if="document.metadata.amount" class="metadata-tag amount">
          💰 {{ formatCurrency(document.metadata.amount) }}
        </span>
      </div>
    </div>

    <div class="document-actions">
      <button 
        class="action-btn preview" 
        @click="handlePreview"
        title="Zobrazit náhled"
      >
        <span class="material-icons">visibility</span>
      </button>
      <button 
        class="action-btn download" 
        @click="handleDownload"
        title="Stáhnout"
      >
        <span class="material-icons">download</span>
      </button>
      <button 
        class="action-btn delete" 
        @click="handleDelete"
        title="Smazat"
      >
        <span class="material-icons">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { documentService } from '@/services/documentService'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['preview', 'download', 'delete'])

const hasMetadata = computed(() => {
  return props.document.metadata && (
    props.document.metadata.tenant ||
    props.document.metadata.expirationDate ||
    props.document.metadata.amount
  )
})

const getFileIcon = (fileType) => {
  return documentService.getFileIcon(fileType)
}

const getCategoryLabel = (category) => {
  return documentService.getCategoryLabel(category)
}

const formatFileSize = (bytes) => {
  return documentService.formatFileSize(bytes)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', { 
    day: 'numeric', 
    month: 'numeric', 
    year: 'numeric' 
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { 
    style: 'currency', 
    currency: 'CZK', 
    minimumFractionDigits: 0 
  }).format(value)
}

const handlePreview = () => {
  emit('preview', props.document)
}

const handleDownload = () => {
  emit('download', props.document)
}

const handleDelete = () => {
  emit('delete', props.document)
}
</script>

<style scoped>
.document-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.document-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* Category-based left border */
.category-contracts {
  border-left: 4px solid #3b82f6;
}

.category-revisions {
  border-left: 4px solid #f59e0b;
}

.category-invoices {
  border-left: 4px solid #22c55e;
}

.category-insurance {
  border-left: 4px solid #8b5cf6;
}

.category-photos {
  border-left: 4px solid #ec4899;
}

.document-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.document-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 1.75rem;
}

.category-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
}

.document-info {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.document-name {
  margin: 0 0 0.5rem 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 0.875rem;
}

.meta-separator {
  color: #cbd5e1;
}

.meta-item.version {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.document-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.metadata-tag {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metadata-tag.expiration {
  background: #fffbeb;
  border-color: #fbbf24;
  color: #92400e;
}

.metadata-tag.amount {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
  font-weight: 600;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.action-btn .material-icons {
  font-size: 18px;
}

.action-btn.preview {
  color: #2563eb;
}

.action-btn.preview:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.action-btn.download {
  color: #22c55e;
}

.action-btn.download:hover {
  background: #dcfce7;
  border-color: #22c55e;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
}
</style>
