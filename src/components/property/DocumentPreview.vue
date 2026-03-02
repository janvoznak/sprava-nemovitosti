<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="preview-container">
      <div class="preview-header">
        <div class="header-info">
          <h3 class="preview-title">{{ document?.name }}</h3>
          <span class="file-size">{{ formatFileSize(document?.fileSize) }}</span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="handleDownload" title="Stáhnout">
            <span class="material-icons">download</span>
          </button>
          <button class="action-btn fullscreen-btn" @click="toggleFullscreen" title="Celá obrazovka">
            <span class="material-icons">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
          </button>
          <button class="action-btn close-btn" @click="closeModal">×</button>
        </div>
      </div>

      <div class="preview-body" :class="{ fullscreen: isFullscreen }">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Načítání dokumentu...</p>
        </div>

        <!-- PDF Preview -->
        <div v-else-if="document && isPDF" class="pdf-preview">
          <iframe 
            :src="previewUrl" 
            frameborder="0"
            class="pdf-frame"
            title="PDF Preview"
          ></iframe>
        </div>

        <!-- Image Preview -->
        <div v-else-if="document && isImage" class="image-preview">
          <img :src="previewUrl" :alt="document.name" class="preview-image">
          <div class="image-controls">
            <button class="control-btn" @click="zoomOut">
              <span class="material-icons">zoom_out</span>
            </button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="control-btn" @click="zoomIn">
              <span class="material-icons">zoom_in</span>
            </button>
          </div>
        </div>

        <!-- Unsupported Format -->
        <div v-else class="unsupported-preview">
          <div class="unsupported-icon">📄</div>
          <p class="unsupported-text">Náhled není k dispozici</p>
          <p class="unsupported-hint">Pro zobrazení tohoto dokumentu musíte soubor stáhnout</p>
          <button class="btn btn-primary" @click="handleDownload">
            <span class="material-icons">download</span>
            Stáhnout soubor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { documentService } from '@/services/documentService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'download'])

const loading = ref(false)
const previewUrl = ref('')
const isFullscreen = ref(false)
const zoomLevel = ref(1)

const isPDF = computed(() => {
  return props.document && props.document.fileType === 'application/pdf'
})

const isImage = computed(() => {
  return props.document && props.document.fileType.startsWith('image/')
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.document) {
    await loadPreview()
  } else {
    previewUrl.value = ''
    zoomLevel.value = 1
  }
})

const loadPreview = async () => {
  loading.value = true
  try {
    previewUrl.value = await documentService.getPreviewUrl(props.document.id)
  } catch (error) {
    console.error('Error loading preview:', error)
  } finally {
    loading.value = false
  }
}

const handleDownload = () => {
  emit('download', props.document)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25
  }
}

const closeModal = () => {
  isFullscreen.value = false
  emit('close')
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  return documentService.formatFileSize(bytes)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.preview-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.preview-header {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
}

.preview-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
  font-size: 1.5rem;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.action-btn .material-icons {
  font-size: 20px;
}

.action-btn.close-btn {
  font-size: 2rem;
  font-weight: 300;
}

.preview-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #f8fafc;
}

.preview-body.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
}

.loading-state, .unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.pdf-preview {
  width: 100%;
  height: 100%;
}

.pdf-frame {
  width: 100%;
  height: 100%;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: auto;
  background: #1e293b;
}

.preview-image {
  max-width: 100%;
  max-height: calc(100% - 60px);
  object-fit: contain;
  transform-origin: center;
}

.image-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  color: #3b82f6;
}

.control-btn .material-icons {
  font-size: 24px;
}

.zoom-level {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.unsupported-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.unsupported-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.unsupported-hint {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.btn {
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

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn .material-icons {
  font-size: 18px;
}
</style>
