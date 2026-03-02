import { propertyService } from '@/services/propertyService';
import { maintenanceService } from '@/services/maintenanceService';

export const searchService = {
    /**
     * Performs a global search across aggregated data
     * @param {string} query 
     * @returns {Promise<{properties: [], tickets: [], tenants: []}>}
     */
    async search(query) {
        if (!query || query.length < 2) {
            return { properties: [], tickets: [], tenants: [] };
        }

        const q = query.toLowerCase();

        // Fetch data in parallel
        const [properties, tickets] = await Promise.all([
            propertyService.getProperties(),
            maintenanceService.getTickets()
        ]);

        // Filter Properties
        // Filter Properties
        const matchedProperties = properties.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.city && p.city.toLowerCase().includes(q)) ||
            (p.street && p.street.toLowerCase().includes(q))
        );

        // Filter Tickets
        const matchedTickets = tickets.filter(t =>
            t.subject.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        );

        // Search Tenants (Iteration)
        // In a real API this would be a separate endpoint /search/tenants
        // Here we iterate through properties -> units -> tenant
        let matchedTenants = [];

        properties.forEach(p => {
            if (p.units) {
                p.units.forEach(u => {
                    if (u.tenant && u.tenant !== '-') {
                        const tenantName = u.tenant;
                        const tenantEmail = u.email;

                        if (tenantName.toLowerCase().includes(q) || (tenantEmail && tenantEmail.toLowerCase().includes(q))) {
                            matchedTenants.push({
                                name: tenantName,
                                email: tenantEmail,
                                unitId: u.id,
                                propertyId: p.id,
                                propertyName: p.name
                            });
                        }
                    }
                });
            }
        });

        return {
            properties: matchedProperties,
            tickets: matchedTickets,
            tenants: matchedTenants
        };
    }
};
