import { maintenanceTickets } from '../mock/maintenance';
const STORAGE_KEY = 'sprava_nemovitosti_maintenance';

// Helper to load from storage or fallback to mock
const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') return [...maintenanceTickets];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const storedIds = new Set(parsed.map(t => t.id));
            const newMocks = maintenanceTickets.filter(t => !storedIds.has(t.id));
            return [...newMocks, ...parsed];
        } catch (e) {
            console.error('Failed to parse stored maintenance tickets', e);
            return [...maintenanceTickets];
        }
    }
    return [...maintenanceTickets];
};

// Helper to save to storage
const saveToStorage = (data) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

let tickets = loadFromStorage();

export const maintenanceService = {
    // Simulate API delay
    async getTickets() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...tickets]);
            }, 400);
        });
    },

    async getTicketById(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const ticket = tickets.find(t => t.id === id);
                resolve(ticket || null);
            }, 200);
        });
    },

    async createTicket(ticketData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTicket = {
                    id: 'T' + (Math.floor(Math.random() * 9000) + 1000),
                    createdAt: new Date().toISOString(),
                    status: 'new',
                    ...ticketData
                };
                tickets.push(newTicket);
                saveToStorage(tickets);
                resolve(newTicket);
            }, 500);
        });
    },

    async updateTicket(id, updates) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = tickets.findIndex(t => t.id === id);
                if (index !== -1) {
                    const oldStatus = tickets[index].status;
                    const newStatus = updates.status;

                    // Update ticket
                    tickets[index] = {
                        ...tickets[index],
                        ...updates
                    };
                    saveToStorage(tickets);

                    // Simulate expense creation if marked as done with cost
                    if (oldStatus !== 'done' && newStatus === 'done' && updates.realCost) {
                        console.log(`💰 [Mock Automation] Created expense for ticket ${id}: ${updates.realCost} Kč`);
                    }

                    resolve(tickets[index]);
                } else {
                    resolve(null);
                }
            }, 300);
        });
    }
};
