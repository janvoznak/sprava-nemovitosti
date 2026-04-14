// Helper function to generate mock data
const generateMockData = () => {
    const czechStreets = [
        { street: 'Václavské náměstí', number: '28', city: 'Praha 1', zip: '110 00', area: 'Nové Město', lat: 50.0816, lng: 14.4282 },
        { street: 'Pařížská', number: '15', city: 'Praha 1', zip: '110 00', area: 'Josefov', lat: 50.0904, lng: 14.4165 },
        { street: 'Vinohradská', number: '184', city: 'Praha 3', zip: '130 00', area: 'Vinohrady', lat: 50.0730, lng: 14.4520 },
        { street: 'Jugoslávská', number: '29', city: 'Praha 2', zip: '120 00', area: 'Vinohrady', lat: 50.0762, lng: 14.4396 },
        { street: 'Londýnská', number: '55', city: 'Praha 2', zip: '120 00', area: 'Vinohrady', lat: 50.0749, lng: 14.4371 },
        { street: 'Legerova', number: '12', city: 'Praha 2', zip: '120 00', area: 'Nové Město', lat: 50.0784, lng: 14.4292 },
        { street: 'Anglická', number: '23', city: 'Praha 2', zip: '120 00', area: 'Vinohrady', lat: 50.0756, lng: 14.4418 },
        { street: 'Masarykova', number: '56', city: 'Brno', zip: '602 00', area: 'Brno-střed', lat: 49.1951, lng: 16.6068 },
        { street: 'Veveří', number: '331', city: 'Brno', zip: '602 00', area: 'Veveří', lat: 49.2015, lng: 16.5978 },
        { street: 'Kounicova', number: '67a', city: 'Brno', zip: '602 00', area: 'Ponava', lat: 49.2042, lng: 16.6025 },
        { street: 'Česká', number: '149', city: 'Brno', zip: '602 00', area: 'Brno-střed', lat: 49.1957, lng: 16.6082 },
        { street: 'Nádražní', number: '124', city: 'Ostrava', zip: '702 00', area: 'Moravská Ostrava', lat: 49.8368, lng: 18.2919 },
        { street: '28. října', number: '88', city: 'Ostrava', zip: '702 00', area: 'Moravská Ostrava', lat: 49.8355, lng: 18.2901 },
        { street: 'Sokolská třída', number: '33', city: 'Ostrava', zip: '702 00', area: 'Moravská Ostrava', lat: 49.8342, lng: 18.2934 },
        { street: 'Hlavní třída', number: '142', city: 'Plzeň', zip: '301 00', area: 'Plzeň 1', lat: 49.7478, lng: 13.3775 },
        { street: 'Americká', number: '57', city: 'Plzeň', zip: '301 00', area: 'Plzeň 1', lat: 49.7464, lng: 13.3792 },
        { street: 'Palackého náměstí', number: '7', city: 'Olomouc', zip: '779 00', area: 'Olomouc-střed', lat: 49.5940, lng: 17.2509 },
        { street: 'Denisova', number: '31', city: 'Olomouc', zip: '779 00', area: 'Olomouc-střed', lat: 49.5952, lng: 17.2528 },
        { street: 'Hviezdoslavova', number: '15', city: 'Karlovy Vary', zip: '360 01', area: 'Karlovy Vary', lat: 50.2311, lng: 12.8719 },
        { street: 'Dr. Davida Bechera', number: '23', city: 'Karlovy Vary', zip: '360 01', area: 'Karlovy Vary', lat: 50.2298, lng: 12.8738 }
    ];

    const statuses = ['Aktivní', 'Aktivní', 'Aktivní', 'Rekonstrukce', 'Aktivní'];
    const tenantStatuses = ['Pronajato', 'Pronajato', 'Volné', 'Pronajato', 'Pronajato'];
    const ownershipTypes = ['Vlastní', 'SVJ', 'Družstevní'];
    const names = ['Jan Novák', 'Eva Svobodová', 'Petr Dvořák', 'Jana Nováková', 'Tomáš Procházka', 'Martina Černá', 'Jiří Veselý', 'Lenka Horáková'];

    return czechStreets.map((addr, i) => {
        // Use deterministic "random" based on index i
        const seededRandom = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const rand = seededRandom(i + 1);
        const baseRent = Math.floor(rand * 15000) + 10000;
        const units = (i % 5) + 3; // 3-7 units
        const occupied = (i % 3) + 1; // at least 1 occupied
        const occupancyPerc = Math.round((occupied / units) * 100);
        const hasDebt = (i % 4) === 0;

        return {
            id: `P${String(i + 1).padStart(4, '0')}`,
            name: `${addr.street} ${addr.number}`,
            city: addr.city,
            street: addr.street,
            houseNumber: addr.number,
            cadastralArea: addr.area,
            zipCode: addr.zip,
            lat: addr.lat,
            lng: addr.lng,
            type: 'Bytový dům',
            area: `${400 + (i * 10)} m2`,
            validFrom: '1.1.2024',
            validTo: '31.12.2024',
            landlord: names[i % names.length],
            phone: `+420 777 ${100 + i} ${200 + i}`,
            occupancyRatio: `${occupied}/${units}`,
            isOccupied: occupied > 0,
            isParent: true,
            deposit: `${baseRent * 3} Kč`,
            rent: `${baseRent * units} Kč`,
            image: `https://picsum.photos/seed/${i + 1}/300/200`,
            status: statuses[i % statuses.length],
            occupancyPercentage: occupancyPerc,
            hasDebt: hasDebt,
            debtAmount: hasDebt ? 15000 + (i * 1000) : 0,

            // Visual Indicators Data
            depositTotal: baseRent * units * 3,
            depositCollected: Math.floor((baseRent * units * 3) * 0.8),

            revisionStatus: {
                total: 5,
                valid: 4,
                expiring: i % 5 === 0,
                expired: i % 7 === 0 // Simulate some expired revisions
            },

            // Technical
            tech_building: String.fromCharCode(65 + (i % 5)),
            tech_state: ['Velmi dobrý', 'Dobrý', 'Udržovaný'][i % 3],
            tech_location: 'Centrum města',
            tech_type: 'Bytový dům',
            tech_size: 'Střední',
            tech_construction: 'Panelová',
            tech_floors: 5,
            tech_floors_under: 1,
            tech_land_area: 500,

            // Energy
            energy_class: ['A', 'B', 'C'][i % 3] + ' - Úsporná',
            energy_law: '78/2013 Sb.',
            energy_indicator: 100 + i,
            energy_eic: `GAS100200300${i}`,
            energy_ean: `EAN100200300${i}`,
            energy_heating: ['Ústřední dálkové', 'Plynové', 'Elektrické'][i % 3],

            // New technical fields
            ean_kod: `EAN100200300${i}`,
            eic_kod: `GAS100200300${i}`,
            cislo_odberneho_mist: `OM-2024-${String(i + 1).padStart(3, '0')}`,
            vymera_m2: 400 + (i * 10),
            typ_vlastnictvi: ownershipTypes[i % ownershipTypes.length],

            // Economic
            econ_rent: baseRent * units,
            econ_services: Math.floor(baseRent * units * 0.15),
            econ_repairs: Math.floor(baseRent * units * 0.05),
            econ_deposit: baseRent * 3,
            econ_commission: baseRent * units,
            econ_area_services: 400 + (i * 10),
            econ_note: 'Nájemné splatné k 15. v měsíci.',

            // Units
            units: Array.from({ length: units }, (_, ui) => {
                const isOccupied = ui < occupied;
                const tenantName = isOccupied ? names[(i + ui) % names.length] : '-';
                const disposition = ['1+kk', '1+1', '2+kk', '2+1', '3+kk'][ui % 5];
                const totalArea = 50 + (ui * 5);
                const livingArea = Math.floor(totalArea * 0.9);
                const serviceCharges = Math.floor(baseRent * 0.2);

                return {
                    // Existing basic info
                    id: `U${String(i + 1).padStart(2, '0')}${String(ui + 1).padStart(2, '0')}`,
                    label: `Byt č. ${String(ui + 1).padStart(3, '0')} (${disposition})`,
                    area: `${totalArea} m²`,
                    validity: isOccupied ? `od: 1.1.2024 do: 31.12.2024` : '-',
                    contractStart: isOccupied ? `01.01.2024` : null,
                    contractEnd: isOccupied ? '31.12.2024' : null,
                    tenant: tenantName,
                    email: isOccupied ? `${tenantName.toLowerCase().replace(' ', '.')}@email.cz` : '-',
                    phone: isOccupied ? `+420 608 ${100 + i}${200 + ui}` : '-',
                    occupancy: isOccupied ? `2/2` : '0/2',
                    isDeposited: isOccupied,
                    depositAmount: isOccupied ? baseRent * 2 : 0,
                    rentDueDay: 15,
                    rent: baseRent,
                    status: isOccupied ? 'Pronajato' : 'Volné',
                    paymentHistory: isOccupied ? [
                        { month: 'Leden', status: 'paid', paidDate: '12.1.' },
                        { month: 'Únor', status: 'paid', paidDate: '14.2.' }
                    ] : [],

                    // NEW: Structure attributes
                    floor: Math.floor(ui / 2) + 1, // 1st, 2nd, 3rd floor etc
                    disposition: disposition,
                    orientation: ['Jih', 'Sever', 'Východ', 'Západ', 'Jih-Západ'][ui % 5],
                    livingArea: livingArea,
                    totalArea: totalArea,

                    // NEW: Equipment and condition
                    condition: ['Výborný', 'Velmi dobrý', 'Dobrý', 'Uspokojivý'][(ui + i) % 4],
                    hasKitchen: true,
                    hasBalcony: ui % 2 === 0,
                    hasCellar: ui % 3 !== 0,
                    appliances: ui % 2 === 0 ? ['Pračka', 'Lednice', 'Sporák'] : ['Lednice', 'Sporák'],
                    flooring: ['Laminát', 'Parkety', 'Dlažba'][(ui + i) % 3],
                    windows: ui % 3 === 0 ? 'Dřevěná' : 'Plastová',

                    // NEW: Service Charges Breakdown & Settlements
                    serviceCharges: serviceCharges,
                    serviceBreakdown: {
                        coldWater: Math.floor(serviceCharges * 0.2), // Studená voda
                        hotWater: Math.floor(serviceCharges * 0.3),  // Teplá voda
                        heating: Math.floor(serviceCharges * 0.3),   // Topení
                        waste: Math.floor(serviceCharges * 0.05),    // Odpad
                        electricityCommon: Math.floor(serviceCharges * 0.05), // Společná elektřina
                        elevator: Math.floor(serviceCharges * 0.05), // Výtah
                        cleaning: Math.floor(serviceCharges * 0.05)  // Úklid
                    },
                    advancesPaid: isOccupied ? serviceCharges * 12 : 0, // Mock annual payments
                    settlements: isOccupied && ui % 2 === 0 ? [
                        {
                            id: `S${2023}${i}${ui}`,
                            period: '2023',
                            date: '15.03.2024',
                            totalCost: (serviceCharges * 12) + (Math.random() > 0.5 ? 2000 : -1500), // Random over/underpayment
                            totalAdvances: serviceCharges * 12,
                            result: Math.random() > 0.5 ? 2000 : -1500,
                            status: Math.random() > 0.5 ? 'Nezaplaceno' : 'Vyrovnáno',
                            items: [
                                { type: 'Studená voda', cost: Math.floor(serviceCharges * 0.2 * 12 * 1.1), advance: Math.floor(serviceCharges * 0.2 * 12), result: -500 },
                                { type: 'Teplá voda', cost: Math.floor(serviceCharges * 0.3 * 12 * 0.9), advance: Math.floor(serviceCharges * 0.3 * 12), result: 1000 },
                                { type: 'Topení', cost: Math.floor(serviceCharges * 0.3 * 12 * 1.05), advance: Math.floor(serviceCharges * 0.3 * 12), result: -800 }
                            ]
                        }
                    ] : [],

                    totalMonthlyPayment: isOccupied ? baseRent + serviceCharges : 0,

                    // NEW: Meters (if occupied)
                    meters: isOccupied ? [
                        {
                            type: 'Elektřina',
                            serialNumber: `EL-${Math.floor(Math.random() * 900000) + 100000}`,
                            lastReading: Math.floor(Math.random() * 5000) + 1000,
                            lastReadingDate: '01.01.2025'
                        },
                        {
                            type: 'Voda',
                            serialNumber: `W-${Math.floor(Math.random() * 90000) + 10000}`,
                            lastReading: Math.floor(Math.random() * 200) + 50,
                            lastReadingDate: '01.01.2025'
                        }
                    ] : [],

                    // NEW: History and notes
                    lastRenovation: ui % 3 === 0 ? '15.6.2024' : null,
                    renovationNotes: ui % 3 === 0 ? 'Vymalováno, nové podlahy v obývacím pokoji' : '',
                    tenantHistory: isOccupied && ui % 2 === 0 ? [
                        {
                            tenant: names[(i + ui + 3) % names.length],
                            from: '01.01.2022',
                            to: '31.12.2023'
                        }
                    ] : [],
                    internalNotes: ui % 4 === 0 ? 'Požadavek na výměnu bojleru v příštím roce' : '',

                    // EXPANDED: Personal & Household Data
                    birthDate: isOccupied ? `15.${Math.floor(Math.random() * 12) + 1}.19${Math.floor(Math.random() * 20) + 70}` : '-',
                    idNumber: isOccupied ? `${Math.floor(Math.random() * 1000000)}/${Math.floor(Math.random() * 10000)}` : '-',
                    permanentAddress: isOccupied ? `Dlouhá ${Math.floor(Math.random() * 100)}, Praha 1` : '-',
                    bankAccount: isOccupied ? `${Math.floor(Math.random() * 1000000000)}/0800` : '-',
                    employer: isOccupied ? ['Škoda Auto', 'ČEZ', 'Seznam.cz', 'Avast', 'Freelancer'][ui % 5] : '-',

                    householdMembers: isOccupied && ui % 3 === 0 ? [
                        { name: 'Jana Nováková', relation: 'Manželka', birthDate: '10.5.1985' },
                        { name: 'Petr Novák', relation: 'Syn', birthDate: '20.1.2015' }
                    ] : [],

                    insurancePolicy: isOccupied ? {
                        provider: ['Allianz', 'Generali', 'Kooperativa'][ui % 3],
                        number: `P-${Math.floor(Math.random() * 10000000)}`,
                        validUntil: '31.12.2025'
                    } : null,

                    // Contact added date
                    joinedDate: isOccupied ? `10.12.2023` : null
                };
            }),

            // Revisions
            revisions: [
                {
                    type: 'Elektřina',
                    date: `15.${Math.floor(Math.random() * 12) + 1}.2024`,
                    validUntil: '15.10.2026',
                    status: 'Platná',
                    technician: 'Ing. Karel Elektrikář',
                    phone: '+420 608 123 456',
                    description: 'Pravidelná revize elektroinstalace',
                    daysLeft: Math.floor(Math.random() * 500) + 200
                },
                {
                    type: 'Plyn',
                    date: `01.${Math.floor(Math.random() * 12) + 1}.2024`,
                    validUntil: '01.09.2025',
                    status: Math.random() > 0.8 ? 'Expiruje' : 'Platná',
                    technician: 'Jan Horák',
                    phone: '+420 777 555 444',
                    description: 'Revize plynového kotle',
                    daysLeft: Math.floor(Math.random() * 300) + 50
                }
            ],

            meters: [
                {
                    type: 'Elektroměr',
                    serialNumber: `EL-${Math.floor(Math.random() * 900000) + 100000}`,
                    lastValue: `${Math.floor(Math.random() * 20000) + 5000} kWh`,
                    date: '01.01.2025'
                },
                {
                    type: 'Vodoměr',
                    serialNumber: `W-${Math.floor(Math.random() * 90000) + 10000}`,
                    lastValue: `${Math.floor(Math.random() * 500) + 100} m³`,
                    date: '31.12.2024'
                }
            ]
        };
    });
};

export const mockProperties = generateMockData();
