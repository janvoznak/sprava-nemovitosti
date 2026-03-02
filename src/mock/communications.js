/**
 * Mock Communications Data
 */

export const communications = [
    // Property P0001 - Jan Novák
    {
        id: 'COMM001',
        tenantName: 'Jan Novák',
        propertyId: 'P0001',
        type: 'note',
        title: 'Úvodní schůzka',
        content: 'Předání klíčů a instrukce k užívání bytu proběhlo v pořádku. Nájemník byl poučen o třídění odpadu.',
        createdAt: '2024-01-01T10:00:00',
        createdBy: 'Admin',
        tags: ['smlouva', 'předání']
    },
    {
        id: 'COMM002',
        tenantName: 'Jan Novák',
        propertyId: 'P0001',
        type: 'payment',
        title: 'Platba kauce potvrzena',
        content: 'Kauce ve výši 45 000 Kč byla připsána na účet.',
        createdAt: '2024-01-02T14:30:00',
        createdBy: 'Systém',
        tags: ['finance', 'kauce']
    },
    {
        id: 'COMM003',
        tenantName: 'Jan Novák',
        propertyId: 'P0001',
        type: 'note',
        title: 'Ohlášení opravy',
        content: 'Nájemník nahlásil protékající WC. Předáno technikovi (Ticket #204).',
        createdAt: '2026-02-01T09:00:00',
        createdBy: 'Admin',
        tags: ['údržba']
    },
    {
        id: 'COMM011',
        tenantName: 'Jan Novák',
        propertyId: 'P0001',
        type: 'reminder',
        title: 'Upomínka - Nedoplatek energie',
        content: 'Odeslána upomínka na nedoplatek za elektřinu ve výši 2 500 Kč.',
        createdAt: '2025-06-15T10:00:00',
        createdBy: 'Admin',
        tags: ['finance', 'upomínka']
    },
    {
        id: 'COMM012',
        tenantName: 'Jan Novák',
        propertyId: 'P0001',
        type: 'payment',
        title: 'Uhrazen nedoplatek',
        content: 'Nedoplatek za elektřinu byl uhrazen.',
        createdAt: '2025-06-18T14:00:00',
        createdBy: 'Systém',
        tags: ['finance', 'platba']
    },

    // Property P0001 - Eva Svobodová
    {
        id: 'COMM004',
        tenantName: 'Eva Svobodová',
        propertyId: 'P0001',
        type: 'note',
        title: 'Dotaz na parkování',
        content: 'Nájemnice se zajímala o možnost pronájmu parkovacího místa ve dvoře. Momentálně není volné místo.',
        createdAt: '2026-01-15T11:00:00',
        createdBy: 'Admin',
        tags: ['parkování']
    },
    {
        id: 'COMM005',
        tenantName: 'Eva Svobodová',
        propertyId: 'P0001',
        type: 'complaint',
        title: 'Hluk v domě',
        content: 'Stížnost na hlučné sousedy v nočních hodinách. Prodiskutováno se sousedy z 3. patra.',
        createdAt: '2026-01-20T22:30:00',
        createdBy: 'Admin',
        tags: ['stížnost', 'hluk']
    },
    {
        id: 'COMM013',
        tenantName: 'Eva Svobodová',
        propertyId: 'P0001',
        type: 'note',
        title: 'Email o vyúčtování',
        content: 'Zasláno roční vyúčtování služeb emailem.',
        createdAt: '2025-04-30T09:00:00',
        createdBy: 'Admin',
        tags: ['vyúčtování', 'email']
    },

    // Property P0002 - Petr Dvořák
    {
        id: 'COMM007',
        tenantName: 'Petr Dvořák',
        propertyId: 'P0002',
        type: 'payment',
        title: 'Pravidelná platba nájmu',
        content: 'Nájemné za únor 2026 přijato včas.',
        createdAt: '2026-02-02T08:00:00',
        createdBy: 'Systém',
        tags: ['platba']
    },
    {
        id: 'COMM014',
        tenantName: 'Petr Dvořák',
        propertyId: 'P0002',
        type: 'complaint',
        title: 'Nefunkční výtah',
        content: 'Nájemník nahlásil, že výtah v mezipatře nefunguje. Nahlášeno servisní firmě.',
        createdAt: '2026-01-10T16:00:00',
        createdBy: 'Admin',
        tags: ['údržba', 'výtah']
    },
    {
        id: 'COMM015',
        tenantName: 'Petr Dvořák',
        propertyId: 'P0002',
        type: 'note',
        title: 'Telefonát - prodloužení smlouvy',
        content: 'Telefonický hovor s nájemníkem. Má zájem o prodloužení nájmu o další rok. Připravit dodatek.',
        createdAt: '2025-11-20T13:45:00',
        createdBy: 'Markéta V.',
        tags: ['smlouva']
    },

    // Jana Nováková
    {
        id: 'COMM008',
        tenantName: 'Jana Nováková',
        propertyId: 'P0001',
        type: 'complaint',
        title: 'Problém s topením',
        content: 'Nahlášena porucha termostatu v ložnici. Zima v pokoji.',
        createdAt: '2026-01-25T13:00:00',
        createdBy: 'Admin',
        tags: ['údržba', 'topení']
    },
    {
        id: 'COMM016',
        tenantName: 'Jana Nováková',
        propertyId: 'P0001',
        type: 'note',
        title: 'Výměna zámku',
        content: 'Nájemnice ztratila klíče, provedena výměna vložky na náklady nájemnice.',
        createdAt: '2025-08-15T11:00:00',
        createdBy: 'Technik',
        tags: ['údržba', 'klíče']
    },

    // Tomáš Procházka
    {
        id: 'COMM009',
        tenantName: 'Tomáš Procházka',
        propertyId: 'P0002',
        type: 'note',
        title: 'Změna trvalého bydliště',
        content: 'Nájemník doložil potvrzení o změně trvalého pobytu do pronajímaného bytu.',
        createdAt: '2026-01-10T15:00:00',
        createdBy: 'Admin',
        tags: ['administrativa']
    },
    {
        id: 'COMM017',
        tenantName: 'Tomáš Procházka',
        propertyId: 'P0002',
        type: 'reminder',
        title: 'Kontrola plynového kotle',
        content: 'Připomenutí termínu roční revize kotle. Domluveno na 2.2.2026.',
        createdAt: '2026-01-25T09:30:00',
        createdBy: 'Admin',
        tags: ['revize', 'údržba']
    },

    // Martina Černá
    {
        id: 'COMM020',
        tenantName: 'Martina Černá',
        propertyId: 'P0003',
        type: 'note',
        title: 'Povolení k chovu zvířete',
        content: 'Udělen souhlas s chovem psa (menší plemeno) v bytě.',
        createdAt: '2024-12-01T10:00:00',
        createdBy: 'Admin',
        tags: ['smlouva', 'domácí mazlíčci']
    },

    // Jiří Veselý
    {
        id: 'COMM021',
        tenantName: 'Jiří Veselý',
        propertyId: 'P0004',
        type: 'note',
        title: 'Instalace internetu',
        content: 'Na žádost nájemníka povolen vstup technikovi UPC pro instalaci zásuvky.',
        createdAt: '2024-02-15T09:00:00',
        createdBy: 'Admin',
        tags: ['internet', 'technické']
    },

    // Lenka Horáková
    {
        id: 'COMM010',
        tenantName: 'Lenka Horáková',
        propertyId: 'P0008',
        type: 'note',
        title: 'Nahlášení dovolené',
        content: 'Nájemnice ohlásila nepřítomnost od 15.2. do 28.2. Květiny zalije sousedka.',
        createdAt: '2026-02-03T08:00:00',
        createdBy: 'Admin',
        tags: ['informace']
    },
    {
        id: 'COMM022',
        tenantName: 'Lenka Horáková',
        propertyId: 'P0008',
        type: 'payment',
        title: 'Vrácení přeplatku',
        content: 'Přeplatek za služby 2 300 Kč odeslán na účet nájemnice.',
        createdAt: '2025-05-20T11:00:00',
        createdBy: 'Systém',
        tags: ['finance', 'vyúčtování']
    }
];

export default communications;
