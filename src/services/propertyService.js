import apiClient from '@/api/client'
import { API_CONFIG } from '@/config/api.config'
import { mockProperties } from '../mock/properties'

const STORAGE_KEY = 'sprava_nemovitosti_properties';

// Helper to load from storage or fallback to mock
const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return [...mockProperties];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Overwrite stored properties with latest mocks for better consistency
            const mockIds = new Set(mockProperties.map(p => p.id));
            const filteredStored = parsed.filter(p => !mockIds.has(p.id));
            return [...mockProperties, ...filteredStored];
        } catch (e) {
            console.error('Failed to parse stored properties', e);
            return [...mockProperties];
        }
    }
    return [...mockProperties];
};

// Helper to save to storage
const saveToStorage = (data) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

// Local storage for properties to simulate persistent state during mock mode
let properties = loadFromStorage();

/**
 * Property Service
 * Handles data fetching and management for properties.
 * Supports both mock mode (for development/testing) and real API mode.
 * 
 * Toggle between modes using VITE_USE_MOCK environment variable.
 */
export const propertyService = {
    /**
     * Fetches all properties
     * @returns {Promise<Array>} List of properties
     */
    async getProperties() {
        try {
            // Mock mode - use local mock data
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetching properties', properties.length)
                        }
                        resolve([...properties])
                    }, 300)
                })
            }

            // Real API mode
            const response = await apiClient.get('/properties')
            return response.data || []
        } catch (error) {
            console.error('Error fetching properties:', error)
            throw error
        }
    },

    /**
     * Fetches a property by ID
     * @param {string} id - Property ID
     * @returns {Promise<Object|null>} Property details or null
     */
    async getPropertyById(id) {
        try {
            // Mock mode
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const property = properties.find(p => p.id === id)
                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Fetching property', id, property ? '✓' : '✗')
                        }
                        resolve(property ? { ...property } : null)
                    }, 200)
                })
            }

            // Real API mode
            const response = await apiClient.get(`/properties/${id}`)
            return response.data || null
        } catch (error) {
            console.error(`Error fetching property ${id}:`, error)
            throw error
        }
    },

    /**
     * Adds a new property
     * @param {Object} data - Property data
     * @returns {Promise<Object>} The created property
     */
    async addProperty(data) {
        try {
            // Mock mode
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newProperty = {
                            ...data,
                            id: Math.random().toString(36).substr(2, 4).toUpperCase(),
                            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200&auto=format&fit=crop',
                            occupancyRatio: '0/0',
                            occupancyPercentage: 0,
                            rent: '0 Kč',
                            econ_rent: 0,
                            econ_services: 0,
                            econ_repairs: 0,
                            econ_deposit: 0,
                            units: []
                        }
                        properties.push(newProperty)
                        saveToStorage(properties)
                        if (API_CONFIG.debug) {
                            console.log('🎭 Mock: Created property', newProperty.id)
                        }
                        resolve(newProperty)
                    }, 300)
                })
            }

            // Real API mode
            const response = await apiClient.post('/properties', data)
            return response.data
        } catch (error) {
            console.error('Error creating property:', error)
            throw error
        }
    },

    /**
     * Updates an existing property
     * @param {string} id - Property ID
     * @param {Object} data - Updated property data
     * @returns {Promise<Object|null>} Updated property or null
     */
    async updateProperty(id, data) {
        try {
            // Mock mode
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const index = properties.findIndex(p => p.id === id)
                        if (index !== -1) {
                            properties[index] = { ...properties[index], ...data }
                            saveToStorage(properties)
                            if (API_CONFIG.debug) {
                                console.log('🎭 Mock: Updated property', id)
                            }
                            resolve(properties[index])
                        } else {
                            resolve(null)
                        }
                    }, 300)
                })
            }

            // Real API mode
            const response = await apiClient.put(`/properties/${id}`, data)
            return response.data
        } catch (error) {
            console.error(`Error updating property ${id}:`, error)
            throw error
        }
    },

    /**
     * Deletes a property
     * @param {string} id - Property ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProperty(id) {
        try {
            // Mock mode
            if (API_CONFIG.useMock) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const index = properties.findIndex(p => p.id === id)
                        if (index !== -1) {
                            properties.splice(index, 1)
                            saveToStorage(properties)
                            if (API_CONFIG.debug) {
                                console.log('🎭 Mock: Deleted property', id)
                            } resolve(true)
                        } else {
                            resolve(false)
                        }
                    }, 300)
                })
            }

            // Real API mode
            await apiClient.delete(`/properties/${id}`)
            return true
        } catch (error) {
            console.error(`Error deleting property ${id}:`, error)
            throw error
        }
    }
}

