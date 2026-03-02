import { ref } from 'vue'

/**
 * Composable for displaying toast notifications
 * Provides a simple interface for showing temporary messages to users
 * 
 * @returns {Object} Notification state and methods
 */
export function useNotification() {
    const notification = ref(null)
    const notificationType = ref('success') // 'success', 'error', 'warning', 'info'

    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    const showNotification = (message, type = 'success', duration = 3000) => {
        notification.value = message
        notificationType.value = type

        setTimeout(() => {
            notification.value = null
        }, duration)
    }

    /**
     * Convenience methods for specific notification types
     */
    const showSuccess = (message, duration = 3000) => {
        showNotification(message, 'success', duration)
    }

    const showError = (message, duration = 4000) => {
        showNotification(message, 'error', duration)
    }

    const showWarning = (message, duration = 3500) => {
        showNotification(message, 'warning', duration)
    }

    const showInfo = (message, duration = 3000) => {
        showNotification(message, 'info', duration)
    }

    return {
        notification,
        notificationType,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    }
}
