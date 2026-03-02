<template>
  <div class="tenant-card">
    <!-- Header: Unit Info -->
    <div class="card-header-section">
      <div class="unit-identifier">
        <h3 class="unit-title">{{ unit.label }}</h3>
        <span class="unit-area">{{ unit.area }}</span>
      </div>
      <div class="status-badge" :class="unit.status === 'Obsazeno' ? 'occupied' : 'vacant'">
        {{ unit.status === 'Obsazeno' ? 'Pronajato' : 'Volné' }}
      </div>
    </div>

    <!-- Tenant Details -->
    <div class="card-body-section" v-if="unit.tenant !== '-'">
      <!-- Profile Header -->
      <div class="tenant-profile">
        <div class="avatar-box">
          {{ getInitials(unit.tenant) }}
        </div>
        <div class="tenant-main-info">
          <h4 class="tenant-name">{{ unit.tenant }}</h4>
          <div class="contact-links">
            <a :href="'tel:' + unit.phone" class="contact-item">
              <span class="material-icons">phone</span>
              {{ unit.phone }}
            </a>
            <a :href="'mailto:' + unit.email" class="contact-item">
              <span class="material-icons">email</span>
              {{ unit.email }}
            </a>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Financial & Contract Overview -->
      <div class="details-list">
        <div class="detail-item">
          <div class="detail-label">
            <span class="material-icons">calendar_today</span>
            Smlouva
          </div>
          <div class="detail-value">{{ unit.contractStart }} - {{ unit.contractEnd }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">
            <span class="material-icons">payments</span>
            Nájemné
          </div>
          <div class="detail-value">
            {{ formatCurrency(unit.rent) }}
            <span class="due-hint">(splatnost {{ unit.rentDueDay }}.)</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-label">
            <span class="material-icons">account_balance_wallet</span>
            Kauce
          </div>
          <div class="detail-value" :class="unit.isDeposited ? 'success-text' : 'error-text'">
            {{ formatCurrency(unit.depositAmount) }}
            <span class="material-icons icon-status">{{ unit.isDeposited ? 'check_circle' : 'error' }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Status Block -->
      <div class="payment-status-block">
        <div class="block-header">[STATUS PLATEB]</div>
        <div class="history-list">
          <div v-for="(payment, index) in unit.paymentHistory" :key="index" class="history-row">
            <div class="history-status">
              <span class="material-icons" :class="payment.status === 'paid' ? 'status-paid' : 'status-unpaid'">
                {{ payment.status === 'paid' ? 'check_circle' : 'cancel' }}
              </span>
            </div>
            <div class="history-info">
              <div class="history-month">{{ payment.month }}</div>
              <div class="history-meta">
                {{ payment.status === 'paid' ? `Zaplaceno ${payment.paidDate}` : 'Nezaplaceno' }}
              </div>
            </div>
          </div>
          <div v-if="!unit.paymentHistory || unit.paymentHistory.length === 0" class="empty-history">
            Žádná historie plateb
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="card-body-section empty-unit" v-else>
      <div class="empty-state-content">
        <span class="material-icons">home_work</span>
        <p>Jednotka je aktuálně volná</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions-row">
      <template v-if="unit.tenant !== '-'">
        <button class="footer-btn" @click="$emit('quick-reminder', unit)">
          <span class="material-icons">notifications</span>
          Upozornit
        </button>
        <button class="footer-btn" @click="$emit('add-note', unit)">
          <span class="material-icons">edit_note</span>
          Poznámka
        </button>
        <button class="footer-btn" @click="$emit('view-contract', unit)">
          <span class="material-icons">description</span>
          Smlouva
        </button>
      </template>
      <button v-else class="btn-primary-action" @click="$emit('add-tenant', unit)">
        <span class="material-icons">person_add</span>
        Přidat nájemníka
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  unit: {
    type: Object,
    required: true
  }
});

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
};

const getPaymentStatusClass = (status) => {
  return status === 'paid' ? 'text-green' : 'text-red';
};

const getPaymentStatusIcon = (status) => {
  return status === 'paid' ? 'check_circle' : 'cancel';
};
</script>

<style scoped>
/* Main Card Container */
.tenant-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.tenant-card:hover {
  box-shadow: 0 12px 16px -4px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
  transform: translateY(-2px);
}

/* Header: Unit Info */
.card-header-section {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.unit-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.015em;
}

.unit-area {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 1px;
}

.status-badge {
  font-size: 0.6875rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.occupied { background: #eff6ff; color: #1d4ed8; }
.status-badge.vacant { background: #f3f4f6; color: #4b5563; }

/* Body Section */
.card-body-section {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Profile Section */
.tenant-profile {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.avatar-box {
  width: 44px;
  height: 44px;
  background: #f0f7ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.tenant-main-info {
  min-width: 0; /* Important for flex-shrink */
}

.tenant-name {
  margin: 0 0 0.125rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #4b5563;
  text-decoration: none;
  transition: color 0.15s;
}

.contact-item .material-icons {
  font-size: 14px;
  color: #9ca3af;
}

.contact-item:hover {
  color: #2563eb;
}

.section-divider {
  height: 1px;
  background: #f3f4f6;
  width: 100%;
  margin: -0.25rem 0;
}

/* Stable Detail List */
.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start; /* Ensure labels stay at top if value wraps */
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
  flex-shrink: 0;
  width: 90px; /* Fixed width for stable vertical alignment */
  padding-top: 2px;
}

.detail-label .material-icons {
  font-size: 16px;
  color: #9ca3af;
}

.detail-value {
  flex: 1;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9375rem;
  text-align: right;
  line-height: 1.25;
}

.due-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  margin-left: 0.125rem;
  white-space: nowrap;
}

.success-text { color: #10b981; }
.error-text { color: #ef4444; }

.icon-status {
  font-size: 14px;
  vertical-align: middle;
  margin-left: 0.25rem;
}

/* Payment Status Block */
.payment-status-block {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #f3f4f6;
}

.block-header {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.history-status .material-icons {
  font-size: 18px;
}

.status-paid { color: #10b981; }
.status-unpaid { color: #d1d5db; }

.history-month {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.history-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Empty State */
.empty-unit {
  min-height: 200px;
  align-items: center;
  justify-content: center;
}

.empty-state-content {
  text-align: center;
  color: #9ca3af;
}

.empty-state-content .material-icons {
  font-size: 40px;
  opacity: 0.3;
  margin-bottom: 0.75rem;
}

/* Footer Actions */
.card-actions-row {
  display: flex;
  border-top: 1px solid #f3f4f6;
  background: white;
  margin-top: auto; /* Push to bottom */
}

.footer-btn {
  flex: 1;
  padding: 0.875rem 0.25rem;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
  border-right: 1px solid #f3f4f6;
}

.footer-btn:last-child {
  border-right: none;
}

.footer-btn:hover {
  background: #f9fafb;
  color: #111827;
}

.footer-btn .material-icons {
  font-size: 16px;
  color: #9ca3af;
}

.btn-primary-action {
  width: 100%;
  padding: 0.875rem;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary-action:hover {
  background: #1d4ed8;
}
</style>
