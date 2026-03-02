import apiClient from '@/api/client'
import { API_CONFIG } from '@/config/api.config'
import { financeService } from './financeService'
import { propertyService } from './propertyService'
import {
    getAllDebtors,
    calculateDebtSummary,
    generateDebtAgingReport
} from '@/utils/debtCalculations'

/**
 * Debt Service
 * Handles debt tracking, debtor management, and reminder functionality
 */
export const debtService = {
    /**
     * Get all debtors with their debt summaries
     * @param {Object} filters - Optional filters (severity, propertyId, minAmount)
     * @returns {Promise<Array>} List of debtors
     */
    async getDebtors(filters = {}) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise(async (resolve) => {
                    setTimeout(async () => {
                        // Get incomes and properties
                        const incomes = await financeService.getIncomes();
                        const properties = await propertyService.getProperties();

                        // Calculate all debtors
                        let debtors = getAllDebtors(incomes, properties);

                        // Apply filters
                        if (filters.severity) {
                            debtors = debtors.filter(d => d.debtSummary.severity === filters.severity);
                        }

                        if (filters.propertyId) {
                            debtors = debtors.filter(d => d.propertyId === filters.propertyId);
                        }

                        if (filters.minAmount) {
                            debtors = debtors.filter(d => d.debtSummary.totalDebt >= filters.minAmount);
                        }

                        // Sort by debt amount (highest first) by default
                        debtors.sort((a, b) => b.debtSummary.totalDebt - a.debtSummary.totalDebt);

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetched debtors', debtors.length);
                        }

                        resolve(debtors);
                    }, 300);
                });
            }

            const response = await apiClient.get('/debtors', { params: filters });
            return response.data || [];
        } catch (error) {
            console.error('Error fetching debtors:', error);
            throw error;
        }
    },

    /**
     * Get detailed information about a specific debtor
     * @param {string} tenantName - Name of the tenant
     * @param {string} propertyId - Property ID
     * @returns {Promise<Object>} Debtor detail with full breakdown
     */
    async getDebtorDetail(tenantName, propertyId) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise(async (resolve) => {
                    setTimeout(async () => {
                        const incomes = await financeService.getIncomes();
                        const properties = await propertyService.getProperties();

                        const property = properties.find(p => p.id === propertyId);
                        if (!property) {
                            resolve(null);
                            return;
                        }

                        const unit = property.units?.find(u => u.tenant === tenantName);
                        if (!unit) {
                            resolve(null);
                            return;
                        }

                        const debtSummary = calculateDebtSummary(incomes, tenantName, propertyId);

                        if (!debtSummary) {
                            resolve(null);
                            return;
                        }

                        // Get payment history for this tenant
                        const paymentHistory = incomes
                            .filter(inc => inc.tenant === tenantName && inc.propertyId === propertyId)
                            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

                        // Mock reminder history
                        const reminders = this._generateMockReminders(debtSummary.debtAgeDays, tenantName);

                        // Mock payment behavior (Phase 2)
                        const paymentBehavior = {
                            onTimePayments: Math.floor(Math.random() * 20) + 1,
                            latePayments: debtSummary.unpaidCount > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
                            missedPayments: debtSummary.unpaidCount,
                            averageLatedays: debtSummary.debtAgeDays > 0 ? Math.floor(debtSummary.debtAgeDays / (debtSummary.unpaidCount || 1)) : 0,
                            reliability: debtSummary.severity === 'critical' ? 'low' : debtSummary.severity === 'medium' ? 'medium' : 'high'
                        };

                        const detail = {
                            tenantName,
                            propertyId,
                            propertyName: property.name,
                            unitId: unit.id,
                            unitNumber: unit.number,
                            debtSummary,
                            paymentHistory,
                            reminders,
                            paymentBehavior,
                            contact: {
                                email: unit.email || `${tenantName.toLowerCase().replace(' ', '.')}@email.cz`,
                                phone: unit.phone || '+420 123 456 789'
                            }
                        };

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetched debtor detail', tenantName);
                        }

                        resolve(detail);
                    }, 300);
                });
            }

            const response = await apiClient.get(`/debtors/${tenantName}`, {
                params: { propertyId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching debtor detail:', error);
            throw error;
        }
    },

    /**
     * Send reminder to a debtor
     * @param {string} tenantName - Name of the tenant
     * @param {string} propertyId - Property ID
     * @param {Object} reminderData - Reminder details {type, message}
     * @returns {Promise<Object>} Created reminder record
     */
    async sendReminder(tenantName, propertyId, reminderData) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const reminder = {
                            id: `REM${Date.now()}`,
                            tenantName,
                            propertyId,
                            sentDate: new Date().toISOString().split('T')[0],
                            type: reminderData.type || 'email',
                            message: reminderData.message || 'Upomínka k platbě nájmu',
                            status: 'sent'
                        };

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Sent reminder', reminder.id);
                        }

                        resolve(reminder);
                    }, 500);
                });
            }

            const response = await apiClient.post('/debtors/reminders', {
                tenantName,
                propertyId,
                ...reminderData
            });
            return response.data;
        } catch (error) {
            console.error('Error sending reminder:', error);
            throw error;
        }
    },

    /**
     * Get debt aging report
     * @returns {Promise<Object>} Aging report with breakdown
     */
    async getDebtAgingReport() {
        try {
            if (API_CONFIG.useMock) {
                return new Promise(async (resolve) => {
                    setTimeout(async () => {
                        const debtors = await this.getDebtors();
                        const report = generateDebtAgingReport(debtors);

                        report.generatedDate = new Date().toISOString().split('T')[0];

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Generated debt aging report', report);
                        }

                        resolve(report);
                    }, 300);
                });
            }

            const response = await apiClient.get('/debtors/aging-report');
            return response.data;
        } catch (error) {
            console.error('Error fetching debt aging report:', error);
            throw error;
        }
    },

    /**
     * Export debtors list
     * @param {string} format - Export format ('csv' or 'pdf')
     * @returns {Promise<Blob>} Export file
     */
    async exportDebtors(format = 'csv') {
        try {
            if (API_CONFIG.useMock) {
                return new Promise(async (resolve) => {
                    setTimeout(async () => {
                        const debtors = await this.getDebtors();

                        // Generate CSV content
                        const headers = 'ID,Nájemník,Nemovitost,Jednotka,Dluh,Stáří (dny),Závažnost\n';
                        const rows = debtors.map(d =>
                            `${d.propertyId},${d.tenantName},${d.propertyName},${d.unitNumber},${d.debtSummary.totalDebt},${d.debtSummary.debtAgeDays},${d.debtSummary.severity}`
                        ).join('\n');

                        const csvContent = headers + rows;
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Exported debtors', format);
                        }

                        resolve(blob);
                    }, 500);
                });
            }

            const response = await apiClient.get(`/debtors/export`, {
                params: { format },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting debtors:', error);
            throw error;
        }
    },

    /**
     * Helper: Generate mock reminders based on debt age
     * @private
     */
    _generateMockReminders(debtAgeDays, tenantName) {
        const reminders = [];

        if (debtAgeDays >= 5) {
            reminders.push({
                id: 'REM001',
                sentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: 'email',
                status: 'sent',
                message: '1. upomínka - platba po splatnosti'
            });
        }

        if (debtAgeDays >= 15) {
            reminders.push({
                id: 'REM002',
                sentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: 'email',
                status: 'sent',
                message: '2. upomínka - urgentní platba'
            });
        }

        if (debtAgeDays >= 30) {
            reminders.push({
                id: 'REM003',
                sentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: 'letter',
                status: 'sent',
                message: '3. upomínka - poslední výzva'
            });
        }

        return reminders;
    }
}
