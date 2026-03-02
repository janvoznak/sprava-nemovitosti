<template>
  <div class="quick-actions-widget h-full">
    <div class="widget-header">
      <h3>
        <span class="material-icons">bolt</span>
        Rychlé akce
      </h3>
    </div>
    <div class="actions-grid">
      <button class="action-btn primary" @click="$router.push('/tenants/new')">
        <div class="icon-circle">
          <span class="material-icons">person_add</span>
        </div>
        <span>Nový nájemník</span>
      </button>
      
      <button class="action-btn secondary" @click="$router.push('/maintenance/new')">
        <div class="icon-circle">
          <span class="material-icons">build</span>
        </div>
        <span>Zadat údržbu</span>
      </button>
      
      <button class="action-btn secondary" @click="$router.push('/properties/new')">
         <div class="icon-circle">
          <span class="material-icons">add_business</span>
        </div>
        <span>Přidat nemovitost</span>
      </button>

      <button class="action-btn secondary" @click="$router.push('/finance/invoices/new')">
         <div class="icon-circle">
          <span class="material-icons">receipt_long</span>
        </div>
        <span>Nová faktura</span>
      </button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.quick-actions-widget {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.widget-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.widget-header h3 .material-icons {
  font-size: 1.25rem;
  color: #94a3b8;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  flex: 1;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-btn span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.primary .icon-circle {
  background: rgba(0, 200, 83, 0.05);
  color: var(--save-color);
}

.action-btn.primary:hover .icon-circle {
  background: var(--save-color);
  color: white;
}

.action-btn.secondary .icon-circle {
  background: #f1f5f9;
  color: #64748b;
}

.action-btn.secondary:hover .icon-circle {
  background: #cbd5e1;
  color: #0f172a;
}
</style>
