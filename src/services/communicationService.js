import communications from '@/mock/communications'
import { API_CONFIG } from '@/config/api.config'
import apiClient from '@/api/client'

/**
 * Communication Service
 * Manages tenant communication history - notes, reminders, complaints, etc.
 */

const STORAGE_KEY = 'sprava_nemovitosti_communications';

// Helper to load from storage or fallback to mock
const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return [...communications];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Merge: items in mock but not in storage should be added
            const storedIds = new Set(parsed.map(c => c.id));
            const newMocks = communications.filter(c => !storedIds.has(c.id));
            return [...newMocks, ...parsed];
        } catch (e) {
            console.error('Failed to parse stored communications', e);
            return [...communications];
        }
    }
    return [...communications];
};

// Helper to save to storage
const saveToStorage = (data) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

// Storage for communications (in-memory for mock mode)
let communicationRecords = loadFromStorage()
// Calculate next ID based on existing records to avoid collisions
let nextCommId = communicationRecords.length > 0
    ? Math.max(...communicationRecords.map(c => parseInt(c.id.replace('COMM', '')) || 0)) + 1
    : 100

export const communicationService = {
    /**
     * Get all communications for a tenant
     * @param {string} tenantId - Tenant ID
     * @returns {Promise<Array>} List of communications
     */
    async getCommunications(tenantId) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const records = communicationRecords.filter(c => c.tenantId === tenantId)

                        // Sort by creation date (newest first)
                        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                        if (API_CONFIG.debug) {
                            console.log(`💬 Mock: Fetching communications for tenant ${tenantId}`, records.length)
                        }
                        resolve(records)
                    }, 200)
                })
            }

            const response = await apiClient.get(`/tenants/${tenantId}/communications`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching communications:', error)
            throw error
        }
    },

    /**
     * Get all communications for a property
     * @param {string} propertyId - Property ID
     * @returns {Promise<Array>} List of communications
     */
    async getCommunicationsByProperty(propertyId) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const records = communicationRecords.filter(c => c.propertyId === propertyId)
                        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        resolve(records)
                    }, 200)
                })
            }

            const response = await apiClient.get(`/properties/${propertyId}/communications`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching property communications:', error)
            throw error
        }
    },

    /**
     * Add new communication record
     * @param {string} tenantId - Tenant ID
     * @param {Object} data - Communication data
     * @returns {Promise<Object>} Created communication
     */
    async addCommunication(tenantId, data) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newComm = {
                            id: `COMM${String(nextCommId++).padStart(3, '0')}`,
                            tenantId,
                            tenantName: data.tenantName || 'Neznámý',
                            propertyId: data.propertyId,
                            unitId: data.unitId,
                            type: data.type || 'note',
                            title: data.title,
                            content: data.content,
                            createdAt: new Date().toISOString(),
                            createdBy: data.createdBy || 'Admin',
                            tags: data.tags || [],
                            attachments: data.attachments || [],
                            metadata: data.metadata || {}
                        }

                        communicationRecords.unshift(newComm)
                        saveToStorage(communicationRecords)

                        if (API_CONFIG.debug) {
                            console.log('💬 Mock: Added communication', newComm)
                        }
                        resolve(newComm)
                    }, 300)
                })
            }

            const response = await apiClient.post(`/tenants/${tenantId}/communications`, data)
            return response.data
        } catch (error) {
            console.error('Error adding communication:', error)
            throw error
        }
    },

    /**
     * Update communication record
     * @param {string} id - Communication ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated communication
     */
    async updateCommunication(id, data) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const comm = communicationRecords.find(c => c.id === id)
                        if (comm) {
                            Object.assign(comm, data)
                            saveToStorage(communicationRecords)
                            if (API_CONFIG.debug) {
                                console.log('💬 Mock: Updated communication', comm)
                            }
                            resolve(comm)
                        }
                    }, 200)
                })
            }

            const response = await apiClient.patch(`/communications/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating communication:', error)
            throw error
        }
    },

    /**
     * Delete communication record
     * @param {string} id - Communication ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCommunication(id) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const index = communicationRecords.findIndex(c => c.id === id)
                        if (index !== -1) {
                            communicationRecords.splice(index, 1)
                            saveToStorage(communicationRecords)
                            if (API_CONFIG.debug) {
                                console.log('💬 Mock: Deleted communication', id)
                            }
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }, 200)
                })
            }

            await apiClient.delete(`/communications/${id}`)
            return true
        } catch (error) {
            console.error('Error deleting communication:', error)
            throw error
        }
    },

    /**
     * Filter communications by tags
     * @param {Array} communications - Communications array
     * @param {Array} tags - Tags to filter by
     * @returns {Array} Filtered communications
     */
    filterByTags(communications, tags) {
        if (!tags || tags.length === 0) {
            return communications
        }

        return communications.filter(comm =>
            tags.some(tag => comm.tags.includes(tag))
        )
    },

    /**
     * Filter communications by type
     * @param {Array} communications - Communications array
     * @param {string} type - Type to filter by
     * @returns {Array} Filtered communications
     */
    filterByType(communications, type) {
        if (!type || type === 'all') {
            return communications
        }

        return communications.filter(comm => comm.type === type)
    },

    /**
     * Quick action: Send reminder
     * @param {string} tenantId - Tenant ID
     * @param {Object} data - Reminder data {amount, dueDate, note}
     * @returns {Promise<Object>} Created communication
     */
    async sendReminder(tenantId, data) {
        const reminderData = {
            tenantName: data.tenantName,
            propertyId: data.propertyId,
            unitId: data.unitId,
            type: 'reminder',
            title: `Upomínka - nezaplacené nájemné`,
            content: data.note || 'Zaslána upomínka o nezaplaceném nájemném.',
            tags: ['upomínka', 'platba'],
            metadata: {
                amount: data.amount,
                dueDate: data.dueDate,
                resolution: 'pending'
            }
        }

        return await this.addCommunication(tenantId, reminderData)
    },

    /**
     * Quick action: Record payment
     * @param {string} tenantId - Tenant ID
     * @param {Object} data - Payment data {amount, paymentDate, method}
     * @returns {Promise<Object>} Created communication
     */
    async recordPayment(tenantId, data) {
        const paymentData = {
            tenantName: data.tenantName,
            propertyId: data.propertyId,
            unitId: data.unitId,
            type: 'payment',
            title: `Platba přijata - ${this.formatDate(data.paymentDate)}`,
            content: data.note || `Nájemné přijato ${data.method || 'bankovním převodem'}.`,
            tags: ['platba', 'vyřízeno'],
            metadata: {
                amount: data.amount,
                paymentDate: data.paymentDate,
                paymentMethod: data.method || 'bankovní převod',
                resolution: 'resolved'
            }
        }

        return await this.addCommunication(tenantId, paymentData)
    },

    /**
     * Get statistics for tenant
     * @param {string} tenantId - Tenant ID
     * @returns {Promise<Object>} Statistics
     */
    async getStats(tenantId) {
        const comms = await this.getCommunications(tenantId)

        return {
            total: comms.length,
            byType: {
                reminder: comms.filter(c => c.type === 'reminder').length,
                payment: comms.filter(c => c.type === 'payment').length,
                complaint: comms.filter(c => c.type === 'complaint').length,
                termination: comms.filter(c => c.type === 'termination').length,
                note: comms.filter(c => c.type === 'note').length
            },
            pendingReminders: comms.filter(c =>
                c.type === 'reminder' && c.metadata.resolution === 'pending'
            ).length,
            unresolvedComplaints: comms.filter(c =>
                c.type === 'complaint' && c.metadata.resolution !== 'resolved'
            ).length
        }
    },

    /**
     * Group communications by month
     * @param {Array} communications - Communications array
     * @returns {Object} Grouped by month
     */
    groupByMonth(communications) {
        const grouped = {}

        communications.forEach(comm => {
            const date = new Date(comm.createdAt)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = this.getMonthLabel(date)

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    label: monthLabel,
                    communications: []
                }
            }

            grouped[monthKey].communications.push(comm)
        })

        return grouped
    },

    /**
     * Get month label in Czech
     * @param {Date} date - Date object
     * @returns {string} Month label
     */
    getMonthLabel(date) {
        const months = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ]
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    },

    /**
     * Get type icon
     * @param {string} type - Communication type
     * @returns {string} Icon emoji
     */
    getTypeIcon(type) {
        const icons = {
            reminder: '🔔',
            payment: '💰',
            complaint: '⚠️',
            termination: '📄',
            note: '📝'
        }
        return icons[type] || '📝'
    },

    /**
     * Get type label (Czech)
     * @param {string} type - Communication type
     * @returns {string} Czech label
     */
    getTypeLabel(type) {
        const labels = {
            reminder: 'Upomínka',
            payment: 'Platba',
            complaint: 'Reklamace',
            termination: 'Výpověď',
            note: 'Poznámka'
        }
        return labels[type] || 'Poznámka'
    },

    /**
     * Get type color
     * @param {string} type - Communication type
     * @returns {string} Color hex
     */
    getTypeColor(type) {
        const colors = {
            reminder: '#f59e0b', // Orange
            payment: '#22c55e', // Green
            complaint: '#ef4444', // Red
            termination: '#8b5cf6', // Purple
            note: '#3b82f6' // Blue
        }
        return colors[type] || '#3b82f6'
    },

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    },

    /**
     * Format datetime for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted datetime
     */
    formatDateTime(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    },

    /**
     * Format currency
     * @param {number} amount - Amount
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: 'CZK',
            minimumFractionDigits: 0
        }).format(amount)
    }
}
