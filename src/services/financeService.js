import apiClient from '@/api/client'
import { API_CONFIG } from '@/config/api.config'
import { mockIncomes, mockExpenses } from '../mock/finance'

// Local storage for finance data to simulate persistent state during mock mode
let incomes = [...mockIncomes]
let expenses = [...mockExpenses]

/**
 * Finance Service
 * Handles financial data - incomes, expenses, cash flow, forecasting
 * Supports both mock mode and real API mode
 */
export const financeService = {
    /**
     * Get all incomes (rent payments)
     * @returns {Promise<Array>} List of income records
     */
    async getIncomes() {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetching incomes', incomes.length)
                        }
                        resolve([...incomes])
                    }, 300)
                })
            }

            const response = await apiClient.get('/finance/incomes')
            return response.data || []
        } catch (error) {
            console.error('Error fetching incomes:', error)
            throw error
        }
    },

    /**
     * Get all expenses
     * @returns {Promise<Array>} List of expense records
     */
    async getExpenses() {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetching expenses', expenses.length)
                        }
                        resolve([...expenses])
                    }, 300)
                })
            }

            const response = await apiClient.get('/finance/expenses')
            return response.data || []
        } catch (error) {
            console.error('Error fetching expenses:', error)
            throw error
        }
    },

    /**
     * Update income payment status
     * @param {string} id - Income ID
     * @param {string} status - New status (paid/unpaid/late)
     * @param {string|null} paidDate - Payment date if status is 'paid'
     * @returns {Promise<Object>} Updated income
     */
    async updateIncomeStatus(id, status, paidDate = null) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const index = incomes.findIndex(inc => inc.id === id)
                        if (index !== -1) {
                            incomes[index].status = status
                            incomes[index].paidDate = paidDate || new Date().toISOString().split('T')[0]

                            if (API_CONFIG.debug) {
                                console.log('🎭 Mock: Updated income status', id, status)
                            }
                            resolve({ ...incomes[index] })
                        } else {
                            resolve(null)
                        }
                    }, 200)
                })
            }

            const response = await apiClient.patch(`/finance/incomes/${id}`, { status, paidDate })
            return response.data
        } catch (error) {
            console.error(`Error updating income ${id}:`, error)
            throw error
        }
    },

    /**
     * Get cash flow data aggregated by month
     * @param {number} months - Number of months to retrieve (default: 12)
     * @returns {Promise<Array>} Cash flow data by month
     */
    async getCashFlow(months = 12) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Aggregate incomes and expenses by month
                        const cashFlowMap = new Map()

                        // Process incomes (only paid ones count as real income)
                        incomes
                            .filter(inc => inc.status === 'paid' && inc.paidDate)
                            .forEach(inc => {
                                const date = new Date(inc.paidDate)
                                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

                                if (!cashFlowMap.has(monthKey)) {
                                    cashFlowMap.set(monthKey, { income: 0, expenses: 0, month: monthKey })
                                }
                                cashFlowMap.get(monthKey).income += inc.amount
                            })

                        // Process expenses (all paid expenses)
                        expenses
                            .filter(exp => exp.status === 'paid')
                            .forEach(exp => {
                                const date = new Date(exp.date)
                                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

                                if (!cashFlowMap.has(monthKey)) {
                                    cashFlowMap.set(monthKey, { income: 0, expenses: 0, month: monthKey })
                                }
                                cashFlowMap.get(monthKey).expenses += exp.amount
                            })

                        // Convert to array and sort by month
                        const cashFlow = Array.from(cashFlowMap.values())
                            .sort((a, b) => a.month.localeCompare(b.month))
                            .slice(-months)
                            .map(item => ({
                                ...item,
                                netCashFlow: item.income - item.expenses
                            }))

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Calculated cash flow', cashFlow.length, 'months')
                        }

                        resolve(cashFlow)
                    }, 300)
                })
            }

            const response = await apiClient.get(`/finance/cash-flow?months=${months}`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching cash flow:', error)
            throw error
        }
    },

    /**
     * Get financial forecast for next month
     * @returns {Promise<Object>} Forecast data with expected incomes and expenses
     */
    async getForecast() {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const today = new Date('2026-02-01') // Mock current date
                        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
                        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)

                        // Expected incomes - all unpaid rent for current/next month
                        const expectedIncomes = incomes.filter(inc => {
                            const dueDate = new Date(inc.dueDate)
                            return inc.status !== 'paid' && dueDate >= today && dueDate <= nextMonthEnd
                        })

                        // Expected expenses - recurring costs estimate
                        const avgMonthlyExpenses = expenses
                            .filter(exp => exp.category === 'energy')
                            .reduce((sum, exp) => sum + exp.amount, 0) / 6 // Average of 6 months

                        const forecast = {
                            expectedIncomes: expectedIncomes,
                            expectedIncomesTotal: expectedIncomes.reduce((sum, inc) => sum + inc.amount, 0),
                            estimatedExpenses: Math.round(avgMonthlyExpenses),
                            netForecast: expectedIncomes.reduce((sum, inc) => sum + inc.amount, 0) - Math.round(avgMonthlyExpenses),
                            upcomingRevisions: [
                                { property: 'Václavské náměstí 28', type: 'Revize plynu', date: '2026-02-15', estimatedCost: 5200 }
                            ]
                        }

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Generated forecast', forecast)
                        }

                        resolve(forecast)
                    }, 300)
                })
            }

            const response = await apiClient.get('/finance/forecast')
            return response.data
        } catch (error) {
            console.error('Error fetching forecast:', error)
            throw error
        }
    },

    /**
     * Add new expense
     * @param {Object} expenseData - Expense data
     * @returns {Promise<Object>} Created expense
     */
    async addExpense(expenseData) {
        try {
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newExpense = {
                            ...expenseData,
                            id: `EXP${String(expenses.length + 1).padStart(4, '0')}`,
                            date: expenseData.date || new Date().toISOString().split('T')[0],
                            status: expenseData.status || 'unpaid'
                        }
                        expenses.push(newExpense)

                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Created expense', newExpense.id)
                        }
                        resolve(newExpense)
                    }, 300)
                })
            }

            const response = await apiClient.post('/finance/expenses', expenseData)
            return response.data
        } catch (error) {
            console.error('Error creating expense:', error)
            throw error
        }
    }
}
