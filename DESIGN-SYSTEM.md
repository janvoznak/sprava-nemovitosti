# Design System — Správa nemovitostí

Tento dokument definuje kompletní vizuální jazyk a layoutové principy aplikace.
Slouží jako reference pro budoucí projekty se stejným designovým stylem.

---

## Přehled layoutu

Aplikace používá **dvoupanelový shell layout** s fixním bočním panelem a horizontální horní lištou.

```
┌─────────────┬──────────────────────────────────────────┐
│             │  TopHeader (64px výška)                  │
│   Sidebar   ├──────────────────────────────────────────┤
│   (260px)   │                                          │
│             │  Content Area (scroll)                   │
│             │                                          │
└─────────────┴──────────────────────────────────────────┘
```

### Struktura komponent
- **`Sidebar`** — levý fixní navigační panel, celá výška viewportu
- **`TopHeader`** — horní lišta s vyhledáváním a akcemi uživatele
- **`<router-view />`** — obsah stránky se scrolluje uvnitř content area

### CSS layout (App.vue)
```css
.layout-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}
```

---

## Barvy

### Primární paleta

| Název | Hex | Použití |
|-------|-----|---------|
| Primary | `#1565C0` | Sidebar pozadí, TopHeader pozadí |
| Primary Light | `#2563eb` | Akcenty, tlačítka, odkazy |
| Primary Lighter | `#3b82f6` | Gradient endpoint |

### Sémantické barvy

| Název | CSS proměnná | Hex | Použití |
|-------|-------------|-----|---------|
| Background | `--bg-color` | `#f8fafc` | Pozadí stránky, content area |
| Card Background | `--card-bg` | `#ffffff` | Pozadí karet a panelů |
| Text hlavní | `--text-main` | `#1e293b` | Primární text |
| Text vedlejší | `--text-muted` | `#64748b` | Popisky, breadcrumbs |
| Ohraničení | `--border-color` | `#e2e8f0` | Hranice karet, tabulek |
| Úspěch | `--success-color` | `#10b981` | Aktivní stav, zaplaceno |
| Nebezpečí | `--danger-color` | `#ef4444` | Chyby, smazání, dluh |
| Uložit / Potvrdit | `--save-color` | `#00C853` | Tlačítka Uložit, Potvrdit |
| Uložit hover | `--save-color-hover` | `#00B248` | Hover stav tlačítka Uložit |
| Sekundární | `--secondary-color` | `#64748b` | Vedlejší texty a ikony |

> **Designové pravidlo:** `#00C853` (zelená) je záměrně odlišná od navigační modré —
> označuje akce s trvalým efektem (uložení, potvrzení) a nesmí být zaměňována s primární barvou.

### Gradienty

```css
--accent-gradient:  linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
--success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
--warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--danger-gradient:  linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

### Barvy transparentních overlay (nad primární barvou `#1565C0`)

| Efekt | Hodnota |
|-------|---------|
| Nav hover | `rgba(255, 255, 255, 0.10)` |
| Nav expanded | `rgba(255, 255, 255, 0.15)` |
| Nav active | `rgba(255, 255, 255, 0.20)` |
| Submenu active | `rgba(255, 255, 255, 0.25)` |
| Search input bg | `rgba(255, 255, 255, 0.15)` |
| Search input focus | `rgba(255, 255, 255, 0.25)` |

---

## Typografie

### Font

**Open Sans** (Google Fonts) — jediný font celé aplikace.

```html
<!-- index.html — import fontu -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* CSS proměnná */
--font-family: 'Open Sans', system-ui, -apple-system, sans-serif;

/* body */
font-family: 'Open Sans', sans-serif;
```

### Typografická stupnice

| Role | Font | Weight | Size | Line-height | Barva |
|------|------|--------|------|-------------|-------|
| Sidebar navigace | Open Sans | 600 | 14px | 20px | `#FFFFFF` |
| Sidebar submenu | Open Sans | 500 | 15px (0.9375rem) | — | `rgba(255,255,255,0.85)` |
| Sidebar submenu aktivní | Open Sans | 600 | 15px | — | `#FFFFFF` |
| TopHeader search (input + placeholder) | Open Sans | 400 | 14px | 20px | `#FFFFFF` (placeholder opacity 0.7) |
| Nadpis stránky (h1) | Open Sans | 700 | 1.875rem | — | `--text-main` |
| Breadcrumbs | Open Sans | 400 | 0.875rem | — | `--text-muted` |
| Tabulka — záhlaví | Open Sans | 600 | 0.75rem | — | `--text-muted` (uppercase) |
| Tabulka — buňky | Open Sans | 400 | — | — | `--text-main` |
| Název nemovitosti | Open Sans | 600 | — | — | `--text-main` |
| Vedlejší popis | Open Sans | 400 | 0.8125rem | — | `--text-muted` |

---

## Boční panel (Sidebar)

### Specifikace

```css
.sidebar {
  width: 260px;
  background: #1565C0;
  color: #FFFFFF;
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}
```

### Logo oblast
- Výška loga: `56px`, `object-fit: contain`
- Margin pod logem: `2.5rem`

### Navigační položky

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}
```

| Stav | Background | Barva textu | Font weight |
|------|-----------|-------------|-------------|
| Výchozí | průhledné | `rgba(255,255,255,0.9)` | 500 |
| Hover | `rgba(255,255,255,0.10)` | `#FFFFFF` | 500 |
| Expanded | `rgba(255,255,255,0.15)` | `#FFFFFF` | 500 |
| Active | `rgba(255,255,255,0.20)` | `#FFFFFF` | 600 |

### Ikony v navigaci
- Sada: **Material Icons** (Google Fonts CDN)
- Velikost: `1.5rem` (24px)
- Opacity: `0.9`
- Šipka (chevron): `1.25rem`, opacity `0.6`, animace rotate 180° při rozbalení

### Submenu

```css
.submenu-item {
  display: block;
  padding: 0.75rem 1.25rem 0.75rem 3.5rem;  /* odsazení pod ikonou rodiče */
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  margin: 2px 0.5rem;
  transition: all 0.2s ease;
}
```

- Chování: **accordion** — otevírá se vždy pouze jedna sekce
- Animace přechodu: `opacity` + `max-height` (0 → 300px), duration `0.3s ease`

---

## Horní lišta (TopHeader)

### Specifikace

```css
.top-header {
  height: 64px;
  background: #1565C0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}
```

### Vyhledávací pole

Šířka: `400px`, umístěno na střed lišty.

```css
.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;  /* místo pro ikonu vlevo */
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid transparent;
  border-radius: 6px;
  color: #FFFFFF;
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #FFFFFF;
  opacity: 0.7;
  /* stejná typografie jako input */
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: #00C853;
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.2);
}
```

- Placeholder text: **„Rychlé hledání v softwaru"**
- Ikona vyhledávání: Material Icons `search`, absolutně pozicovaná vlevo (`left: 12px`), barva `rgba(255,255,255,0.7)`

### Akční tlačítka (pravá část lišty)

```css
.action-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
```

- Notifikační badge (červený): `#ef4444`, výška `18px`, border-radius `9px`, okraj `2px solid #1565C0`
- Task badge (modrý): `#2563eb`

### Uživatelský profil
- Avatar: `36x36px`, `border-radius: 50%`, okraj `2px solid rgba(255,255,255,0.2)`
- Jméno: `font-weight: 500`, `font-size: 0.9rem`
- Oddělen od akcí svislou čárou: `border-left: 1px solid rgba(255,255,255,0.2)`

---

## Karty a panely

### Standardní karta

```css
.premium-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

.premium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}
```

### Skleněný efekt (glass morphism)

```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
}
```

### Stíny

```css
--shadow-premium: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
--shadow-inner:   inset 0 2px 4px 0 rgba(0,0,0,0.06);
```

---

## Tabulky

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.data-table th {
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}
```

---

## Ikony

Projekt používá **dvě sady ikon** pro různé účely:

| Sada | Import | Použití |
|------|--------|---------|
| **Material Icons** | Google Fonts CDN (`<link>` v `index.html`) | Navigace v Sidebar, akce v TopHeader, obecné UI ikony — `<span class="material-icons">název</span>` |
| **Lucide Vue Next** | npm balíček (`lucide-vue-next`) | Specifické ikonky uvnitř komponent — importovat jednotlivě |

```html
<!-- Material Icons (index.html) -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

```js
// Lucide (v komponentě)
import { ChevronRight, AlertCircle } from 'lucide-vue-next'
```

---

## Animace

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scale in (s přesahem — spring effect) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.animate-fade      { animation: fadeIn   0.5s ease-out; }
.animate-slide-up  { animation: slideUp  0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-scale-in  { animation: scaleIn  0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
```

- Hover na kartách: `cubic-bezier(0.34, 1.56, 0.64, 1)` — spring efekt s mírným přesahem
- Přechody tlačítek a navigace: `0.2s ease`
- Submenu accordion: `0.3s ease` na `opacity` + `max-height`

---

## Scrollbar

Vlastní styl pro prémiový vzhled:

```css
::-webkit-scrollbar       { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```

---

## Border radius — přehled

| Kontext | Hodnota |
|---------|---------|
| Karty (premium) | `16px` (`--radius-premium`) |
| Nav položky | `10px` |
| Submenu položky | `8px` |
| Akční tlačítka v headeru | `8px` |
| Vyhledávací pole | `6px` |
| Tabulky | `0.5rem` (8px) |
| Obrázky nemovitostí | `0.375rem` (6px) |
| Akční tlačítka v tabulce | `0.25rem` (4px) |

---

## CSS proměnné — kompletní přehled

```css
:root {
  /* Barvy */
  --primary-color:      #2563eb;
  --secondary-color:    #64748b;
  --bg-color:           #f8fafc;
  --card-bg:            #ffffff;
  --text-main:          #1e293b;
  --text-muted:         #64748b;
  --border-color:       #e2e8f0;
  --success-color:      #10b981;
  --danger-color:       #ef4444;
  --save-color:         #00C853;
  --save-color-hover:   #00B248;

  /* Font */
  --font-family: 'Open Sans', system-ui, -apple-system, sans-serif;

  /* Glass morphism */
  --glass-bg:     rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.4);

  /* Stíny */
  --shadow-premium: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
  --shadow-inner:   inset 0 2px 4px 0 rgba(0,0,0,0.06);

  /* Ostatní */
  --radius-premium: 16px;

  /* Gradienty */
  --accent-gradient:  linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --danger-gradient:  linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

---

## Technický stack

| Vrstva | Technologie |
|--------|------------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite 5 |
| Routing | Vue Router 5 |
| CSS | Tailwind CSS v4 + globální `main.css` + scoped styly v komponentách |
| Ikony | Material Icons (CDN) + Lucide Vue Next (npm) |
| Font | Open Sans (Google Fonts CDN) |
| Mapa | Leaflet 1.9 + `@vue-leaflet/vue-leaflet` |

---

## Zásady použití

1. **Jeden font** — výhradně Open Sans, žádný jiný font se nepřidává.
2. **Dvě modré** — `#1565C0` pro shell (sidebar + header), `#2563eb` pro interaktivní prvky uvnitř obsahu. Nezaměňovat.
3. **Zelená jen pro uložení** — `#00C853` je vyhrazena pro akce s trvalým efektem (Uložit, Potvrdit). Nepoužívat pro navigaci ani dekoraci.
4. **Ikony konzistentně** — Material Icons pro navigaci a akce, Lucide pro obsahové komponenty.
5. **Mobilní responzivita** — aplikace je aktuálně desktop-only (min. šířka ~1200px). Mobilní layout není implementován.
