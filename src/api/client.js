import axios from 'axios'
import { API_CONFIG } from '@/config/api.config'

/**
 * Axios HTTP Client for Poski REAL API
 * Configured with interceptors for authentication and error handling
 */
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log request in debug mode
        if (API_CONFIG.debug) {
            console.log('📤 API Request:', config.method?.toUpperCase(), config.url)
        }

        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

/**
 * Response Interceptor
 * Handles common error scenarios and extracts data
 */
apiClient.interceptors.response.use(
    (response) => {
        // Log response in debug mode
        if (API_CONFIG.debug) {
            console.log('📥 API Response:', response.status, response.config.url)
        }

        // Return data directly for cleaner code
        return response.data
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // Unauthorized - redirect to login
                    console.error('🔒 Neautorizováno - přesměrování na přihlášení')
                    // Clear auth token
                    localStorage.removeItem('auth_token')
                    // Redirect to login (můžete upravit podle vašeho routingu)
                    // window.location.href = '/login'
                    break

                case 403:
                    // Forbidden
                    console.error('⛔ Nemáte oprávnění k této akci')
                    break

                case 404:
                    // Not found
                    console.error('🔍 Požadovaný zdroj nebyl nalezen')
                    break

                case 422:
                    // Validation error
                    console.error('⚠️ Validační chyba:', data?.errors || data?.message)
                    break

                case 500:
                case 502:
                case 503:
                    // Server errors
                    console.error('💥 Chyba serveru - zkuste to prosím později')
                    break

                default:
                    console.error(`❌ API Error (${status}):`, data?.message || error.message)
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('📡 Nepodařilo se spojit se serverem - zkontrolujte připojení')
        } else {
            // Something else happened
            console.error('❌ Chyba:', error.message)
        }

        return Promise.reject(error)
    }
)

export default apiClient
