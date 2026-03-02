/**
 * API Configuration
 * Environment-specific settings for API communication
 */

export const API_CONFIG = {
    // Base URL for Poski REAL API
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',

    // Request timeout in milliseconds
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

    // Use mock data instead of real API
    useMock: import.meta.env.VITE_USE_MOCK === 'true',

    // Enable debug logging
    debug: import.meta.env.VITE_DEBUG === 'true',
}

// Log configuration in development
if (API_CONFIG.debug) {
    console.log('🔧 API Configuration:', API_CONFIG)
}
