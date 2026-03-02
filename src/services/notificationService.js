import { propertyService } from './propertyService'
import { financeService } from './financeService'
import { API_CONFIG } from '@/config/api.config'

/**
 * Notification Service
 * Detects and manages alerts based on property data, finances, and maintenance
 * Supports priority-based filtering: critical, important, info
 */

// Mock dismissed alerts storage
let dismissedAlerts = []

export const notificationService = {
    /**
     * Get all active alerts
     * @returns {Promise<Array>} List of alerts sorted by priority
     */
    async getAlerts() {
        try {
            const [properties, incomes] = await Promise.all([
                propertyService.getProperties(),
                financeService.getIncomes()
            ])

            const alerts = []
            const today = new Date('2026-02-01') // Mock current date for consistent testing

            // 1. Check for expiring revisions
            properties.forEach(property => {
                if (property.revisions) {
                    property.revisions.forEach(revision => {
                        const validUntil = new Date(this._parseDate(revision.validUntil))
                        const daysUntil = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24))

                        let priority = null
                        let message = ''

                        if (daysUntil < 0) {
                            priority = 'critical'
                            message = `Revize ${revision.type} expirovala před ${Math.abs(daysUntil)} dny`
                        } else if (daysUntil <= 30) {
                            priority = 'critical'
                            message = `Revize ${revision.type} vyprší za ${daysUntil} dní`
                        } else if (daysUntil <= 60) {
                            priority = 'important'
                            message = `Revize ${revision.type} vyprší za ${daysUntil} dní`
                        } else if (daysUntil <= 90) {
                            priority = 'info'
                            message = `Revize ${revision.type} vyprší za ${daysUntil} dní`
                        }

                        if (priority) {
                            const alertId = `REV_${property.id}_${revision.type.replace(/\s/g, '_')}`
                            if (!dismissedAlerts.includes(alertId)) {
                                alerts.push({
                                    id: alertId,
                                    type: 'revision_expiring',
                                    priority,
                                    title: message,
                                    description: property.name,
                                    propertyId: property.id,
                                    propertyName: property.name,
                                    dueDate: revision.validUntil,
                                    daysUntil,
                                    actionRequired: 'Objednat revizní technika',
                                    metadata: {
                                        revisionType: revision.type,
                                        technician: revision.technician,
                                        phone: revision.phone
                                    }
                                })
                            }
                        }
                    })
                }
            })

            // 2. Check for debts (late payments)
            const debtsByTenant = new Map()

            incomes.filter(inc => inc.status === 'late' || inc.status === 'unpaid').forEach(inc => {
                const key = `${inc.tenant}_${inc.propertyId}`
                if (!debtsByTenant.has(key)) {
                    debtsByTenant.set(key, {
                        tenant: inc.tenant,
                        propertyId: inc.propertyId,
                        propertyName: inc.propertyName,
                        totalDebt: 0,
                        monthsLate: 0,
                        oldestDueDate: inc.dueDate,
                        rentAmount: inc.amount
                    })
                }
                const debt = debtsByTenant.get(key)
                debt.totalDebt += inc.amount
                debt.monthsLate++
                if (new Date(inc.dueDate) < new Date(debt.oldestDueDate)) {
                    debt.oldestDueDate = inc.dueDate
                }
            })

            debtsByTenant.forEach((debt) => {
                let priority = null
                let message = ''

                if (debt.monthsLate >= 2) {
                    priority = 'critical'
                    message = `Dluh ${debt.monthsLate} měsíce - ${this._formatCurrency(debt.totalDebt)}`
                } else if (debt.monthsLate >= 1) {
                    priority = 'important'
                    message = `Dluh ${debt.monthsLate} měsíc - ${this._formatCurrency(debt.totalDebt)}`
                }

                if (priority) {
                    const alertId = `DEBT_${debt.propertyId}_${debt.tenant.replace(/\s/g, '_')}`
                    if (!dismissedAlerts.includes(alertId)) {
                        alerts.push({
                            id: alertId,
                            type: 'debt',
                            priority,
                            title: message,
                            description: `${debt.tenant} - ${debt.propertyName}`,
                            propertyId: debt.propertyId,
                            propertyName: debt.propertyName,
                            dueDate: debt.oldestDueDate,
                            daysUntil: Math.ceil((new Date(debt.oldestDueDate) - today) / (1000 * 60 * 60 * 24)),
                            actionRequired: 'Odeslat upomínku',
                            metadata: {
                                tenant: debt.tenant,
                                totalDebt: debt.totalDebt,
                                monthsLate: debt.monthsLate
                            }
                        })
                    }
                }
            })

            // 3. Check for contracts ending (in units)
            properties.forEach(property => {
                if (property.units) {
                    property.units.forEach(unit => {
                        // Parse validity string "od: 1.3.2024 do: 28.2.2025"
                        if (unit.validity && unit.validity !== '-') {
                            const match = unit.validity.match(/do:\s*(\d+)\.(\d+)\.(\d+)/)
                            if (match) {
                                const [_, day, month, year] = match
                                const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                                const daysUntil = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

                                if (daysUntil > 0 && daysUntil <= 60) {
                                    const priority = 'important'
                                    const alertId = `CONTRACT_${property.id}_${unit.id}`

                                    if (!dismissedAlerts.includes(alertId)) {
                                        alerts.push({
                                            id: alertId,
                                            type: 'contract_ending',
                                            priority,
                                            title: `Smlouva končí za ${daysUntil} dní`,
                                            description: `${unit.tenant} - ${unit.label}, ${property.name}`,
                                            propertyId: property.id,
                                            propertyName: property.name,
                                            dueDate: `${day}.${month}.${year}`,
                                            daysUntil,
                                            actionRequired: 'Prodloužit smlouvu nebo hledat nového nájemníka',
                                            metadata: {
                                                tenant: unit.tenant,
                                                unit: unit.label,
                                                endDate: `${day}.${month}.${year}`
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    })
                }
            })

            // 4. Meter checks (every 3 months - info alerts)
            properties.forEach(property => {
                if (property.meters && property.meters.length > 0) {
                    property.meters.forEach(meter => {
                        const lastCheck = new Date(this._parseDate(meter.date))
                        const monthsSince = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24 * 30))

                        if (monthsSince >= 3) {
                            const alertId = `METER_${property.id}_${meter.type.replace(/\s/g, '_')}`

                            if (!dismissedAlerts.includes(alertId)) {
                                alerts.push({
                                    id: alertId,
                                    type: 'meter_check',
                                    priority: 'info',
                                    title: `Kontrola měřidla - ${meter.type}`,
                                    description: property.name,
                                    propertyId: property.id,
                                    propertyName: property.name,
                                    dueDate: meter.date,
                                    daysUntil: -monthsSince * 30,
                                    actionRequired: 'Provést odečet a zapsat hodnoty',
                                    metadata: {
                                        meterType: meter.type,
                                        lastValue: meter.lastValue,
                                        serialNumber: meter.serialNumber,
                                        monthsSince
                                    }
                                })
                            }
                        }
                    })
                }
            })

            // Sort by priority and days until
            const priorityOrder = { critical: 0, important: 1, info: 2 }
            alerts.sort((a, b) => {
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                }
                return a.daysUntil - b.daysUntil
            })

            if (API_CONFIG.debug) {
                console.log('🔔 Notification Service: Generated alerts', alerts.length)
            }

            return alerts
        } catch (error) {
            console.error('Error fetching alerts:', error)
            throw error
        }
    },

    /**
     * Get alerts filtered by priority
     * @param {string} priority - 'critical', 'important', or 'info'
     * @returns {Promise<Array>} Filtered alerts
     */
    async getAlertsByPriority(priority) {
        const alerts = await this.getAlerts()
        return alerts.filter(alert => alert.priority === priority)
    },

    /**
     * Get count of alerts by priority
     * @returns {Promise<Object>} Count object {critical, important, info, total}
     */
    async getAlertCount() {
        const alerts = await this.getAlerts()
        return {
            critical: alerts.filter(a => a.priority === 'critical').length,
            important: alerts.filter(a => a.priority === 'important').length,
            info: alerts.filter(a => a.priority === 'info').length,
            total: alerts.length
        }
    },

    /**
     * Dismiss an alert (mark as resolved)
     * @param {string} alertId - Alert ID
     * @returns {Promise<boolean>} Success status
     */
    async dismissAlert(alertId) {
        try {
            if (!dismissedAlerts.includes(alertId)) {
                dismissedAlerts.push(alertId)
                if (API_CONFIG.debug) {
                    console.log('🔔 Notification Service: Dismissed alert', alertId)
                }
            }
            return true
        } catch (error) {
            console.error('Error dismissing alert:', error)
            return false
        }
    },

    /**
     * Clear all dismissed alerts (for testing)
     */
    clearDismissed() {
        dismissedAlerts = []
    },

    // Helper methods
    _parseDate(dateString) {
        // Parse various date formats: "15.10.2026", "01.01.2025", etc.
        const parts = dateString.split('.')
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
        return dateString
    },

    _formatCurrency(value) {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: 'CZK',
            minimumFractionDigits: 0
        }).format(value)
    }
}
