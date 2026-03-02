import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import PropertyListView from '@/views/PropertyListView.vue'
import PropertyDetailView from '@/views/PropertyDetailView.vue'
import MaintenanceView from '@/views/MaintenanceView.vue'
import SettingsView from '@/views/SettingsView.vue'

// Newly Created Views
import GenericListView from '@/views/generic/GenericListView.vue'
import MaintenanceCalendarView from '@/views/maintenance/MaintenanceCalendarView.vue'
import BudgetView from '@/views/finance/BudgetView.vue'
import FinanceDashboardView from '@/views/finance/FinanceDashboardView.vue'
import PropertyImportExportView from '@/views/properties/PropertyImportExportView.vue'
import PropertyMapView from '@/views/properties/PropertyMapView.vue'
import AddPropertyForm from '@/views/properties/AddPropertyForm.vue'
import NewMaintenanceRequestForm from '@/views/maintenance/NewMaintenanceRequestForm.vue'
import SettingsProfileView from '@/views/settings/SettingsProfileView.vue'

const routes = [
    // Dashboard
    {
        path: '/',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
    },

    // --- Nemovitosti ---
    {
        path: '/properties',
        name: 'PropertyList',
        component: PropertyListView,
        meta: { title: 'Nemovitosti - Přehled' }
    },
    {
        path: '/units',
        name: 'UnitList',
        component: () => import('@/views/UnitListView.vue'),
        meta: { title: 'Jednotky - Přehled' }
    },
    {
        path: '/properties/add',
        name: 'AddProperty',
        component: AddPropertyForm,
        meta: { title: 'Nová nemovitost' }
    },
    {
        path: '/properties/map',
        name: 'PropertyMap',
        component: PropertyMapView,
        meta: { title: 'Mapa nemovitostí' }
    },
    {
        path: '/properties/import-export',
        name: 'PropertyImportExport',
        component: PropertyImportExportView,
        meta: { title: 'Import / Export' }
    },
    {
        path: '/properties/:id',
        name: 'PropertyDetail',
        component: PropertyDetailView,
        meta: { title: 'Detail nemovitosti' }
    },
    {
        path: '/properties/:propertyId/units/:unitId',
        name: 'UnitDetail',
        component: () => import('@/views/UnitDetailView.vue'),
        meta: { title: 'Detail jednotky' }
    },

    // --- Adresář (Tenants) ---
    {
        path: '/tenants',
        name: 'TenantList',
        component: () => import('@/views/tenants/TenantListView.vue'),
        meta: { title: 'Adresář - Přehled' }
    },
    {
        path: '/tenants/new',
        name: 'NewTenant',
        component: () => import('@/views/tenants/NewTenantView.vue'),
        meta: { title: 'Nový nájemce' }
    },
    {
        path: '/tenants/:propertyId/:tenantId',
        name: 'TenantDetail',
        component: () => import('@/views/tenants/TenantDetailView.vue'),
        meta: { title: 'Detail nájemce' }
    },

    // --- Údržba ---
    {
        path: '/maintenance',
        name: 'Maintenance',
        component: MaintenanceView,
        meta: { title: 'Údržba - Kanban' }
    },
    {
        path: '/maintenance/new',
        name: 'NewMaintenanceRequest',
        component: NewMaintenanceRequestForm,
        meta: { title: 'Nový požadavek' }
    },
    {
        path: '/maintenance/calendar',
        name: 'MaintenanceCalendar',
        component: MaintenanceCalendarView,
        meta: { title: 'Kalendář údržby' }
    },
    {
        path: '/maintenance/suppliers',
        name: 'MaintenanceSuppliers',
        component: GenericListView,
        props: {
            title: 'Dodavatelé',
            subtitle: 'Adresář ověřených řemeslníků a firem',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Údržba', to: '/maintenance' }, { label: 'Dodavatelé' }],
            columns: [
                { key: 'name', label: 'Firma' },
                { key: 'field', label: 'Obor' },
                { key: 'phone', label: 'Telefon' },
                { key: 'email', label: 'E-mail' },
                { key: 'rating', label: 'Hodnocení', type: 'rating' }
            ],
            items: [
                { id: 1, name: 'Instalatérství Novák', field: 'Voda/Topení', phone: '608 123 456', email: 'info@novak-voda.cz', rating: 5 },
                { id: 2, name: 'Elektro Rychle', field: 'Elektřina', phone: '777 987 654', email: 'servis@elektro-rychle.cz', rating: 4 },
                { id: 3, name: 'Úklid s.r.o.', field: 'Úklid', phone: '222 333 444', email: 'objednavky@uklid.cz', rating: 3 }
            ],
            mainAction: { label: 'Přidat dodavatele', icon: 'add' },
            actions: [{ key: 'call', icon: 'phone', label: 'Zavolat' }]
        },
        meta: { title: 'Dodavatelé' }
    },
    {
        path: '/maintenance/history',
        name: 'MaintenanceHistory',
        component: GenericListView,
        props: {
            title: 'Historie oprav',
            subtitle: 'Archiv dokončených servisních zásahů',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Údržba', to: '/maintenance' }, { label: 'Historie' }],
            columns: [
                { key: 'date', label: 'Datum' },
                { key: 'property', label: 'Nemovitost' },
                { key: 'desc', label: 'Popis' },
                { key: 'price', label: 'Cena', type: 'currency' },
                { key: 'status', label: 'Stav', type: 'status' }
            ],
            items: [
                { id: 1, date: '01.02.2025', property: 'Villa Nová', desc: 'Oprava střechy', price: 15600, status: 'Dokončeno' },
                { id: 2, date: '15.01.2025', property: 'Bytový dům Na Kopci', desc: 'Výměna zámků', price: 2500, status: 'Dokončeno' },
                { id: 3, date: '10.01.2025', property: 'Komerční centrum A2', desc: 'Revize elektro', price: 5000, status: 'Dokončeno' }
            ],
            filters: [{ key: 'status', label: 'Všechny stavy', options: [{ label: 'Dokončeno', value: 'Dokončeno' }] }]
        },
        meta: { title: 'Historie oprav' }
    },

    {
        path: '/finance',
        name: 'Finance',
        component: FinanceDashboardView,
        meta: { title: 'Finance - Přehled' }
    },
    {
        path: '/debtors',
        name: 'Debtors',
        component: () => import('@/views/DebtorsView.vue'),
        meta: { title: 'Dlužníci' }
    },
    {
        path: '/finance/payments',
        name: 'FinancePayments',
        component: GenericListView,
        props: {
            title: 'Platby',
            subtitle: 'Deník příchozích plateb nájemného',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Finance', to: '/finance' }, { label: 'Platby' }],
            columns: [
                { key: 'date', label: 'Datum' },
                { key: 'amount', label: 'Částka', type: 'currency' },
                { key: 'vs', label: 'VS' },
                { key: 'tenant', label: 'Nájemník' },
                { key: 'status', label: 'Stav', type: 'status' }
            ],
            items: [
                { id: 1, date: '02.02.2025', amount: 12500, vs: '2025001', tenant: 'Jan Novák', status: 'Zaplaceno' },
                { id: 2, date: '02.02.2025', amount: 9000, vs: '2025002', tenant: 'Petr Svoboda', status: 'Zaplaceno' },
                { id: 3, date: '01.02.2025', amount: 15000, vs: '2025003', tenant: 'Karel Dvořák', status: 'Částečná úhrada' }
            ],
            mainAction: { label: 'Nová platba', icon: 'add' }
        },
        meta: { title: 'Platby' }
    },
    {
        path: '/finance/invoices',
        name: 'FinanceInvoices',
        component: GenericListView,
        props: {
            title: 'Faktury',
            subtitle: 'Vydané a přijaté faktury',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Finance', to: '/finance' }, { label: 'Faktury' }],
            columns: [
                { key: 'number', label: 'Číslo' },
                { key: 'subject', label: 'Subjekt' },
                { key: 'amount', label: 'Částka', type: 'currency' },
                { key: 'due', label: 'Splatnost' },
                { key: 'status', label: 'Stav', type: 'status' }
            ],
            items: [
                { id: 1, number: 'FV-2025-001', subject: 'Nájemné únor', amount: 45000, due: '15.02.2025', status: 'Vystaveno' },
                { id: 2, number: 'FP-2025-089', subject: 'Pražská Plynárenská', amount: 8500, due: '10.02.2025', status: 'Po splatnosti' }
            ],
            mainAction: { label: 'Vystavit fakturu', icon: 'description' },
            actions: [{ key: 'download', icon: 'file_download', label: 'PDF' }]
        },
        meta: { title: 'Faktury' }
    },
    {
        path: '/finance/expenses',
        name: 'FinanceExpenses',
        component: GenericListView,
        props: {
            title: 'Náklady',
            subtitle: 'Evidence provozních nákladů',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Finance', to: '/finance' }, { label: 'Náklady' }],
            columns: [
                { key: 'date', label: 'Datum' },
                { key: 'category', label: 'Kategorie' },
                { key: 'description', label: 'Popis' },
                { key: 'amount', label: 'Částka', type: 'currency' }
            ],
            items: [
                { id: 1, date: '28.01.2025', category: 'Energie', description: 'Záloha elektřina', amount: 12000 },
                { id: 2, date: '25.01.2025', category: 'Opravy', description: 'Havárie voda', amount: 5600 }
            ],
            mainAction: { label: 'Zadat výdaj', icon: 'remove' }
        },
        meta: { title: 'Náklady' }
    },
    {
        path: '/finance/budget',
        name: 'Budget',
        component: BudgetView,
        meta: { title: 'Rozpočet' }
    },

    // --- Nastavení ---
    {
        path: '/settings',
        redirect: '/settings/profile'
    },
    {
        path: '/settings/profile',
        name: 'SettingsProfile',
        component: SettingsProfileView,
        meta: { title: 'Profil' }
    },
    {
        path: '/settings/notifications',
        name: 'SettingsNotifications',
        component: GenericListView,
        props: {
            title: 'Notifikace',
            subtitle: 'Historie odeslaných upozornění',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Nastavení', to: '/settings' }, { label: 'Notifikace' }],
            columns: [
                { key: 'date', label: 'Datum' },
                { key: 'subject', label: 'Předmět' },
                { key: 'channel', label: 'Kanál' },
                { key: 'recipient', label: 'Příjemce' }
            ],
            items: [
                { id: 1, date: '02.02.2025', subject: 'Upomínka platby', channel: 'SMS', recipient: 'Jan Novák' },
                { id: 2, date: '01.02.2025', subject: 'Nová faktura', channel: 'E-mail', recipient: 'Petr Svoboda' }
            ]
        },
        meta: { title: 'Notifikace' }
    },
    {
        path: '/settings/templates',
        name: 'SettingsTemplates',
        component: GenericListView,
        props: {
            title: 'Šablony',
            subtitle: 'Vzory dokumentů a smluv',
            breadcrumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Nastavení', to: '/settings' }, { label: 'Šablony' }],
            columns: [
                { key: 'name', label: 'Název šablony' },
                { key: 'type', label: 'Typ' },
                { key: 'lastEdit', label: 'Poslední úprava' }
            ],
            items: [
                { id: 1, name: 'Nájemní smlouva 2025', type: 'PDF', lastEdit: '01.01.2025' },
                { id: 2, name: 'Předávací protokol', type: 'DOCX', lastEdit: '15.12.2024' }
            ],
            mainAction: { label: 'Nahrát šablonu', icon: 'upload_file' }
        },
        meta: { title: 'Šablony' }
    },
    {
        path: '/settings/system',
        name: 'SettingsSystem',
        component: SettingsView, // Reuse basic settings view for now
        meta: { title: 'Systém' }
    },

    // 404
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Optional: Update document title on route change
router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} - Poski REAL` : 'Poski REAL'
    next()
})

export default router
