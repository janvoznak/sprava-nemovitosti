<template>
  <div class="communication-note" :class="`type-${communication.type}`">
    <!-- Timeline Marker -->
    <div class="timeline-marker" :style="{ backgroundColor: getTypeColor(communication.type) }"></div>
    
    <!-- Note Content -->
    <div class="note-content">
      <!-- Header -->
      <div class="note-header">
        <div class="header-left">
          <span class="type-icon">{{ getTypeIcon(communication.type) }}</span>
          <h4 class="note-title">{{ communication.title }}</h4>
          <span class="type-badge" :style="{ 
            backgroundColor: getTypeColor(communication.type) + '20',
            color: getTypeColor(communication.type)
          }">
            {{ getTypeLabel(communication.type) }}
          </span>
        </div>
        <div class="header-right">
          <span class="note-datetime">{{ formatDateTime(communication.createdAt) }}</span>
          <button v-if="editable" class="action-icon-btn" @click="handleEdit" title="Upravit">
            <span class="material-icons">edit</span>
          </button>
          <button v-if="deletable" class="action-icon-btn delete" @click="handleDelete" title="Smazat">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>

      <!-- Content Text -->
      <div class="note-body">
        <p class="note-text">{{ communication.content }}</p>
      </div>

      <!-- Attachments -->
      <div v-if="communication.attachments && communication.attachments.length > 0" class="note-attachments">
        <div v-for="attachment in communication.attachments" :key="attachment.id" class="attachment-item">
          <span class="material-icons attachment-icon">attach_file</span>
          <span class="attachment-name">{{ attachment.name }}</span>
          <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
          <button class="attachment-download" @click="downloadAttachment(attachment)">
            <span class="material-icons">download</span>
          </button>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="communication.tags && communication.tags.length > 0" class="note-tags">
        <span v-for="tag in communication.tags" :key="tag" class="tag-chip">
          {{ tag }}
        </span>
      </div>

      <!-- Metadata -->
      <div v-if="hasMetadata" class="note-metadata">
        <div v-if="communication.metadata.amount" class="metadata-item">
          <span class="material-icons">payments</span>
          <span>Částka: <strong>{{ formatCurrency(communication.metadata.amount) }}</strong></span>
        </div>
        <div v-if="communication.metadata.dueDate" class="metadata-item">
          <span class="material-icons">event</span>
          <span>Splatnost: <strong>{{ formatDate(communication.metadata.dueDate) }}</strong></span>
        </div>
        <div v-if="communication.metadata.paymentDate" class="metadata-item">
          <span class="material-icons">event</span>
          <span>Datum platby: <strong>{{ formatDate(communication.metadata.paymentDate) }}</strong></span>
        </div>
        <div v-if="communication.metadata.paymentMethod" class="metadata-item">
          <span class="material-icons">account_balance</span>
          <span>Způsob: <strong>{{ communication.metadata.paymentMethod }}</strong></span>
        </div>
        <div v-if="communication.metadata.resolution" class="metadata-item resolution">
          <span class="material-icons">{{  getResolutionIcon(communication.metadata.resolution) }}</span>
          <span class="resolution-badge" :class="communication.metadata.resolution">
            {{ getResolutionLabel(communication.metadata.resolution) }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="note-footer">
        <span class="created-by">{{ communication.createdBy }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { communicationService } from '@/services/communicationService'

const props = defineProps({
  communication: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  deletable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'delete', 'download'])

const hasMetadata = computed(() => {
  const meta = props.communication.metadata
  return meta && (meta.amount || meta.dueDate || meta.paymentDate || meta.paymentMethod || meta.resolution)
})

const getTypeIcon = (type) => {
  return communicationService.getTypeIcon(type)
}

const getTypeLabel = (type) => {
  return communicationService.getTypeLabel(type)
}

const getTypeColor = (type) => {
  return communicationService.getTypeColor(type)
}

const formatDateTime = (dateString) => {
  return communicationService.formatDateTime(dateString)
}

const formatDate = (dateString) => {
  return communicationService.formatDate(dateString)
}

const formatCurrency = (amount) => {
  return communicationService.formatCurrency(amount)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getResolutionIcon = (resolution) => {
  const icons = {
    pending: 'schedule',
    resolved: 'check_circle',
    escalated: 'warning'
  }
  return icons[resolution] || 'help'
}

const getResolutionLabel = (resolution) => {
  const labels = {
    pending: 'Nevyřízeno',
    resolved: 'Vyřešeno',
    escalated: 'Eskalováno'
  }
  return labels[resolution] || resolution
}

const handleEdit = () => {
  emit('edit', props.communication)
}

const handleDelete = () => {
  emit('delete', props.communication)
}

const downloadAttachment = (attachment) => {
  emit('download', attachment)
}
</script>

<style scoped>
.communication-note {
  position: relative;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px white, 0 0 0 5px currentColor;
}

/* Timeline vertical line */
.communication-note::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 24px;
  bottom: -24px;
  width: 2px;
  background: #e2e8f0;
}

.communication-note:last-child::before {
  display: none;
}

.note-content {
  flex: 1;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.communication-note:hover .note-content {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.type-icon {
  font-size: 1.5rem;
}

.note-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.note-datetime {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

.action-icon-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.action-icon-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.action-icon-btn .material-icons {
  font-size: 18px;
}

.note-body {
  margin-bottom: 1rem;
}

.note-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #475569;
  white-space: pre-wrap;
}

.note-attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

.attachment-icon {
  font-size: 18px;
  color: #64748b;
}

.attachment-name {
  font-weight: 500;
  flex: 1;
}

.attachment-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.attachment-download {
  background: transparent;
  border: 1px solid #e2e8f0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  transition: all 0.2s;
}

.attachment-download:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.attachment-download .material-icons {
  font-size: 16px;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-chip {
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.note-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

.metadata-item .material-icons {
  font-size: 18px;
  color: #64748b;
}

.metadata-item strong {
  color: #1e293b;
}

.metadata-item.resolution {
  width: 100%;
}

.resolution-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.resolution-badge.pending {
  background: #fffbeb;
  color: #92400e;
}

.resolution-badge.resolved {
  background: #dcfce7;
  color: #166534;
}

.resolution-badge.escalated {
  background: #fef2f2;
  color: #991b1b;
}

.note-footer {
  font-size: 0.75rem;
  color: #94a3b8;
}

.created-by {
  font-style: italic;
}
</style>
