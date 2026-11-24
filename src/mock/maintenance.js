// Dates are shifted so the demo data is always "recent" (anchor = the day the mock was written)
const ANCHOR = new Date('2026-02-05T00:00:00').getTime();
const pad = (n) => String(n).padStart(2, '0');
const shift = (iso) => {
    const d = new Date(new Date(iso).getTime() + (Date.now() - ANCHOR));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

export const maintenanceTickets = [
    {
        id: 'T001',
        subject: 'Nefunkční kotel',
        propertyId: 'P0001',
        propertyName: 'Václavské náměstí 28',
        priority: 'high',
        status: 'new',
        description: 'Jan Novák hlásí výpadek topení v celém vchodě B.',
        createdAt: shift('2026-01-30T10:00:00'),
        dueDate: shift('2026-02-01T10:00:00'), // Overdue
        assignedTo: null
    },
    {
        id: 'T006',
        subject: 'Protékající WC',
        propertyId: 'P0001',
        propertyName: 'Václavské náměstí 28',
        priority: 'medium',
        status: 'new',
        description: 'Jan Novák hlásí protékající nádržku na WC.',
        createdAt: shift('2026-02-03T09:00:00'),
        dueDate: shift('2026-02-10T09:00:00'), // Future
        assignedTo: null
    },
    {
        id: 'T007',
        subject: 'Výměna baterie u topení',
        propertyId: 'P0001',
        propertyName: 'Václavské náměstí 28',
        priority: 'low',
        status: 'new',
        description: 'Eva Svobodová hlásí pískání v termostatické hlavici.',
        createdAt: shift('2026-02-03T10:15:00'),
        dueDate: shift('2026-02-17T10:00:00'),
        assignedTo: null
    },
    {
        id: 'T002',
        subject: 'Prasklá žárovka na chodbě',
        propertyId: 'P0002',
        propertyName: 'Karlovo náměstí 5',
        priority: 'low',
        status: 'new',
        description: 'Ve 3. patře u výtahu nesvítí světlo. Nahlásila Eva Svobodová.',
        createdAt: shift('2026-02-01T08:30:00'),
        dueDate: shift('2026-02-05T08:30:00'), // Overdue
        assignedTo: null
    },
    {
        id: 'T008',
        subject: 'Oprava digestoře',
        propertyId: 'P0002',
        propertyName: 'Karlovo náměstí 5',
        priority: 'medium',
        status: 'in_progress',
        description: 'Tomáš Procházka nahlásil nefunkční ventilátor v digestoři.',
        createdAt: shift('2026-02-02T16:45:00'),
        dueDate: shift('2026-02-09T16:00:00'),
        assignedTo: 'Elektro-servis s.r.o.'
    },
    {
        id: 'T010',
        subject: 'Nefunkční zásuvka',
        propertyId: 'P0001',
        propertyName: 'Václavské náměstí 28',
        priority: 'medium',
        status: 'done',
        description: 'Jana Nováková hlásila nefunkční zásuvku v kuchyni.',
        createdAt: shift('2026-01-20T14:00:00'),
        dueDate: shift('2026-01-25T14:00:00'),
        assignedTo: 'Jan Elektrikář',
        realCost: 850
    }
];
