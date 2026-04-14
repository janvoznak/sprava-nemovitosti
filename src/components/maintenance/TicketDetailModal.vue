<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-left">
          <span class="ticket-id" v-if="form.id !== 'NEW'">{{ form.id }}</span>
          <input 
            v-if="form.id === 'NEW'" 
            type="text" 
            v-model="form.subject" 
            class="subject-input" 
            placeholder="Zadejte předmět závady..."
          />
          <h2 v-else class="modal-title">{{ form.subject }}</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <!-- Status & Priority Bar -->
        <div class="status-bar">
          <AppSelect 
            v-model="form.status" 
            label="Stav"
            class="status-group"
            help
          >
            <option value="new">Nové</option>
            <option value="in_progress">V řešení</option>
            <option value="done">Hotovo</option>
          </AppSelect>

          <AppSelect 
            v-model="form.priority" 
            label="Priorita"
            class="status-group"
            help
          >
            <option value="low">Nízká</option>
            <option value="medium">Střední</option>
            <option value="high">Vysoká</option>
            <option value="critical">Kritická</option>
          </AppSelect>
        </div>


        <div class="form-grid">
          <!-- Main Info -->
          <div class="form-section">
            <h3>Podrobnosti</h3>
            <!-- Property selector for new tickets -->
            <div v-if="form.id === 'NEW'" class="form-field">
              <label class="field-label">Nemovitost *</label>
              <select
                v-model="form.propertyId"
                class="property-select"
                @change="onPropertyChange"
              >
                <option value="">— Vyberte nemovitost —</option>
                <option
                  v-for="p in props.properties"
                  :key="p.id"
                  :value="p.id"
                >{{ p.name }}</option>
              </select>
            </div>
            <div v-else class="form-field">
              <label class="field-label">Nemovitost</label>
              <p class="field-value">{{ form.propertyName || '—' }}</p>
            </div>
            <AppTextarea
              v-model="form.description" 
              label="Popis závady"
              :rows="4"
              help
            />
            <AppInput 
              v-model="form.supplier" 
              label="Přiřazeno (Dodavatel)"
              placeholder="Např. Instalatér s.r.o."
              help
            />
          </div>


          <!-- Financials -->
          <div class="form-section">
            <h3>Finance</h3>
            <div class="form-row">
              <AppInput 
                v-model.number="form.estimatedCost" 
                label="Odhad ceny"
                type="number"
                help
              />
              <AppInput 
                v-if="form.status === 'done' || form.realCost"
                v-model.number="form.realCost" 
                label="Skutečná cena"
                type="number"
                :required="form.status === 'done'"
                help
              />
            </div>
            <AppInput 
              v-model="form.invoiceDate" 
              label="Splatnost faktury"
              type="date"
              help
            />
          </div>

        </div>

        <!-- Photos (Mock) -->
        <div class="photos-section">
          <h3>Fotodokumentace</h3>
          <div class="photos-grid">
            <div v-for="(photo, index) in form.photos" :key="index" class="photo-item">
              <img :src="photo.url" :alt="photo.label" />
              <span class="photo-label">{{ photo.label }}</span>
              <button class="remove-photo" @click.stop="removePhoto(index)" title="Odstranit">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="upload-wrapper">
              <input 
                type="file" 
                ref="fileInput" 
                multiple 
                accept="image/*" 
                class="hidden-input"
                @change="handleFileUpload"
              >
              <button class="add-photo-btn" @click="triggerFileUpload">
                <span class="material-icons">add_a_photo</span>
                <span>Přidat foto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="validationError" class="validation-error">
          <span class="material-icons">error_outline</span> {{ validationError }}
        </div>
        <div v-else-if="successMessage" class="success-msg">
          <span class="material-icons">check_circle</span> {{ successMessage }}
        </div>
        <button class="btn-secondary" @click="$emit('close')">Zavřít</button>
        <button class="btn-primary" @click="saveChanges">
          {{ form.id === 'NEW' ? 'Vytvořit' : 'Uložit změny' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';


const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  properties: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({});
const successMessage = ref(null);
const validationError = ref(null);

watch(() => props.ticket, (newVal) => {
  if (newVal) {
    // Clone to avoid direct mutation
    form.value = JSON.parse(JSON.stringify(newVal));
  }
}, { immediate: true });

const fileInput = ref(null);

const onPropertyChange = () => {
  const selected = props.properties.find(p => p.id === form.value.propertyId);
  if (selected) form.value.propertyName = selected.name;
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const selectedFiles = Array.from(event.target.files);
  if (!form.value.photos) form.value.photos = [];
  
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.photos.push({
        url: e.target.result,
        label: file.name
      });
    };
    reader.readAsDataURL(file);
  });
};

const removePhoto = (index) => {
  form.value.photos.splice(index, 1);
};

const saveChanges = () => {
  validationError.value = null;

  if (form.value.id === 'NEW' && !form.value.subject?.trim()) {
    validationError.value = 'Prosím vyplňte předmět závady.';
    setTimeout(() => validationError.value = null, 4000);
    return;
  }

  if (form.value.id === 'NEW' && !form.value.propertyId) {
    validationError.value = 'Prosím vyberte nemovitost.';
    setTimeout(() => validationError.value = null, 4000);
    return;
  }

  if (form.value.status === 'done' && !form.value.realCost) {
    validationError.value = 'Pro uzavření tiketu prosím vyplňte skutečnou cenu.';
    setTimeout(() => validationError.value = null, 4000);
    return;
  }

  emit('save', form.value);
  successMessage.value = 'Uloženo';
  setTimeout(() => successMessage.value = null, 2000);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.ticket-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
  display: block;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
}

.subject-input {
  width: 100%;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.status-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.status-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
}

.status-select.new { border-color: #3b82f6; color: #3b82f6; }
.status-select.in_progress { border-color: #f59e0b; color: #f59e0b; }
.status-select.done { border-color: #22c55e; color: #22c55e; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  color: #475569;
  margin-bottom: 0.25rem;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.input-wrapper {
  position: relative;
}

.suffix {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.required {
  border-color: #ef4444 !important;
  background: #fef2f2;
}

/* Photos */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
}

.photo-item img {
  width: 100%;
  flex: 1;
  object-fit: cover;
}

.photo-label {
  display: block;
  font-size: 0.75rem;
  padding: 6px 4px;
  background: #f8fafc;
  text-align: center;
  color: #475569;
  border-top: 1px solid #f1f5f9;
}

.upload-wrapper {
  aspect-ratio: 1 / 1;
}

.add-photo-btn {
  width: 100%;
  height: 100%;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  gap: 0.75rem;
  transition: all 0.2s;
}

.add-photo-btn:hover {
  border-color: var(--save-color);
  color: var(--save-color);
  background: rgba(0, 200, 83, 0.05);
}


.hidden-input {
  display: none;
}

.remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.remove-photo:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.remove-photo .material-icons {
  font-size: 16px;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  align-items: center;
}

.success-msg {
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-right: auto;
}

.validation-error {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-right: auto;
  font-size: 0.9rem;
}

.form-field {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.375rem;
}

.property-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.property-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field-value {
  margin: 0;
  color: #1e293b;
  font-size: 0.9rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #475569;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--save-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--save-color-hover);
}


@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .status-bar { flex-direction: column; gap: 1rem; }
}
</style>
