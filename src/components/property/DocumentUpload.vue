<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          <span class="icon">📤</span>
          Nahrát dokument
        </h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Drag & Drop Zone -->
        <div 
          class="drop-zone"
          :class="{ 'drag-over': isDragging, 'has-files': selectedFiles.length > 0 }"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            style="display: none"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          >
          
          <div v-if="selectedFiles.length === 0" class="drop-zone-empty">
            <div class="drop-icon">📁</div>
            <p class="drop-text">Přetáhněte soubory sem</p>
            <p class="drop-subtext">nebo klikněte pro výběr</p>
            <p class="drop-hint">Podporované formáty: PDF, JPG, PNG, DOCX, XLSX (max 10MB)</p>
          </div>

          <div v-else class="selected-files-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file">
              <span class="file-icon">{{ getFileIcon(file.type) }}</span>
              <div class="file-info">
                <p class="file-name">{{ file.name }}</p>
                <p class="file-size">{{ formatFileSize(file.size) }}</p>
              </div>
              <button class="remove-file-btn" @click.stop="removeFile(index)">×</button>
            </div>
          </div>
        </div>

        <!-- Validation Error -->
        <div v-if="validationError" class="validation-error">
          ⚠️ {{ validationError }}
        </div>

        <!-- Category Selection -->
        <div class="form-group">
          <label class="form-label">Kategorie</label>
          <div class="category-buttons">
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              :class="['category-btn', { active: category === cat.id }]"
              @click="category = cat.id"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-label">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Optional Metadata -->
        <div class="form-group">
          <label class="form-label">Poznámky (volitelné)</label>
          <textarea 
            v-model="notes"
            class="form-textarea"
            rows="3"
            placeholder="Např. dodatečné informace o dokumentu..."
          ></textarea>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">Nahrávání... {{ uploadProgress }}%</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal" :disabled="uploading">
          Zrušit
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleUpload"
          :disabled="selectedFiles.length === 0 || uploading || !category"
        >
          {{ uploading ? 'Nahrávám...' : `Nahrát (${selectedFiles.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { documentService } from '@/services/documentService'
import { useNotification } from '@/composables/useNotification'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  propertyId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'uploaded'])

const { showSuccess, showError } = useNotification()

const fileInput = ref(null)
const selectedFiles = ref([])
const isDragging = ref(false)
const category = ref('contracts')
const notes = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const validationError = ref('')

const categories = [
  { id: 'contracts', icon: '📄', label: 'Smlouvy' },
  { id: 'revisions', icon: '🔧', label: 'Revize' },
  { id: 'invoices', icon: '💰', label: 'Faktury' },
  { id: 'insurance', icon: '🛡️', label: 'Pojištění' },
  { id: 'photos', icon: '📷', label: 'Fotky' }
]

const triggerFileInput = () => {
  if (selectedFiles.value.length === 0) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  validationError.value = ''
  
  for (const file of files) {
    const validation = documentService.validateFile(file)
    if (!validation.valid) {
      validationError.value = validation.error
      return
    }
  }
  
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const uploadPromises = selectedFiles.value.map(async (file, index) => {
      const metadata = {
        category: category.value,
        metadata: {
          notes: notes.value
        },
        tags: [new Date().getFullYear().toString()]
      }

      await documentService.uploadDocument(props.propertyId, file, metadata)
      
      // Update progress
      uploadProgress.value = Math.round(((index + 1) / selectedFiles.value.length) * 100)
    })

    await Promise.all(uploadPromises)

    showSuccess(`Úspěšně nahráno ${selectedFiles.value.length} dokumentů`)
    emit('uploaded')
    closeModal()
  } catch (error) {
    showError('Chyba při nahrávání dokumentů')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const closeModal = () => {
  if (!uploading.value) {
    selectedFiles.value = []
    category.value = 'contracts'
    notes.value = ''
    validationError.value = ''
    emit('close')
  }
}

const getFileIcon = (fileType) => {
  return documentService.getFileIcon(fileType)
}

const formatFileSize = (bytes) => {
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-title .icon {
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #94a3b8;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.drop-zone:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.drop-zone.drag-over {
  border-color: #2563eb;
  background: #dbeafe;
  transform: scale(1.02);
}

.drop-zone.has-files {
  cursor: default;
  border-style: solid;
  border-color: #22c55e;
  background: #f0fdf4;
}

.drop-zone.has-files:hover {
  background: #f0fdf4;
}

.drop-zone-empty {
  padding: 2rem 1rem;
}

.drop-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.drop-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.drop-subtext {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
}

.drop-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.selected-files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.remove-file-btn {
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
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.validation-error {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.category-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.category-btn {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.category-btn.active {
  border-color: #2563eb;
  background: #2563eb;
  color: white;
}

.cat-icon {
  font-size: 1.5rem;
}

.cat-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
