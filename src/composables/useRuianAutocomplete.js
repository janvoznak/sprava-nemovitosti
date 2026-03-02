import { ref } from 'vue';

/**
 * Composable pro práci s RUIAN (Registr územní identifikace, adres a nemovitostí)
 * Poskytuje autocomplete pro české adresy
 * Používá alternativní API - Nominatim s OSM daty pro ČR
 */
export function useRuianAutocomplete() {
    const isLoading = ref(false);
    const suggestions = ref([]);

    /**
     * Vyhledá adresy pomocí Nominatim API (OpenStreetMap)
     * @param {string} query - Vyhledávaný text
     * @returns {Promise<Array>} - Seznam navržených adres
     */
    const searchAddresses = async (query) => {
        if (!query || query.length < 3) {
            suggestions.value = [];
            return [];
        }

        isLoading.value = true;

        try {
            // Používáme Nominatim API s filtrem pro Českou republiku
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                new URLSearchParams({
                    q: query,
                    format: 'json',
                    addressdetails: '1',
                    countrycodes: 'cz', // Pouze ČR
                    limit: '10'
                }),
                {
                    headers: {
                        'Accept-Language': 'cs'
                    }
                }
            );

            const data = await response.json();

            if (data && Array.isArray(data) && data.length > 0) {
                suggestions.value = data.map((result, index) => {
                    const addr = result.address || {};

                    // Extrakce údajů z OSM
                    const street = addr.road || addr.pedestrian || '';
                    const houseNumber = addr.house_number || '';
                    const city = addr.city || addr.town || addr.village || addr.municipality || '';
                    const cityPart = addr.suburb || addr.neighbourhood || '';
                    const zipCode = addr.postcode || '';
                    const district = addr.county || '';
                    const region = addr.state || '';

                    return {
                        id: result.place_id || index,
                        fullAddress: result.display_name,
                        street: street,
                        houseNumber: houseNumber,
                        city: city,
                        cityPart: cityPart,
                        zipCode: zipCode,
                        district: district,
                        region: region,
                        cadastralArea: addr.hamlet || cityPart || city,
                        latitude: parseFloat(result.lat),
                        longitude: parseFloat(result.lon)
                    };
                });
            } else {
                suggestions.value = [];
            }

            return suggestions.value;
        } catch (error) {
            console.error('Chyba při vyhledávání adres:', error);
            suggestions.value = [];
            return [];
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        suggestions,
        searchAddresses
    };
}
