# Správa nemovitostí – Projektové instrukce

## Přehled projektu
SPA prototyp aplikace pro správu pronájmů nemovitostí. Určen k prezentaci klientovi — bez backendu, vše běží na mock datech v prohlížeči.

- **Projektová složka**: `/Users/poski/Documents/Claude/sprava-nemovitosti-claude`
- Nasazení: GitHub → Vercel (auto-deploy při push na `main`)
- Repozitář: `janvoznak/sprava-nemovitosti`
- Live URL: https://sprava-nemovitosti.vercel.app

## Tech Stack
- **Frontend**: Vue 3 (Composition API + `<script setup>`) + Vite 5
- **Routing**: Vue Router 5 (`createWebHistory`)
- **Styling**: Tailwind CSS v4 + globální styly v `src/assets/main.css` + inline styly v komponentách
- **Ikony**: Material Icons (Google Fonts CDN) + Lucide Vue Next
- **Mapa**: Leaflet 1.9 + `@vue-leaflet/vue-leaflet` (OSM tiles, bez API klíče)
- **Dashboard layout**: grid-layout-plus
- **HTTP klient**: Axios (připraven pro budoucí backend, aktuálně nevyužit)

> **Pozor:** Původní prázdný balíček `vue-leaflet` byl nahrazen `@vue-leaflet/vue-leaflet`.
> Import: `import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'`
> CSS: `import 'leaflet/dist/leaflet.css'`
> Nutný fix icon paths (Vite + Leaflet): viz `src/views/properties/PropertyMapView.vue`

## Architektura

### Klíčové soubory
- `src/main.js` — inicializace app, globální registrace `Sidebar`
- `src/App.vue` — shell layout (Sidebar + TopHeader + `<router-view>`)
- `src/router/index.js` — všechny routes, včetně dynamických `GenericListView` props
- `src/config/api.config.js` — konfigurace API, toggle mock vs. real
- `src/api/client.js` — Axios instance s interceptory (auth token, error handling)

### Adresářová struktura
```
src/
  api/          # Axios klient
  assets/       # CSS, logo
  components/   # UI komponenty organizované do podsložek podle feature
    common/       # AppInput, AppSelect, AppTextarea
    dashboard/    # widgety dashboardu
    debtors/      # dlužníci
    documents/    # dokumenty
    finance/      # CashFlowChart, ExpensesTable, ForecastSection, ...
    maintenance/  # MaintenanceCard, TicketDetailModal, ...
    mobile/       # mobilní FAB
    property/     # nemovitosti a jednotky
    tenants/      # nájemci
  composables/  # useNotification, useRuianAutocomplete, useViewMode
  config/       # api.config.js
  mock/         # zdrojová data: properties, finance, maintenance, communications, documents
  router/       # index.js
  services/     # business logika: property, unit, tenant, maintenance, finance, document, communication, debt, search, notification
  utils/        # debtCalculations, propertyScoring
  views/        # stránky (organizovány do podsložek dle feature)
```

### Services a mock persistence
Každý service (např. `propertyService`, `maintenanceService`) funguje takto:
1. Načte initial data z `localStorage` — pokud prázdné, použije mock soubory
2. Změny (přidání, úprava, smazání) ukládá zpět do `localStorage`
3. Simuluje async API přes `setTimeout` (200–400 ms delay)
4. Obsahuje `if (API_CONFIG.useMock)` větev pro budoucí přepnutí na real API

**Storage klíče:**
- `sprava_nemovitosti_properties`
- `sprava_nemovitosti_maintenance`
- (ostatní services používají podobný pattern)

### Mock vs. Real API
Ovládáno přes env proměnnou `VITE_USE_MOCK`:
- `.env.development` → `VITE_USE_MOCK=true` (lokální vývoj)
- `.env.production` → `VITE_USE_MOCK=true` (prototype deploy, bez backendu)

Při přechodu na real backend: změnit `.env.production` na `false` a nastavit `VITE_API_BASE_URL`.

### Finance dashboard (`src/views/finance/FinanceDashboardView.vue`)
Načítá data z `financeService` + `debtService` přes `Promise.all` v `onMounted`. KPI jsou vypočítány z reálných mock dat. Graf využívá existující `CashFlowChart` komponent. Struktura nákladů je počítána z kategorií výdajů (`energy`, `repairs`, `management`).

### Mapa nemovitostí (`src/views/properties/PropertyMapView.vue`)
Plnohodnotná Leaflet mapa (OSM tiles). Nemovitosti mají GPS souřadnice v `src/mock/properties.js` (pole `lat`, `lng`). Klik na nemovitost v levém panelu spustí `map.flyTo()`. Popup zobrazuje název, adresu, obsazenost a tlačítko → detail. Vyhledávání filtruje seznam i vizuálně.

### Maintenance tikety (`src/components/maintenance/TicketDetailModal.vue`)
Přijímá prop `properties: Array` — seznam nemovitostí pro dropdown při tvorbě nového tiketu. Validace je inline (ne `alert()`), zobrazena jako červená zpráva v patičce modalu. Validuje: předmět, vybraná nemovitost, skutečná cena při stavu „hotovo".

### Adresní autocomplete
`useRuianAutocomplete` composable volá **Nominatim API** (OpenStreetMap) pro autocomplete českých adres — bez API klíče. Minimální délka dotazu: 3 znaky.

### GenericListView
Univerzální view pro jednoduché tabulkové stránky (Dodavatelé, Historie oprav, Platby, Faktury, Náklady, Notifikace, Šablony). Data a konfigurace se předávají přes `props` přímo v `router/index.js` — bez samostatných vue souborů.

## Navigační struktura (Sidebar)
- **Dashboard** `/`
- **Nemovitosti** → Přehled, Jednotky, Nová, Mapa, Import/Export
- **Adresář** (nájemci) → Přehled, Nový nájemce
- **Údržba** → Kanban, Nový požadavek, Kalendář, Dodavatelé, Historie
- **Finance** → Přehled, Platby, Faktury, Náklady, Rozpočet, Dlužníci
- **Nastavení** → Profil, Notifikace, Šablony, Systém

## Stylování — pravidla konzistence
- **Tailwind CSS v4** — používat pro layouty stránek a panelů
- **Inline styles** — přijatelné v komponentách, kde jsou komplexní dynamické styly
- **`src/assets/main.css`** — globální utility (`.loading-spinner`, `.error-banner`, animace)
- **Material Icons** — používat konzistentně pro navigaci a akce (`<span class="material-icons">`)
- **Lucide Vue Next** — používat pro specifické ikonky v komponentách (import z `lucide-vue-next`)
- **Primární barva: `#2563eb`** (blue-600) — platí pro sidebar, tlačítka, akcenty
- **Save/confirm barva: `#00C853`** (zelená) — záměrně odlišná od navigační modré
- Pozadí: `#f8fafc`, font: Inter (Google Fonts, preconnect v `index.html`)

## Co neměnit bez výslovného souhlasu
- Mock data v `src/mock/` — slouží pro prezentaci klientovi, jsou záměrně česká a realistická
- GPS souřadnice v `src/mock/properties.js` (`lat`/`lng`) — ručně ověřené hodnoty
- `VITE_USE_MOCK=true` v `.env.production` — dokud není backend
- `GenericListView` pattern v routeru — záměrné zjednodušení pro prototyp

## Env proměnné
```
VITE_API_BASE_URL=   # URL backendu (zatím nepoužíváno)
VITE_API_TIMEOUT=    # timeout v ms (default 10000)
VITE_USE_MOCK=       # true = mock data, false = real API
VITE_DEBUG=          # true = console logging API volání
```
Žádné z těchto proměnných neobsahují tajná data — jsou to build-time konfigurace.

## Root-level artefakty (Antigravity scaffolding)
Tyto soubory v rootu projektu nejsou součástí Vite aplikace — jsou to pozůstatky z Antigravity generátoru:
- `antigravity-test.txt` — prázdný soubor
- `test` — jednořádkový textový soubor
- `preview.html` — standalone HTML prototyp (bez Vite)
- `js/vue.global.js` — Vue CDN stub pro preview.html

Nemazat bez konzultace (mohou být referenční materiál pro klienta), ale do buildu nevstupují.

## Vývoj
```bash
npm install      # nutné po prvním klonování (node_modules není v gitu)
npm run dev      # dev server na http://localhost:5173
npm run build    # produkční build do dist/
npm run preview  # preview buildu lokálně
```

## Deploy
Push na `main` → automatický deploy na Vercel (GitHub integrace).

Pro manuální deploy přes CLI:
```bash
# Vercel CLI je nainstalován bez sudo:
~/.npm-global/bin/vercel

# Při prvním použití v naklonované složce je nutné:
~/.npm-global/bin/vercel link    # propojí složku s Vercel projektem

~/.npm-global/bin/vercel deploy --yes        # preview
~/.npm-global/bin/vercel deploy --prod --yes # produkce (potvrdit!)
```
Poznámka: `.vercel/` není v gitu — proto je potřeba `vercel link` po každém čerstvém klonování.
