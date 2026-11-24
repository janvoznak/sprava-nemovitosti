// Mock financial data - incomes and expenses
// All dates are relative to "today" so the demo never goes stale.

// Deterministic pseudo-random (stable between reloads)
let _seed = 7;
const rnd = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };

// Shift ISO dates written for the original anchor (2025-06-30) to the present
const ANCHOR = new Date('2025-06-30').getTime();
const shiftIso = (iso) => {
    const d = new Date(new Date(iso).getTime() + (Date.now() - ANCHOR));
    return d.toISOString().split('T')[0];
};

const generateIncomes = () => {
    const tenants = [
        { name: 'Jan Novák', property: 'Václavské náměstí 28', propertyId: 'P0001', rent: 25000 },
        { name: 'Eva Svobodová', property: 'Pařížská 15', propertyId: 'P0002', rent: 18000 },
        { name: 'Petr Dvořák', property: 'Vinohradská 184', propertyId: 'P0003', rent: 22000 },
        { name: 'Jana Nováková', property: 'Jugoslávská 29', propertyId: 'P0004', rent: 20000 },
        { name: 'Tomáš Procházka', property: 'Londýnská 55', propertyId: 'P0005', rent: 19000 },
        { name: 'Martina Černá', property: 'Legerova 12', propertyId: 'P0006', rent: 21000 },
        { name: 'Jiří Veselý', property: 'Anglická 23', propertyId: 'P0007', rent: 17000 },
        { name: 'Lenka Horáková', property: 'Masarykova 56', propertyId: 'P0008', rent: 23000 }
    ];

    const incomes = [];
    let id = 1;

    // Generate incomes for past 6 months
    const CZ_MONTHS = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
        return { month: d.getMonth() + 1, year: d.getFullYear(), name: `${CZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`, isLatest: k === 5, isPrevLatest: k === 4 };
    });

    months.forEach(({ month, year, name, isLatest, isPrevLatest }) => {
        tenants.forEach((tenant, idx) => {
            const dueDate = new Date(year, month - 1, 15); // Splatnost 15. v měsíci

            // Simulate different payment scenarios
            let paidDate = null;
            let status = 'unpaid';

            // Most recent month (June 2025) - some unpaid, some late
            if (isLatest) {
                const scenario = idx % 3;
                if (scenario === 0) {
                    // Paid on time
                    paidDate = new Date(year, month - 1, 12 + Math.floor(rnd() * 3));
                    status = 'paid';
                } else if (scenario === 1) {
                    // Paid late
                    paidDate = new Date(year, month - 1, 18 + Math.floor(rnd() * 5));
                    status = 'paid';
                } else {
                    // Not paid yet
                    const today = new Date();
                    status = dueDate < today ? 'late' : 'unpaid';
                }
            } else {
                // Past months - mostly paid
                const random = rnd();

                // FORCE: Jan Novák (P0001) is a critical debtor (didn't pay last 6 months)
                if (tenant.propertyId === 'P0001') {
                    status = 'unpaid';
                    paidDate = null;
                }
                // FORCE: Petr Dvořák (P0003) is a medium debtor (didn't pay last 2 months)
                else if (tenant.propertyId === 'P0003' && (isLatest || isPrevLatest)) {
                    status = 'unpaid';
                    paidDate = null;
                }
                else if (random > 0.15) { // 85% paid
                    const daysDelay = rnd() < 0.7 ? Math.floor(rnd() * 3) : Math.floor(rnd() * 10) + 3;
                    paidDate = new Date(year, month - 1, 15 + daysDelay);
                    status = 'paid';
                } else {
                    // 15% late/unpaid
                    status = 'late';
                }
            }

            incomes.push({
                id: `INC${String(id++).padStart(4, '0')}`,
                propertyId: tenant.propertyId,
                propertyName: tenant.property,
                tenant: tenant.name,
                amount: tenant.rent,
                dueDate: dueDate.toISOString().split('T')[0],
                paidDate: paidDate ? paidDate.toISOString().split('T')[0] : null,
                status: status,
                period: name,
                type: 'rent'
            });
        });
    });

    return incomes;
};

const generateExpenses = () => {
    const properties = [
        { id: 'P0001', name: 'Václavské náměstí 28' },
        { id: 'P0002', name: 'Pařížská 15' },
        { id: 'P0003', name: 'Vinohradská 184' },
        { id: 'P0004', name: 'Jugoslávská 29' },
        { id: 'P0005', name: 'Londýnská 55' }
    ];

    const expenses = [
        // Repairs
        {
            id: 'EXP0001',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'repair',
            description: 'Oprava kotle - vchod B',
            amount: 15000,
            date: shiftIso('2025-01-15'),
            status: 'paid',
            supplier: 'Technik s.r.o.'
        },
        {
            id: 'EXP0002',
            propertyId: 'P0003',
            propertyName: 'Vinohradská 184',
            category: 'repair',
            description: 'Výměna zámku vchodových dveří',
            amount: 8500,
            date: shiftIso('2025-02-20'),
            status: 'paid',
            supplier: 'Klíčnictví Rychle'
        },
        {
            id: 'EXP0003',
            propertyId: 'P0002',
            propertyName: 'Pařížská 15',
            category: 'repair',
            description: 'Oprava protékajícího ventilu',
            amount: 3200,
            date: shiftIso('2025-03-10'),
            status: 'paid',
            supplier: 'Instalatér Praha'
        },
        {
            id: 'EXP0004',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'repair',
            description: 'Malování společných prostor',
            amount: 22000,
            date: shiftIso('2025-04-05'),
            status: 'paid',
            supplier: 'Malířství Barva'
        },
        {
            id: 'EXP0005',
            propertyId: 'P0004',
            propertyName: 'Jugoslávská 29',
            category: 'repair',
            description: 'Oprava střechy - zatékání',
            amount: 45000,
            date: shiftIso('2025-05-12'),
            status: 'paid',
            supplier: 'Střechy expert s.r.o.'
        },

        // Revisions
        {
            id: 'EXP0006',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'revision',
            description: 'Revize elektroinstalace',
            amount: 4500,
            date: shiftIso('2025-01-08'),
            status: 'paid',
            supplier: 'Ing. Karel Elektrikář'
        },
        {
            id: 'EXP0007',
            propertyId: 'P0002',
            propertyName: 'Pařížská 15',
            category: 'revision',
            description: 'Revize plynového kotle',
            amount: 3800,
            date: shiftIso('2025-02-15'),
            status: 'paid',
            supplier: 'Jan Horák - revize'
        },
        {
            id: 'EXP0008',
            propertyId: 'P0003',
            propertyName: 'Vinohradská 184',
            category: 'revision',
            description: 'Revize komínů',
            amount: 2900,
            date: shiftIso('2025-03-22'),
            status: 'paid',
            supplier: 'Kominík Brno'
        },
        {
            id: 'EXP0009',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'revision',
            description: 'Revize plynového vedení',
            amount: 5200,
            date: shiftIso('2025-06-10'),
            status: 'unpaid',
            supplier: 'Plyn servis s.r.o.'
        },

        // Energy
        {
            id: 'EXP0010',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'energy',
            description: 'Elektřina - společné prostory',
            amount: 3200,
            date: shiftIso('2025-01-30'),
            status: 'paid',
            supplier: 'ČEZ'
        },
        {
            id: 'EXP0011',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'energy',
            description: 'Elektřina - společné prostory',
            amount: 2900,
            date: shiftIso('2025-02-28'),
            status: 'paid',
            supplier: 'ČEZ'
        },
        {
            id: 'EXP0012',
            propertyId: 'P0002',
            propertyName: 'Pařížská 15',
            category: 'energy',
            description: 'Plyn - vytápění',
            amount: 8500,
            date: shiftIso('2025-03-15'),
            status: 'paid',
            supplier: 'Innogy'
        },
        {
            id: 'EXP0013',
            propertyId: 'P0003',
            propertyName: 'Vinohradská 184',
            category: 'energy',
            description: 'Voda - společné prostory',
            amount: 1800,
            date: shiftIso('2025-04-20'),
            status: 'paid',
            supplier: 'Pražské vodovody'
        },

        // Tax
        {
            id: 'EXP0014',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'tax',
            description: 'Daň z nemovitosti 2025',
            amount: 12000,
            date: shiftIso('2025-05-31'),
            status: 'paid',
            supplier: 'Finanční úřad Praha 1'
        },
        {
            id: 'EXP0015',
            propertyId: 'P0002',
            propertyName: 'Pařížská 15',
            category: 'tax',
            description: 'Daň z nemovitosti 2025',
            amount: 9500,
            date: shiftIso('2025-05-31'),
            status: 'paid',
            supplier: 'Finanční úřad Praha 1'
        },
        {
            id: 'EXP0016',
            propertyId: 'P0003',
            propertyName: 'Vinohradská 184',
            category: 'tax',
            description: 'Daň z nemovitosti 2025',
            amount: 11200,
            date: shiftIso('2025-05-31'),
            status: 'paid',
            supplier: 'Finanční úřad Praha 3'
        },

        // Insurance
        {
            id: 'EXP0017',
            propertyId: 'P0001',
            propertyName: 'Václavské náměstí 28',
            category: 'insurance',
            description: 'Pojištění nemovitosti - roční',
            amount: 18000,
            date: shiftIso('2025-01-10'),
            status: 'paid',
            supplier: 'Kooperativa'
        },
        {
            id: 'EXP0018',
            propertyId: 'P0002',
            propertyName: 'Pařížská 15',
            category: 'insurance',
            description: 'Pojištění nemovitosti - roční',
            amount: 15500,
            date: shiftIso('2025-01-15'),
            status: 'paid',
            supplier: 'Allianz'
        },
        {
            id: 'EXP0019',
            propertyId: 'P0003',
            propertyName: 'Vinohradská 184',
            category: 'insurance',
            description: 'Pojištění nemovitosti - roční',
            amount: 16200,
            date: shiftIso('2025-01-20'),
            status: 'paid',
            supplier: 'ČSOB Pojišťovna'
        }
    ];

    return expenses;
};

export const mockIncomes = generateIncomes();
export const mockExpenses = generateExpenses();
