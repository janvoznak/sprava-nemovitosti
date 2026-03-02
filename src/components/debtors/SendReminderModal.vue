<template>
  <div class="send-reminder-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <span class="material-icons">notifications_active</span>
          Odeslat upomínku
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="recipient-info">
          <div class="info-row">
            <span class="label">Příjemce:</span>
            <span class="value">{{ debtor.tenantName }}</span>
          </div>
          <div class="info-row">
            <span class="label">E-mail:</span>
            <span class="value">{{ debtor.contact?.email || 'Není zadán' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Dlužná částka:</span>
            <span class="value text-danger">{{ formatCurrency(debtor.debtSummary.totalDebt) }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Typ upomínky</label>
          <div class="reminder-types">
            <label class="radio-card" :class="{ active: form.type === 'email' }">
              <input type="radio" v-model="form.type" value="email">
              <span class="material-icons">email</span>
              <div class="radio-content">
                <span class="radio-title">E-mail</span>
                <span class="radio-desc">Okamžité odeslání</span>
              </div>
            </label>
            
            <label class="radio-card" :class="{ active: form.type === 'sms' }">
              <input type="radio" v-model="form.type" value="sms">
              <span class="material-icons">smartphone</span>
              <div class="radio-content">
                <span class="radio-title">SMS</span>
                <span class="radio-desc">Krátká zpráva</span>
              </div>
            </label>
            
            <label class="radio-card" :class="{ active: form.type === 'letter' }">
              <input type="radio" v-model="form.type" value="letter">
              <span class="material-icons">mark_email_unread</span>
              <div class="radio-content">
                <span class="radio-title">Dopis</span>
                <span class="radio-desc">Doporučeně</span>
              </div>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Předmět / Název</label>
          <input 
            type="text" 
            v-model="form.subject"
            class="form-input"
            placeholder="Předmět zprávy..."
          >
        </div>

        <div class="form-group">
          <label>Obsah zprávy</label>
          <textarea 
            v-model="form.message" 
            rows="6" 
            class="form-textarea"
            placeholder="Text upomínky..."
          ></textarea>
          <div class="template-actions">
            <button @click="loadTemplate('1')" class="template-btn">1. Výzva</button>
            <button @click="loadTemplate('2')" class="template-btn">2. Výzva</button>
            <button @click="loadTemplate('3')" class="template-btn">Předžalobní</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Zrušit</button>
        <button class="btn-submit" @click="submit" :disabled="sending">
          <span v-if="sending" class="spinner-small"></span>
          <template v-else>
            <span class="material-icons">send</span>
            Odeslat upomínku
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { debtService } from '@/services/debtService'

const props = defineProps({
  debtor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'sent'])

const sending = ref(false)
const form = reactive({
  type: 'email',
  subject: '',
  message: ''
})

const templates = {
  '1': {
    subject: 'Upozornění na neuhrazenou platbu',
    message: `Vážený pane/paní ${props.debtor.tenantName},\n\ndovolujeme si Vás upozornit, že evidujeme neuhrazenou platbu za nájemné v celkové výši ${props.debtor.debtSummary.totalDebt} Kč.\n\nProsíme o úhradu obratem na účet 123456789/0100.\n\nS pozdravem,\nSpráva nemovitostí`
  },
  '2': {
    subject: 'DRUHÁ VÝZVA k úhradě',
    message: `Vážený pane/paní ${props.debtor.tenantName},\n\nani přes předchozí upozornění jsme neobdrželi Vaši platbu ve výši ${props.debtor.debtSummary.totalDebt} Kč.\n\nŽádáme Vás o okamžitou úhradu, abychom předešli dalším krokům.\n\nS pozdravem,\nSpráva nemovitostí`
  },
  '3': {
    subject: 'PŘEDŽALOBNÍ VÝZVA',
    message: `Vážený pane/paní ${props.debtor.tenantName},\n\nz důvodu dlouhodobého neplacení závazků ve výši ${props.debtor.debtSummary.totalDebt} Kč Vám zasíláme tuto předžalobní výzvu.\n\nPokud nedojde k úhradě do 3 dnů, budeme nuceni věc předat našemu právnímu zástupci.\n\nS pozdravem,\nSpráva nemovitostí`
  }
}

const loadTemplate = (type) => {
  const template = templates[type]
  if (template) {
    form.subject = template.subject
    form.message = template.message
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val)
}

const submit = async () => {
  if (!form.message) return
  
  try {
    sending.value = true
    await debtService.sendReminder(props.debtor.tenantName, props.debtor.propertyId, {
      type: form.type,
      message: form.message,
      subject: form.subject
    })
    
    emit('sent')
    emit('close')
  } catch (error) {
    console.error('Failed to send reminder', error)
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  loadTemplate('1')
})
</script>

<style scoped>
.send-reminder-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: white;
  width: 600px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header .material-icons {
  color: #f59e0b;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.recipient-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #64748b;
}

.info-row .value {
  font-weight: 500;
  color: #0f172a;
}

.text-danger {
  color: #ef4444 !important;
  font-weight: 600 !important;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.reminder-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.radio-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  position: relative;
}

.radio-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.radio-card.active {
  border-color: var(--save-color);
  background: rgba(0, 200, 83, 0.05);
}

.radio-card input {
  display: none;
}

.radio-card .material-icons {
  font-size: 1.5rem;
  color: #94a3b8;
}

.radio-card.active .material-icons {
  color: var(--save-color);
}

.radio-content {
  display: flex;
  flex-direction: column;
}

.radio-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
}

.radio-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--save-color);
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
}

.template-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.template-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.template-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-submit {
  background: var(--save-color);
  border: none;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:hover {
  background: var(--save-color-hover);
}


.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
