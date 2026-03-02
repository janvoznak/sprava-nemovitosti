<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">{{ isQuickReminder ? '📧 Zaslat upomínku' : isQuickPayment ? '💰 Zaznamenat platbu' : (!tenantId ? '🏗️ Nový tiket údržby' : '📝 Nová poznámka') }}</h3>
        <button class="close-btn" @click="handleClose">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Form -->
      <div class="modal-body">
        <!-- Quick Reminder Form -->
        <div v-if="isQuickReminder">
          <AppInput 
            v-model.number="form.amount"
            label="Částka dlužného nájmu"
            type="number"
            placeholder="Částka v Kč"
            help
          />
          <AppInput 
            v-model="form.dueDate"
            label="Splatnost"
            type="date"
            help
          />
          <AppTextarea 
            v-model="form.content"
            label="Poznámka (volitelné)"
            :rows="3"
            placeholder="Např. Nájemník přislíbil platbu..."
            help
          />
        </div>


        <!-- Quick Payment Form -->
        <div v-if="isQuickPayment">
          <AppInput 
            v-model.number="form.amount"
            label="Částka"
            type="number"
            placeholder="Částka v Kč"
            help
          />
          <AppInput 
            v-model="form.paymentDate"
            label="Datum platby"
            type="date"
            help
          />
          <AppSelect 
            v-model="form.paymentMethod" 
            label="Způsob platby"
            help
          >
            <option value="bankovní převod">Bankovní převod</option>
            <option value="hotovost">Hotovost</option>
            <option value="karta">Platební karta</option>
          </AppSelect>
          <AppTextarea 
            v-model="form.content"
            label="Poznámka (volitelné)"
            :rows="2"
            placeholder="Např. Platba proběhla bez problémů..."
            help
          />
        </div>


        <!-- Full Note Form -->
        <div v-if="!isQuickReminder && !isQuickPayment">
          <div class="form-group">
            <label>Typ záznamu</label>
            <div class="type-buttons">
              <button 
                v-for="type in typeOptions" 
                :key="type.value"
                :class="['type-btn', { active: form.type === type.value }]"
                @click="form.type = type.value"
                type="button"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-label">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <AppInput 
            v-model="form.title"
            label="Název"
            placeholder="Např. Telefonát - dotaz na parkování"
            help
          />

          <AppTextarea 
            v-model="form.content"
            label="Obsah"
            :rows="5"
            placeholder="Popis komunikace..."
            help
          />
        </div>


        <div v-if="!isQuickReminder && !isQuickPayment" class="form-group">
          <label>Tagy (volitelné)</label>
          <div class="tags-input">
            <div v-for="(tag, index) in form.tags" :key="index" class="tag-chip">
              {{ tag }}
              <button @click="removeTag(index)" type="button" class="tag-remove">×</button>
            </div>
            <input 
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
              type="text"
              placeholder="Přidat tag..."
              class="tag-input"
            >
          </div>
          <p class="help-text">Stiskněte Enter nebo čárku pro přidání tagu</p>
        </div>

        <!-- Metadata fields based on type -->
        <div v-if="!isQuickReminder && !isQuickPayment && (form.type === 'reminder' || form.type === 'payment')" class="form-row">
          <AppInput 
            v-model.number="form.amount"
            label="Částka"
            type="number"
            placeholder="Částka"
            help
          />
          
          <AppInput 
            v-if="form.type === 'reminder'"
            v-model="form.dueDate"
            label="Splatnost"
            type="date"
            help
          />

          <AppInput 
            v-if="form.type === 'payment'"
            v-model="form.paymentDate"
            label="Datum platby"
            type="date"
            help
          />
        </div>


        <!-- File Upload -->
        <div v-if="!isQuickReminder && !isQuickPayment" class="form-group">
          <label>Přílohy (volitelné)</label>
          <div class="file-upload">
            <input 
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileSelect"
              class="file-input"
            >
            <button @click="$refs.fileInput.click()" type="button" class="file-upload-btn">
              <span class="material-icons">attach_file</span>
              Vybrat soubory
            </button>
          </div>
          
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <span class="material-icons">description</span>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
              <button @click="removeFile(index)" type="button" class="file-remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">Zrušit</button>
        <button class="btn-primary" @click="handleSave" :disabled="!isValid">
          <span class="material-icons">save</span>
          {{ isQuickReminder ? 'Zaslat upomínku' : isQuickPayment ? 'Zaznamenat' : 'Uložit' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';


const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: String,
    default: null
  },
  tenantName: {
    type: String,
    default: null
  },
  propertyId: {
    type: String,
    required: true
  },
  unitId: {
    type: String,
    required: false
  },
  quickAction: {
    type: String, // 'reminder' | 'payment' | null
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const typeOptions = [
  { value: 'note', icon: '📝', label: 'Poznámka' },
  { value: 'reminder', icon: '🔔', label: 'Upomínka' },
  { value: 'payment', icon: '💰', label: 'Platba' },
  { value: 'complaint', icon: '⚠️', label: 'Reklamace' },
  { value: 'termination', icon: '📄', label: 'Výpověď' }
]

const isQuickReminder = computed(() => props.quickAction === 'reminder')
const isQuickPayment = computed(() => props.quickAction === 'payment')

const form = ref({
  type: 'note',
  title: '',
  content: '',
  tags: [],
  amount: null,
  dueDate: '',
  paymentDate: '',
  paymentMethod: 'bankovní převod'
})

const newTag = ref('')
const selectedFiles = ref([])
const fileInput = ref(null)

const isValid = computed(() => {
  if (isQuickReminder.value) {
    return form.value.amount && form.value.dueDate
  }
  if (isQuickPayment.value) {
    return form.value.amount && form.value.paymentDate
  }
  return form.value.title && form.value.content
})

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value.push(...files)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSave = () => {
  const data = {
    tenantId: props.tenantId,
    tenantName: props.tenantName,
    propertyId: props.propertyId,
    unitId: props.unitId,
    type: isQuickReminder.value ? 'reminder' : isQuickPayment.value ? 'payment' : form.value.type,
    title: form.value.title,
    content: form.value.content,
    tags: form.value.tags,
    attachments: [], // Mock - in real app, upload files first
    metadata: {}
  }

  // Add metadata based on type
  if (form.value.amount) {
    data.metadata.amount = form.value.amount
  }
  if (form.value.dueDate) {
    data.metadata.dueDate = form.value.dueDate
    data.metadata.resolution = 'pending'
  }
  if (form.value.paymentDate) {
    data.metadata.paymentDate = form.value.paymentDate
    data.metadata.paymentMethod = form.value.paymentMethod
    data.metadata.resolution = 'resolved'
  }

  emit('save', data)
  handleClose()
}

const handleClose = () => {
  // Reset form
  form.value = {
    type: 'note',
    title: '',
    content: '',
    tags: [],
    amount: null,
    dueDate: '',
    paymentDate: '',
    paymentMethod: 'bankovní převod'
  }
  selectedFiles.value = []
  newTag.value = ''
  
  emit('close')
}

// Set default values for quick actions
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (isQuickPayment.value) {
      // Set today as default payment date
      form.value.paymentDate = new Date().toISOString().split('T')[0]
    }
    if (isQuickReminder.value) {
      // Set 7 days from now as default due date
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7)
      form.value.dueDate = dueDate.toISOString().split('T')[0]
    }
  }
})
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
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

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--save-color);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  font-weight: 600;
  pointer-events: none;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.type-btn {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.type-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.type-btn.active {
  background: rgba(0, 200, 83, 0.05);
  border-color: var(--save-color);
  color: var(--save-color);
}

.type-icon {
  font-size: 1.5rem;
}

.type-label {
  font-weight: 600;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-height: 42px;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.tag-remove {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  font-size: 0.875rem;
}

.help-text {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.file-upload {
  display: flex;
}

.file-input {
  display: none;
}

.file-upload-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.file-upload-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.selected-files {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.file-item .material-icons {
  color: #64748b;
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.file-remove {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background: var(--save-color);
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--save-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 200, 83, 0.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary .material-icons {
  font-size: 18px;
}
</style>
