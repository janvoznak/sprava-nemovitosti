export const documents = [
    // Jan Novák (P0001)
    {
        id: 'DOC001',
        propertyId: 'P0001',
        category: 'contracts',
        name: 'Nájemní smlouva - Jan Novák.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        uploadDate: '2024-01-15T10:30:00',
        metadata: { tenant: 'Jan Novák' },
        status: 'signed',
        signable: true,
        signedDate: '2024-01-16T14:20:00',
        signature: { name: 'Jan Novák', date: '2024-01-16T14:20:00' }
    },
    {
        id: 'DOC011',
        propertyId: 'P0001',
        category: 'revisions',
        name: 'Předávací protokol - byt 1.1.pdf',
        fileType: 'application/pdf',
        fileSize: 156000,
        uploadDate: '2024-01-15T11:00:00',
        metadata: { tenant: 'Jan Novák' },
        status: 'signed',
        signable: true,
        signedDate: '2024-01-15T11:15:00',
        signature: { name: 'Jan Novák', date: '2024-01-15T11:15:00' }
    },
    {
        id: 'DOC020',
        propertyId: 'P0001',
        category: 'invoices',
        name: 'Vyúčtování služeb 2023.pdf',
        fileType: 'application/pdf',
        fileSize: 342000,
        uploadDate: '2024-03-20T09:00:00',
        metadata: { tenant: 'Jan Novák' },
        status: 'pending',
        signable: true
    },

    // Eva Svobodová (P0001, P0002)
    {
        id: 'DOC002',
        propertyId: 'P0001',
        category: 'contracts',
        name: 'Nájemní smlouva - Eva Svobodová.pdf',
        fileType: 'application/pdf',
        fileSize: 198543,
        uploadDate: '2023-03-20T14:15:00',
        metadata: { tenant: 'Eva Svobodová' },
        status: 'signed',
        signable: true,
        signedDate: '2023-03-22T10:00:00'
    },
    {
        id: 'DOC008',
        propertyId: 'P0002',
        category: 'contracts',
        name: 'Nájemní smlouva - Eva Svobodová (Byt 2).pdf',
        fileType: 'application/pdf',
        fileSize: 215432,
        uploadDate: '2023-06-15T09:30:00',
        metadata: { tenant: 'Eva Svobodová' }
    },

    // Petr Dvořák (P0001)
    {
        id: 'DOC014',
        propertyId: 'P0001',
        category: 'contracts',
        name: 'Nájemní smlouva - Petr Dvořák.pdf',
        fileType: 'application/pdf',
        fileSize: 185000,
        uploadDate: '2026-01-10T11:00:00',
        metadata: { tenant: 'Petr Dvořák' },
        status: 'pending',
        signable: true
    },
    {
        id: 'DOC021',
        propertyId: 'P0001',
        category: 'insurance',
        name: 'Pojistka odpovědnosti.pdf',
        fileType: 'application/pdf',
        fileSize: 540000,
        uploadDate: '2026-01-12T15:30:00',
        metadata: { tenant: 'Petr Dvořák' }
    },

    // Jana Nováková 
    {
        id: 'DOC030',
        propertyId: 'P0003',
        category: 'contracts',
        name: 'Nájemní smlouva.pdf',
        fileType: 'application/pdf',
        fileSize: 230000,
        uploadDate: '2024-05-01T10:00:00',
        metadata: { tenant: 'Jana Nováková' },
        status: 'signed',
        signable: true,
        signedDate: '2024-05-01T10:30:00'
    },
    {
        id: 'DOC031',
        propertyId: 'P0003',
        category: 'photos',
        name: 'Stav bytu při předání.jpg',
        fileType: 'image/jpeg',
        fileSize: 3500000,
        uploadDate: '2024-05-01T11:00:00',
        metadata: { tenant: 'Jana Nováková' },
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },

    // Tomáš Procházka (P0002)
    {
        id: 'DOC016',
        propertyId: 'P0002',
        category: 'contracts',
        name: 'Nájemní smlouva - Tomáš Procházka.pdf',
        fileType: 'application/pdf',
        fileSize: 210000,
        uploadDate: '2026-02-01T14:45:00',
        metadata: { tenant: 'Tomáš Procházka' },
        status: 'pending',
        signable: true
    },
    {
        id: 'DOC017',
        propertyId: 'P0002',
        category: 'revisions',
        name: 'Potvrzení o revizi plynu.pdf',
        fileType: 'application/pdf',
        fileSize: 120000,
        uploadDate: '2026-02-02T09:00:00',
        metadata: { tenant: 'Tomáš Procházka' }
    },

    // Martina Černá
    {
        id: 'DOC040',
        propertyId: 'P0003',
        category: 'contracts',
        name: 'Smlouva o nájmu.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 45000,
        uploadDate: '2024-11-15T13:00:00',
        metadata: { tenant: 'Martina Černá' }
    },
    {
        id: 'DOC041',
        propertyId: 'P0003',
        category: 'invoices',
        name: 'Doplatek energie 2023.pdf',
        fileType: 'application/pdf',
        fileSize: 180000,
        uploadDate: '2024-03-15T10:00:00',
        metadata: { tenant: 'Martina Černá' },
        status: 'pending',
        signable: true
    },

    // Jiří Veselý
    {
        id: 'DOC050',
        propertyId: 'P0004',
        category: 'contracts',
        name: 'Nájemní smlouva 2024.pdf',
        fileType: 'application/pdf',
        fileSize: 260000,
        uploadDate: '2024-01-05T09:00:00',
        metadata: { tenant: 'Jiří Veselý' },
        status: 'signed',
        signable: true,
        signedDate: '2024-01-06T18:00:00'
    },

    // Lenka Horáková (P0004)
    {
        id: 'DOC060',
        propertyId: 'P0004',
        category: 'contracts',
        name: 'Smlouva.pdf',
        fileType: 'application/pdf',
        fileSize: 220000,
        uploadDate: '2023-12-01T10:00:00',
        metadata: { tenant: 'Lenka Horáková' }
    },
    {
        id: 'DOC061',
        propertyId: 'P0004',
        category: 'revisions',
        name: 'Předávací protokol.pdf',
        fileType: 'application/pdf',
        fileSize: 150000,
        uploadDate: '2023-12-01T10:30:00',
        metadata: { tenant: 'Lenka Horáková' },
        status: 'pending',
        signable: true
    }
];

export default documents;
