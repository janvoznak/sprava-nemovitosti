<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Generovat dokument</h3>
        <button class="close-btn" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <label>Typ dokumentu</label>
        <select v-model="selectedType" class="bg-gray">
          <option value="lease">Nájemní smlouva (Byt)</option>
          <option value="handover">Předávací protokol</option>
          <option value="termination">Výpověď z nájmu</option>
          <option value="settlement">Vyúčtování služeb</option>
        </select>

        <div class="alert-info" v-if="selectedType">
          <span class="material-icons">info</span>
          Data budou automaticky doplněna z karty nemovitosti.
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Zrušit</button>
        <button class="btn-primary" @click="generate">
          Generovat <span class="material-icons">print</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  property: Object,
  settlementData: Object
});

const emit = defineEmits(['close']);

const selectedType = ref('lease');

// Auto-select settlement if data is passed
watch(() => props.settlementData, (newVal) => {
  if (newVal) {
    selectedType.value = 'settlement';
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0
  }).format(amount);
};

const generate = () => {
  const p = props.property;
  // Simple HTML Template Generation
  const win = window.open('', '_blank');
  
  let content = '';
  const date = new Date().toLocaleDateString('cs-CZ');

  if (selectedType.value === 'settlement' && props.settlementData) {
    const s = props.settlementData;
    const isUnderpayment = s.result > 0;
    const resultText = isUnderpayment ? 'NEDOPLATEK (Doplácí nájemce)' : 'PŘEPLATEK (Vrací pronajímatel)';
    const resultColor = isUnderpayment ? '#dc2626' : '#16a34a;';

    let itemsRows = '';
    if (s.items) {
      itemsRows = s.items.map(item => `
        <tr>
          <td>${item.type}</td>
          <td style="text-align: right;">${formatCurrency(item.cost)}</td>
          <td style="text-align: right;">${formatCurrency(item.advance)}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(item.cost - item.advance)}</td>
        </tr>
      `).join('');
    }

    content = `
      <h1>VYÚČTOVÁNÍ SLUŽEB A ENERGIÍ</h1>
      <p style="text-align: center;">za období: <strong>${s.period}</strong></p>
      <br>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3>Pronajímatel</h3>
          <p><strong>${p.landlord || 'Jan Novák'}</strong></p>
          <p>Bytem: Vzorová 1, Praha</p>
          <p>Email: novak@email.cz</p>
        </div>
        <div style="width: 48%;">
          <h3>Nájemce / Adresa odběru</h3>
          <p><strong>${p.name}</strong></p>
          <p>${p.street} ${p.houseNumber}, ${p.city}</p>
        </div>
      </div>

      <h3>Přehled nákladů a záloh</h3>
      <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr style="background: #f8fafc;">
          <th style="text-align: left;">Položka</th>
          <th style="text-align: right;">Skutečný náklad</th>
          <th style="text-align: right;">Zaplacené zálohy</th>
          <th style="text-align: right;">Rozdíl</th>
        </tr>
        ${itemsRows}
        <tr style="font-weight: bold; background: #f1f5f9;">
          <td>CELKEM</td>
          <td style="text-align: right;">${formatCurrency(s.totalCost)}</td>
          <td style="text-align: right;">${formatCurrency(s.totalAdvances)}</td>
          <td style="text-align: right;">${formatCurrency(s.result)}</td>
        </tr>
      </table>

      <div style="text-align: right; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <div style="font-size: 14px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Výsledek vyúčtování</div>
        <div style="font-size: 24px; font-weight: bold; color: ${resultColor}">${formatCurrency(Math.abs(s.result))}</div>
        <div style="font-size: 16px; font-weight: 600; color: ${resultColor}">${resultText}</div>
      </div>

      <div style="margin-top: 30px;">
        <p>Splatnost vyúčtování je do 15 dnů od doručení.</p>
        ${isUnderpayment ? '<p>Prosíme o úhradu nedoplatku na účet: <strong>123456789/0100</strong> pod VS: 2023001</p>' : '<p>Přeplatek bude vrácen na účet nájemce do 15 dnů.</p>'}
      </div>

      <br><br>
      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
         <div>V Praze dne ${date}</div>
         <div>__________________<br>Pronajímatel</div>
      </div>
    `;

  } else if (selectedType.value === 'lease') {
     content = `
       <h1>NÁJEMNÍ SMLOUVA</h1>
       <p>uzavřená podle § 2201 a násl. zákona č. 89/2012 Sb., občanský zákoník</p>
       <br>
       <h3>I. Smluvní strany</h3>
       <p><strong>Pronajímatel:</strong><br>${p.landlord || 'Jan Novák, nar. 1.1.1980'}<br>Bytem: Vzorová 1, Praha</p>
       <p>a</p>
       <p><strong>Nájemce:</strong><br>............................................. (Doplnit ručně)</p>
       
       <h3>II. Předmět nájmu</h3>
       <p>Pronajímatel přenechává nájemci do užívání byt: <strong>${p.name}</strong> o výměře <strong>${p.area}</strong> na adrese <strong>${p.street} ${p.houseNumber}, ${p.city}</strong>.</p>
       
       <h3>III. Nájemné a úhrada za plnění</h3>
       <p>1. Nájemné je stanoveno dohodou ve výši <strong>${p.rent}</strong> měsíčně.</p>
       <p>2. Nájemné je splatné vždy do 15. dne příslušného měsíce.</p>

       <br><br>
       <div style="display: flex; justify-content: space-between; margin-top: 50px;">
         <div>V ................. dne ${date}</div>
         <div>V ................. dne ${date}</div>
       </div>
       <br>
       <div style="display: flex; justify-content: space-between;">
         <div>__________________<br>Pronajímatel</div>
         <div>__________________<br>Nájemce</div>
       </div>
     `;
  } else if (selectedType.value === 'handover') {
    content = `
      <h1>PŘEDÁVACÍ PROTOKOL</h1>
      <p>k bytu č. ${p.units?.[0]?.label || '...'}</p>
      
      <h3>Předmět předání</h3>
      <p>Nemovitost: <strong>${p.name}</strong></p>
      <p>Adresa: <strong>${p.street} ${p.houseNumber}, ${p.city}</strong></p>

      <h3>Stavy měřidel</h3>
      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">
        <tr><th>Měřidlo</th><th>Výrobní číslo</th><th>Stav</th></tr>
        <tr><td>Elektřina</td><td>${p.ean_kod || '...'}</td><td>............ kWh</td></tr>
        <tr><td>Plyn</td><td>${p.eic_kod || '...'}</td><td>............ m3</td></tr>
        <tr><td>Voda TUV</td><td>...</td><td>............ m3</td></tr>
        <tr><td>Voda SV</td><td>...</td><td>............ m3</td></tr>
      </table>

      <h3>Počet klíčů</h3>
      <p>Nájemce přebírá ........... ks klíčů od bytu a ........... ks klíčů od vchodu.</p>

      <br><br>
      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
         <div>V ................. dne ${date}</div>
      </div>
      <br>
      <div style="display: flex; justify-content: space-between;">
         <div>__________________<br>Předávající</div>
         <div>__________________<br>Přebírající</div>
      </div>
    `;
  }

  const html = `
    <html>
      <head>
        <title>Dokument - ${p.name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; color: #000; }
          h1 { text-align: center; font-size: 24px; text-transform: uppercase; margin-bottom: 5px; }
          h3 { margin-top: 20px; font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          p { margin-bottom: 10px; text-align: justify; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; border: 1px solid #000; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${content}
        <script>window.print();<\/script>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.1rem; }

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.select-wrap { width: 100%; }

select.bg-gray {
  width: 100%;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.alert-info {
  background: #EFF6FF;
  color: #1E40AF;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-info .material-icons { font-size: 18px; }

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
