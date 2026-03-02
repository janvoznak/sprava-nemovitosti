<template>
  <div class="form-view">
    <BreadcrumbNav :items="[
      { label: 'Dashboard', to: '/' },
      { label: 'Údržba', to: '/maintenance' },
      { label: 'Nový požadavek' }
    ]" />

    <div class="form-container">
      <h1 class="page-title">Nový požadavek</h1>
      
      <div class="form-card">
        <div class="form-header">
          <div class="icon-box">
             <span class="material-icons">build</span>
          </div>
          <div>
            <h3>Detaily závady</h3>
            <p class="sub">Vyplňte informace o problému</p>
          </div>
        </div>

        <div class="form-grid">
          <!-- Property Selection -->
          <div class="form-group span-2">
            <label>Nemovitost</label>
            <select v-model="form.propertyId">
              <option :value="null" disabled>Vyberte nemovitost</option>
              <option value="1">Bytový dům Na Kopci</option>
              <option value="2">Villa Nová</option>
              <option value="3">Komerční centrum A2</option>
            </select>
          </div>

          <!-- Unit Selection (conditionally shown) -->
          <div class="form-group span-2" v-if="form.propertyId">
            <label>Jednotka / Prostor</label>
            <select v-model="form.unitId">
              <option value="common">Společné prostory</option>
              <option value="101">Byt 101</option>
              <option value="102">Byt 102</option>
            </select>
          </div>

          <!-- Issue Category -->
          <div class="form-group">
            <label>Kategorie</label>
            <select v-model="form.category">
              <option value="plumbing">Instalatér</option>
              <option value="electric">Elektrikář</option>
              <option value="heating">Topení/Plyn</option>
              <option value="general">Běžná údržba</option>
              <option value="emergency">Havárie</option>
            </select>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label>Priorita</label>
            <select v-model="form.priority" :class="form.priority">
              <option value="low">Nízká (do týdne)</option>
              <option value="medium">Střední (do 48h)</option>
              <option value="high">Vysoká (co nejdříve)</option>
              <option value="critical">Kritická (IHNED)</option>
            </select>
          </div>

          <!-- Description -->
          <div class="form-group span-2">
            <label>Popis problému</label>
            <textarea 
              v-model="form.description" 
              rows="4" 
              placeholder="Detailně popište závadu..."
            ></textarea>
          </div>

          <!-- Photo Upload -->
          <div class="form-group span-2">
            <label>Fotodokumentace</label>
            <div class="photo-upload">
              <div class="upload-btn" @click="triggerFileUpload">
                <input 
                  type="file" 
                  ref="fileInput" 
                  multiple 
                  accept="image/*" 
                  class="hidden-input"
                  @change="handleFileUpload"
                >
                <span class="material-icons">add_a_photo</span>
                <span>Přidat foto</span>
              </div>
              
              <!-- Real Previews -->
              <div 
                class="photo-preview" 
                v-for="(url, index) in previews" 
                :key="index"
                :style="{ backgroundImage: `url(${url})` }"
              >
                <div class="remove-btn" @click.stop="removePhoto(index)">
                  <span class="material-icons">close</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button @click="$router.back()" class="btn-text">Zrušit</button>
          <button @click="submit" class="btn-primary">
            <span class="material-icons">send</span> Odeslat požadavek
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
import { useNotification } from '@/composables/useNotification';

const router = useRouter();
const { showSuccess } = useNotification();
const fileInput = ref(null);
const previews = ref([]);
const files = ref([]);

const form = reactive({
  propertyId: null,
  unitId: 'common',
  category: 'general',
  priority: 'medium',
  description: ''
});

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const selectedFiles = Array.from(event.target.files);
  files.value.push(...selectedFiles);
  
  selectedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => previews.value.push(e.target.result);
    reader.readAsDataURL(file);
  });
};

const removePhoto = (index) => {
  previews.value.splice(index, 1);
  files.value.splice(index, 1);
};

const submit = () => {
  // Validate basic fields (mock)
  if (!form.propertyId || !form.description) {
    alert('Vyplňte prosím nemovitost a popis závady.');
    return;
  }

  // Mock submission
  setTimeout(() => {
    showSuccess(`Požadavek vytvořen (${files.value.length} fotografií)`);
    router.push('/maintenance'); 
  }, 500);
};
</script>

<style scoped>
.form-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2rem;
}

.form-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1.5rem;
}

.icon-box {
  width: 48px; height: 48px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.icon-box .material-icons { font-size: 24px; }

.form-header h3 { margin: 0; font-size: 1.25rem; color: #0f172a; }
.sub { margin: 0; color: #64748b; font-size: 0.9rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.span-2 { grid-column: span 2; }

label { font-weight: 500; font-size: 0.9rem; color: #334155; }

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  width: 100%;
}

textarea { resize: vertical; }

select.critical { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }

.photo-upload {
  display: flex;
  gap: 1rem;
}

.upload-btn {
  width: 100px; height: 100px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 0.75rem;
  gap: 4px;
}

.hidden-input {
  display: none;
}

.photo-preview {
  width: 100px; height: 100px;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  color: #cbd5e1;
  border: 1px solid #e2e8f0;
}

.remove-btn {
  position: absolute;
  top: -6px; right: -6px;
  background: white;
  border-radius: 50%;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.remove-btn .material-icons {
  font-size: 14px;
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-text {
  background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer;
}
.btn-primary {
  background: #2563eb;
  color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px;
  font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem;
}
</style>
