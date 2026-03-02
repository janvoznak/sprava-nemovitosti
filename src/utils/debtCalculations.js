/**
 * Debt Calculations Utility
 * 
 * Provides functions for calculating debt summaries, aging, and severity
 * based on income payment data.
 */

/**
 * Calculate debt summary for a specific tenant
 * @param {Array} incomes - All income records
 * @param {string} tenantName - Name of the tenant
 * @param {string} propertyId - Property ID
 * @returns {Object|null} Debt summary or null if no debt
 */
export function calculateDebtSummary(incomes, tenantName, propertyId) {
    const unpaidIncomes = incomes.filter(inc =>
        inc.tenant === tenantName &&
        inc.propertyId === propertyId &&
        (inc.status === 'unpaid' || inc.status === 'late')
    );

    if (unpaidIncomes.length === 0) {
        return null; // No debt
    }

    const totalDebt = unpaidIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const sortedByDate = unpaidIncomes.sort((a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    );
    const oldestIncome = sortedByDate[0];

    const today = new Date();
    const debtAgeDays = Math.floor(
        (today - new Date(oldestIncome.dueDate)) / (1000 * 60 * 60 * 24)
    );

    const unpaidPeriods = unpaidIncomes.map(inc => {
        const daysOverdue = Math.floor(
            (today - new Date(inc.dueDate)) / (1000 * 60 * 60 * 24)
        );

        return {
            incomeId: inc.id,
            period: inc.period,
            dueDate: inc.dueDate,
            amount: inc.amount,
            type: inc.type || 'rent',
            daysOverdue: Math.max(0, daysOverdue)
        };
    });

    // Sort periods by due date (oldest first)
    unpaidPeriods.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return {
        totalDebt,
        oldestDebtDate: oldestIncome.dueDate,
        debtAgeDays: Math.max(0, debtAgeDays),
        unpaidPeriods,
        unpaidCount: unpaidIncomes.length,
        severity: calculateDebtSeverity(debtAgeDays)
    };
}

/**
 * Calculate debt severity based on age
 * @param {number} debtAgeDays - Age of oldest debt in days
 * @returns {string} 'critical', 'medium', or 'low'
 */
export function calculateDebtSeverity(debtAgeDays) {
    if (debtAgeDays >= 90) return 'critical';
    if (debtAgeDays >= 31) return 'medium';
    return 'low';
}

/**
 * Get severity badge color
 * @param {string} severity - 'critical', 'medium', or 'low'
 * @returns {Object} Badge styling info
 */
export function getSeverityBadge(severity) {
    const badges = {
        critical: {
            emoji: '🔴',
            label: 'KRITICKÝ',
            color: '#dc2626',
            bgColor: '#fee2e2'
        },
        medium: {
            emoji: '🟡',
            label: 'STŘEDNÍ',
            color: '#d97706',
            bgColor: '#fef3c7'
        },
        low: {
            emoji: '🟢',
            label: 'NOVÝ',
            color: '#ca8a04',
            bgColor: '#fef9c3'
        }
    };

    return badges[severity] || badges.low;
}

/**
 * Get all debtors from incomes and tenant data
 * @param {Array} incomes - All income records
 * @param {Array} properties - All properties with tenant info
 * @returns {Array} List of debtors with debt summaries
 */
export function getAllDebtors(incomes, properties) {
    const debtors = [];
    const processedTenants = new Set();

    properties.forEach(property => {
        if (!property.units) return;

        property.units.forEach(unit => {
            if (!unit.tenant || unit.tenant === '-') return;

            const tenantKey = `${unit.tenant}_${property.id}`;
            if (processedTenants.has(tenantKey)) return;

            const debtSummary = calculateDebtSummary(incomes, unit.tenant, property.id);

            if (debtSummary) {
                debtors.push({
                    id: `${property.id}_${unit.id}`,
                    tenantName: unit.tenant,
                    tenantId: unit.tenantId || null,
                    propertyId: property.id,
                    propertyName: property.name,
                    unitId: unit.id,
                    unitNumber: unit.number,
                    debtSummary
                });

                processedTenants.add(tenantKey);
            }
        });
    });

    return debtors;
}

/**
 * Generate debt aging report
 * @param {Array} debtors - List of debtors
 * @returns {Object} Aging report with breakdown by categories
 */
export function generateDebtAgingReport(debtors) {
    const report = {
        totalDebtors: debtors.length,
        totalDebtAmount: 0,
        byAging: {
            '0-30days': { count: 0, amount: 0, debtors: [] },
            '31-60days': { count: 0, amount: 0, debtors: [] },
            '61-90days': { count: 0, amount: 0, debtors: [] },
            '90plus': { count: 0, amount: 0, debtors: [] }
        },
        bySeverity: {
            critical: { count: 0, amount: 0 },
            medium: { count: 0, amount: 0 },
            low: { count: 0, amount: 0 }
        }
    };

    debtors.forEach(debtor => {
        const { debtSummary } = debtor;
        report.totalDebtAmount += debtSummary.totalDebt;

        // Categorize by aging
        const ageDays = debtSummary.debtAgeDays;
        let category;

        if (ageDays >= 90) category = '90plus';
        else if (ageDays >= 61) category = '61-90days';
        else if (ageDays >= 31) category = '31-60days';
        else category = '0-30days';

        report.byAging[category].count++;
        report.byAging[category].amount += debtSummary.totalDebt;
        report.byAging[category].debtors.push(debtor);

        // Categorize by severity
        report.bySeverity[debtSummary.severity].count++;
        report.bySeverity[debtSummary.severity].amount += debtSummary.totalDebt;
    });

    return report;
}

/**
 * Format currency in CZK
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatDebtCurrency(amount) {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date in Czech format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDebtDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
}
