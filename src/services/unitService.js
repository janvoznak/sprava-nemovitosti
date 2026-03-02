import { mockProperties } from '@/mock/properties';

/**
 * Service for managing unit (bytová jednotka) operations
 */
class UnitService {
    /**
     * Get all units for a specific property
     * @param {string} propertyId 
     * @returns {Array} Array of units
     */
    getUnitsByProperty(propertyId) {
        const property = mockProperties.find(p => p.id === propertyId);
        return property?.units || [];
    }

    /**
     * Get detailed information about a specific unit
     * @param {string} unitId 
     * @returns {Object|null} Unit object or null if not found
     */
    getUnitDetail(unitId) {
        for (const property of mockProperties) {
            const unit = property.units?.find(u => u.id === unitId);
            if (unit) {
                return {
                    ...unit,
                    propertyId: property.id,
                    propertyName: property.name
                };
            }
        }
        return null;
    }

    /**
     * Update unit information
     * @param {string} unitId 
     * @param {Object} data 
     * @returns {Promise<Object>} Updated unit
     */
    async updateUnit(unitId, data) {
        // Mock implementation - in real app would call API
        return new Promise((resolve) => {
            setTimeout(() => {
                for (const property of mockProperties) {
                    const unitIndex = property.units?.findIndex(u => u.id === unitId);
                    if (unitIndex !== -1) {
                        property.units[unitIndex] = {
                            ...property.units[unitIndex],
                            ...data
                        };
                        resolve(property.units[unitIndex]);
                        return;
                    }
                }
                resolve(null);
            }, 300);
        });
    }

    /**
     * Create a new unit in a property
     * @param {string} propertyId 
     * @param {Object} data 
     * @returns {Promise<Object>} Created unit
     */
    async createUnit(propertyId, data) {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                const property = mockProperties.find(p => p.id === propertyId);
                if (property) {
                    const newUnit = {
                        id: `U${String(property.units.length + 1).padStart(4, '0')}`,
                        status: 'Volné',
                        isDeposited: false,
                        depositAmount: 0,
                        paymentHistory: [],
                        meters: [],
                        tenantHistory: [],
                        ...data
                    };
                    property.units.push(newUnit);
                    resolve(newUnit);
                } else {
                    resolve(null);
                }
            }, 300);
        });
    }

    /**
     * Delete a unit (only if empty)
     * @param {string} unitId 
     * @returns {Promise<boolean>} Success status
     */
    async deleteUnit(unitId) {
        // Mock implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                for (const property of mockProperties) {
                    const unitIndex = property.units?.findIndex(u => u.id === unitId);
                    if (unitIndex !== -1) {
                        const unit = property.units[unitIndex];
                        // Only allow deletion of empty units
                        if (unit.status === 'Volné') {
                            property.units.splice(unitIndex, 1);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                        return;
                    }
                }
                resolve(false);
            }, 300);
        });
    }

    /**
     * Filter units based on criteria
     * @param {Array} units 
     * @param {Object} filters 
     * @returns {Array} Filtered units
     */
    filterUnits(units, filters) {
        return units.filter(unit => {
            // Status filter
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(unit.status)) return false;
            }

            // Disposition filter
            if (filters.disposition && filters.disposition.length > 0) {
                if (!filters.disposition.includes(unit.disposition)) return false;
            }

            // Area filter
            if (filters.areaRange) {
                const area = parseInt(unit.totalArea);
                if (filters.areaRange === 'small' && area >= 50) return false;
                if (filters.areaRange === 'medium' && (area < 50 || area >= 75)) return false;
                if (filters.areaRange === 'large' && area < 75) return false;
            }

            // Floor filter
            if (filters.floor && filters.floor.length > 0) {
                if (!filters.floor.includes(unit.floor)) return false;
            }

            // Deposit filter
            if (filters.depositPaid !== undefined) {
                if (filters.depositPaid && !unit.isDeposited) return false;
                if (!filters.depositPaid && unit.isDeposited) return false;
            }

            // Search query
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matchesLabel = unit.label.toLowerCase().includes(query);
                const matchesTenant = unit.tenant.toLowerCase().includes(query);
                if (!matchesLabel && !matchesTenant) return false;
            }

            return true;
        });
    }

    /**
     * Sort units by specific field
     * @param {Array} units 
     * @param {string} sortBy 
     * @param {string} sortOrder 
     * @returns {Array} Sorted units
     */
    sortUnits(units, sortBy, sortOrder = 'asc') {
        const sorted = [...units].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'label':
                    aValue = a.label;
                    bValue = b.label;
                    break;
                case 'area':
                    aValue = a.totalArea;
                    bValue = b.totalArea;
                    break;
                case 'rent':
                    aValue = a.rent;
                    bValue = b.rent;
                    break;
                case 'contractEnd':
                    aValue = a.contractEnd ? new Date(a.contractEnd.split('.').reverse().join('-')) : new Date('9999-12-31');
                    bValue = b.contractEnd ? new Date(b.contractEnd.split('.').reverse().join('-')) : new Date('9999-12-31');
                    break;
                case 'floor':
                    aValue = a.floor;
                    bValue = b.floor;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }
}

export const unitService = new UnitService();
