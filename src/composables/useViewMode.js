import { ref, watch } from 'vue';

const STORAGE_KEY = 'poski_real_view_mode';
const VIEW_MODE_PROPERTIES = 'properties';
const VIEW_MODE_UNITS = 'units';

// Global state (shared across all components)
const viewMode = ref(VIEW_MODE_PROPERTIES);

/**
 * Detects portfolio type based on property data
 * @param {Array} properties - Array of property objects
 * @returns {string} - 'units' for small managers, 'properties' for large managers
 */
export function detectPortfolioType(properties) {
    if (!properties || properties.length === 0) {
        return VIEW_MODE_PROPERTIES;
    }

    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, property) => {
        return sum + (property.units?.length || 0);
    }, 0);

    const avgUnitsPerProperty = totalUnits / totalProperties;

    // If average < 2 units per property → small manager (scattered portfolio)
    // Otherwise → large manager (buildings with multiple units)
    return avgUnitsPerProperty < 2 ? VIEW_MODE_UNITS : VIEW_MODE_PROPERTIES;
}

/**
 * Initializes view mode from localStorage or auto-detects
 * @param {Array} properties - Optional property data for auto-detection
 */
function initializeViewMode(properties = null) {
    // Try to load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === VIEW_MODE_PROPERTIES || stored === VIEW_MODE_UNITS) {
        viewMode.value = stored;
        return;
    }

    // If no stored preference and properties provided, auto-detect
    if (properties) {
        viewMode.value = detectPortfolioType(properties);
        localStorage.setItem(STORAGE_KEY, viewMode.value);
    }
    // Otherwise keep default (properties)
}

/**
 * Composable for managing view mode state
 * @returns {Object} - View mode state and methods
 */
export function useViewMode() {
    // Watch for changes and persist to localStorage
    watch(viewMode, (newMode) => {
        localStorage.setItem(STORAGE_KEY, newMode);
    });

    /**
     * Sets the view mode
     * @param {string} mode - 'properties' or 'units'
     */
    const setViewMode = (mode) => {
        if (mode === VIEW_MODE_PROPERTIES || mode === VIEW_MODE_UNITS) {
            viewMode.value = mode;
        } else {
            console.warn(`Invalid view mode: ${mode}. Use '${VIEW_MODE_PROPERTIES}' or '${VIEW_MODE_UNITS}'`);
        }
    };

    /**
     * Toggles between view modes
     */
    const toggleViewMode = () => {
        viewMode.value = viewMode.value === VIEW_MODE_PROPERTIES
            ? VIEW_MODE_UNITS
            : VIEW_MODE_PROPERTIES;
    };

    /**
     * Checks if current mode is properties
     */
    const isPropertiesMode = () => {
        return viewMode.value === VIEW_MODE_PROPERTIES;
    };

    /**
     * Checks if current mode is units
     */
    const isUnitsMode = () => {
        return viewMode.value === VIEW_MODE_UNITS;
    };

    return {
        viewMode,
        setViewMode,
        toggleViewMode,
        isPropertiesMode,
        isUnitsMode,
        initializeViewMode,
        VIEW_MODE_PROPERTIES,
        VIEW_MODE_UNITS
    };
}
