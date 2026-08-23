# LaporPohon — Design System Reference

This document is a technical design system reference for the **LaporPohon** project, extracted strictly from existing code in `web/src/components/landing/`, `web/src/app/`, `web/tailwind.config.ts`, and `web/package.json`.

---

## 1. Color Palette

All colors used across landing page components grouped by their role.

### Primary (Brand Dark)
- `#19382B` | `bg-[#19382B]`, `hover:bg-[#19382B]`, `text-[#19382B]`, `border-[#19382B]`
  - Navbar brand icon background, primary CTA buttons, StatsSection container background, StakeholdersSection card hover background, FeaturesSection dark premium card background, FeaturesSection AI Engine icon text, TeamSection background radial grid dots & member name text, `_tokens.ts` (`CARD_DARK`, `BTN_PRIMARY`).
- `#0b3d2c` | `bg-[#0b3d2c]`, `hover:bg-[#07291d]`, `text-[#0b3d2c]`, `border-[#0b3d2c]`, `selection:bg-[#0b3d2c]`
  - HeroSection headline accent ("kota aman."), HeroSection arrow button background, QuoteHighlightSection stakeholder 2 card background & link hover text, StakeholdersSection icon text, Footer floating CTA banner background/text & button background, Footer logo icon background.
- `#234A39` | `hover:bg-[#234A39]`
  - Hover state for `#19382B` primary buttons in Navbar and `_tokens.ts`.
- `#07291d` | `hover:bg-[#07291d]`
  - Hover state for `#0b3d2c` dark buttons in HeroSection and Footer CTA.
- `#3E6B54` | `[radial-gradient(#3E6B54_1px,transparent_1px)]`
  - Background radial grid accent lines inside StatsSection dark container.

### Accent (Lime Green)
- `#88d937` | `bg-[#88d937]`, `hover:bg-[#88d937]`, `text-[#88d937]`, `selection:bg-[#88d937]`
  - `page.tsx` text selection highlight, HeroSection sparkle & recycle icons, StatsSection real-time badge text, QuoteHighlightSection "Efisiensi AI" badge background, StakeholdersSection role pill hover background, FeaturesSection "Ekonomi Sirkular" tag text & recycle icon hover background, Footer active indicator dot, `_tokens.ts` (`BTN_LIME`).
- `#78c92a` | `hover:bg-[#78c92a]`
  - Hover state for `#88d937` lime green button token in `_tokens.ts`.

### Background
- `#ecefe6` | `bg-[#ecefe6]`, `hover:bg-[#ecefe6]`, `hover:bg-[#ecefe6]/50`
  - `page.tsx` root page wrapper background, Navbar active pill link background, QuoteHighlightSection manifesto badge & subtitle highlight background, WorkflowSection subtitle highlight background, StakeholdersSection section header badge & card hover background, FeaturesSection clean card background & AI Engine icon background & progress bar track, TeamSection section header badge & photo container background, `_tokens.ts` (`CARD_SURFACE`).
- `#f4f6f0` | `bg-[#f4f6f0]`
  - QuoteHighlightSection section background, QuoteHighlightSection stakeholder 1 icon background, Footer social media button background.
- `#f8f9f5` | `bg-[#f8f9f5]`
  - WorkflowSection section background, FeaturesSection AI Engine card container background, TeamSection section background, Footer floating CTA hero banner background.
- `#f4f5f0` | `bg-[#f4f5f0]`
  - HeroSection "01 Card" background.
- `#ffffff` (white) | `bg-white`
  - Navbar background, HeroSection background & bento cards, StatsSection card container & inner stat cards, QuoteHighlightSection card 1 background & card 3 icon background, WorkflowSection cards & scroll nav buttons, StakeholdersSection card background & icon background, FeaturesSection background & bento overlays & data widget background, TeamSection cards & floating role badges, Footer background & inner CTA elements.
- `gray-100` | `bg-gray-100`
  - HeroSection bento background containers, WorkflowSection card image container background.
- `gray-50` | `hover:bg-gray-50`
  - HeroSection button hover state, Footer CTA secondary button hover state.

### Surface / Card
- `bg-white` | `bg-white`
  - Standard card surface across Navbar, Hero, QuoteHighlight, Workflow, Stakeholders, Features, Team, Footer.
- `bg-white/10` | `bg-white/10`
  - StatsSection inner stat cards, QuoteHighlightSection stakeholder 2 icon background.
- `bg-white/20` | `bg-white/20`
  - HeroSection right card social button background, WorkflowSection pill tag background.
- `bg-white/40` | `bg-white/40`
  - Footer floating CTA background highlight blur overlay.
- `bg-white/80` | `bg-white/80`
  - WorkflowSection scroll navigation left/right buttons.
- `bg-white/90` | `bg-white/90`
  - HeroSection bento hashtag pill.
- `bg-white/95` | `bg-white/95`
  - TeamSection floating role badge background.
- `#19382B` | `bg-[#19382B]`
  - StatsSection main card container, FeaturesSection top right dark card, `_tokens.ts` (`CARD_DARK`).
- `#0b3d2c` | `bg-[#0b3d2c]`
  - QuoteHighlightSection stakeholder 2 card background.
- `#e3eed8` | `bg-[#e3eed8]`, `hover:bg-[#dce8d0]`
  - QuoteHighlightSection stakeholder 3 card background & hover state.

### Text
- `#111111` | `text-[#111111]`, `text-[#111111]/70`, `text-[#111111]/60`, `text-[#111111]/50`, `text-[#111111]/40`, `text-[#111111]/20`, `text-[#111111]/[0.05]`, `selection:text-[#111111]`
  - Primary text color for body paragraphs, section titles, navigation links, card text, subtitles, watermark (`text-[#111111]/[0.05]`), and step indices across all landing components.
- `#1a1a1a` | `text-[#1a1a1a]`, `text-[#1a1a1a]/60`, `text-[#1a1a1a]/50`, `text-[#1a1a1a]/40`
  - Headline text, hero paragraph, hero bento card headings, step number 01.
- `#ffffff` (white) | `text-white`, `text-white/90`, `text-white/80`, `text-white/70`, `text-white/5`
  - Primary button text, dark card headings, hero right card subtext, StatsSection white text, Features dark card subtext, background step numbers (`text-white/5`), Footer CTA text.
- `emerald-700` | `text-emerald-700`
  - StatsSection "Pohon Pengganti" icon color.
- `amber-700` | `text-amber-700`
  - StatsSection "Respon Cepat" icon color.

### Border / Divider
- `border-black/5` | `border-black/5`
  - Navbar link border, Hero bento containers & cards, StatsSection container border, QuoteHighlight card 1 border, Workflow card footer border, Stakeholders header border, Features bento card borders, Team card border, Footer card & section borders.
- `border-black/10` | `border-black/10`
  - QuoteHighlight card hover border, Stakeholders section dividers, Team badge border, Footer bottom legal bar border.
- `border-black/20` | `border-black/20`
  - QuoteHighlight link circle border, Features CTA button border, Stakeholders index number text (`text-black/20`).
- `border-white/10` / `border-white/15` / `border-white/20` / `border-white/30` | `border-white/*`
  - StatsSection stat card borders (`border-white/15`), QuoteHighlight card 2 borders (`border-white/10`, `border-white/20`), Features dark card tag & arrow button borders (`border-white/30`).
- `border-y border-[#111111]/10` | `border-[#111111]/10`
  - MarqueeBanner top/bottom border lines.

### Special Accent Colors
- `#C87443` | `text-[#C87443]`
  - Terracotta accent color used for StatsSection "Kayu Dimanfaatkan" barbell icon.
- `#DDD9FE` | `bg-[#DDD9FE]`
  - Soft purple pastel color used for MarqueeBanner background.
- `#e3f4d7` | `text-[#e3f4d7]`
  - Light pastel green text color used for Footer logo tree icon.

---

## 2. Typography

### Font Setup
- **Font Family**: Plus Jakarta Sans (`Plus_Jakarta_Sans` imported from `next/font/google` with CSS variable `--font-plus-jakarta`).
- **Tailwind Extension**: `fontFamily: { sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"] }` configured in `tailwind.config.ts`.
- **Serif Accent**: `font-serif` used for italic display phrases in HeroSection ("kota aman.") and Footer CTA banner ("di sekitarmu?").

### Type Scale

| Role | Class | Usage Example |
|---|---|---|
| Display / Hero | `text-3xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.15] sm:leading-[1.1]` | HeroSection main headline ("Satu foto: laporkan pohon...") |
| Display Accent | `text-3xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.15] sm:leading-[1.1] italic font-serif` | HeroSection italic highlight ("kota aman.") |
| Display Watermark | `text-[16vw] lg:text-[10vw] font-black tracking-tighter text-[#111111]/[0.05]` | Footer giant background watermark ("LAPORPOHON") |
| Display Index | `text-[10rem] font-black text-gray-50` / `text-white/5` / `text-white/40` | QuoteHighlightSection background step numbers (1, 2, 3) |
| Section Heading | `text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.3] sm:leading-[1.25]` | WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection, QuoteHighlightSection main h2 headings with inline highlight pills |
| Section Sub-heading | `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight` | StakeholdersSection interactive list item titles |
| Card Heading | `text-2xl sm:text-3xl font-bold` | HeroSection right card, FeaturesSection dark/clean cards, Footer CTA h3 title |
| Stat Display | `text-2xl sm:text-3xl font-extrabold tracking-tight` | StatsSection stat values ("1,240+", "18.5 Ton", "< 2 Jam", "2,480+") |
| Card Sub-heading | `text-xl sm:text-2xl font-bold` / `font-medium` | WorkflowSection step titles, FeaturesSection AI Engine card title |
| Brand Header | `text-[18px] font-semibold tracking-tight` / `text-xl font-bold` | Navbar brand title, Footer brand title |
| Card Title Medium | `text-[15px] font-bold` / `text-base font-bold` | HeroSection bento card titles ("Manfaat Utama Platform", "Foto & Laporkan Sekarang") |
| Number Display | `text-3xl font-medium` / `text-3xl sm:text-4xl` | HeroSection 01 card number, WorkflowSection step index number |
| Body / Paragraph | `text-xs sm:text-sm text-[#111111]/60 leading-relaxed` | Standard section header description paragraphs across all sections |
| Body Medium | `text-sm sm:text-base font-semibold` / `font-bold` | MarqueeBanner item text, Footer CTA paragraph |
| Body Small | `text-xs` / `text-[13px]` / `text-[12px] sm:text-[13px] max-w-[340px] sm:max-w-[440px]` | HeroSection subtitle (formatted in 2 clean lines), Features AI Engine body text, Stakeholders descriptions |
| Caption | `text-xs text-white/70` / `text-[12px] text-white/80` | StatsSection stat subtext, Hero right card subtitle |
| Caption Micro | `text-[10px] sm:text-[11px]` / `text-[9px]` | WorkflowSection step subtitle, Hero small card subtext |
| Name Subtitle | `text-[7.5px] sm:text-[9px]` | TeamSection member badge initial subtitle |
| Eyebrow / Badge | `text-[11px] font-bold uppercase tracking-widest` | Section header pill badges in QuoteHighlight, Workflow, Stakeholders, Features, Team, Footer columns |
| Label Micro | `text-[10px] font-bold uppercase tracking-widest` / `tracking-wider` | StatsSection "Data Real-time", Hero bento badge, Stakeholders role pills, Workflow pills, Features borderless Storefront UMKM badge (`flex items-center gap-2.5`, icon circle `bg-white/10`, Storefront duotone icon, soft text `text-[#ecefe6]`) |
| Hashtag Tag | `text-[8px] font-bold` | HeroSection bento card `#Sirkular` pill |

---

## 3. Spacing & Layout

### Container Max-Widths
- `max-w-[1300px]` — Primary standard layout container width used in Navbar, HeroSection, StatsSection, QuoteHighlightSection, WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection, and Footer.
- `max-w-[1400px]` — Layout wrapper token defined in `_tokens.ts` (`SECTION_WRAPPER`: `"max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"`).
- `max-w-2xl` — Section header text container width in WorkflowSection, StakeholdersSection, FeaturesSection.
- `max-w-md` — Section header description paragraph width across QuoteHighlightSection, WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection, Footer CTA.
- `max-w-sm` / `max-w-[280px]` / `max-w-[200px]` — Constrained body paragraphs in HeroSection, Stakeholders list items, Features cards, Footer brand column.
- `max-w-xl` — Footer floating CTA banner text width.

### Standard Section Vertical Padding (`py-*`)
- `py-8 sm:py-12` — HeroSection section padding.
- `py-12` — StatsSection outer padding (`py-12`) and inner container padding (`py-12 px-6 sm:px-10 lg:px-12`); MarqueeBanner vertical padding (`py-4 my-12`).
- `py-16 sm:py-24` — WorkflowSection, FeaturesSection, TeamSection section padding.
- `py-20 sm:py-32` — QuoteHighlightSection, StakeholdersSection section padding.
- `pt-6 pb-2` — Navbar top navigation padding.
- `pt-12 pb-8` — Footer section padding.

### Standard Horizontal Padding (`px-*`)
- `px-4 sm:px-8 lg:px-12` — Primary standard responsive horizontal container padding used in Navbar, HeroSection, StatsSection, QuoteHighlightSection, StakeholdersSection, FeaturesSection, TeamSection.
- `px-4 sm:px-6 lg:px-8` — Footer container padding and `_tokens.ts` (`SECTION_WRAPPER`).
- `px-8 sm:px-12 lg:px-16` — Footer floating hero CTA banner internal padding.

### Grid Systems & Layout Architectures
- **Grid Systems**:
  - `grid-cols-1 sm:grid-cols-2` — HeroSection left bento grid layout.
  - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — StatsSection 4-column metric card grid.
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-12` — Footer 12-column navigation grid (`lg:col-span-5` brand info, `lg:col-span-2` platform links, `lg:col-span-2` services links, `lg:col-span-3` team info).
- **Asymmetrical & Interactive Layouts**:
  - **Hero Bento**: 70% left flex column (`flex-1 flex flex-col gap-5 sm:gap-6`) + right fixed card (`lg:w-[320px] xl:w-[340px]`).
  - **QuoteHighlight Sticky Split**: 5/12 left sticky manifesto (`lg:sticky lg:top-32 lg:w-5/12`) + 7/12 right cascading stakeholder list (`lg:w-7/12`).
  - **Workflow Carousel**: Horizontal snap carousel (`flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 lg:gap-10`).
  - **Stakeholders Interactive List**: Stacked list rows (`flex flex-col`) with hover expand horizontal padding (`sm:hover:px-8`).
  - **Features Asymmetrical Split**: 40% left tall AI card (`lg:w-[40%] min-h-[480px] lg:min-h-[640px]`) + 60% right stacked horizontal cards (`lg:w-[60%]`).
  - **Team Overlapping Fan Stack**: Centered flex stack (`flex items-end justify-center gap-0`) with negative margins (`-mx-2.5 sm:-mx-4 md:-mx-5`), rotational transforms (`-rotate-6`, `rotate-0`, `rotate-6`), and hover pop-out animations.

### Gap Scale
- `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-12`, `gap-16`, `gap-24`.

---

## 4. Border Radius

Every `rounded-*` class string found in the codebase and its usage:

- `rounded-full`
  - **Buttons**: Navbar CTAs, Hero arrow buttons, Features CTA buttons, Footer CTA buttons, `_tokens.ts` (`BTN_PRIMARY`, `BTN_LIME`).
  - **Badges & Pills**: Navbar pill links, section header badges, Stakeholders role pills, Workflow pill tags, Features tags, Footer badges, Hero inline image pill, `_tokens.ts` (`PILL_BADGE`).
  - **Icon Containers**: Navbar brand tree icon, Hero social buttons, QuoteHighlight icon circles, Stakeholders icon circles, Features icon circles, Footer tree icon & social icons.
  - **Indicators**: Workflow carousel pagination dots, Features replay progress bar.
- `rounded-[2.5rem]`
  - HeroSection bento background container, Footer floating hero CTA banner.
- `rounded-[2rem]` / `rounded-2xl`
  - **`rounded-[2rem]`**: StatsSection dark container, QuoteHighlightSection cards 1/2/3, WorkflowSection carousel card (`rounded-[1.5rem] sm:rounded-[2rem]`).
  - **`rounded-2xl`**: StatsSection stat cards, FeaturesSection bento cards & widget, TeamSection member cards & photo containers, `_tokens.ts` (`CARD_BASE`, `CARD_DARK`, `CARD_SURFACE`).
- `rounded-[1.75rem]`
  - HeroSection white main bento card ("Manfaat Utama Platform"), HeroSection 01 card ("Cara Mudah").
- `rounded-[1.5rem]`
  - HeroSection vertical image card ("Limbah Kayu ke UMKM"), WorkflowSection mobile carousel cards.
- `rounded-xl`
  - StatsSection icon containers.

---

## 5. Shadows

Every `shadow-*` class found in the codebase and its usage evaluation:

- `shadow-sm`
  - **Appears in**: Navbar brand icon & CTAs, Hero bento background container & white bento card & hashtag pill & right card social buttons, StatsSection dark container & icon boxes, Stakeholders icon circles & role pills, Features bento cards & AI engine inner card & widget, Team member cards & floating role badges, Footer floating CTA banner & tree logo icon & secondary CTA button.
  - **Evaluation**: **Keep**. Core subtle shadow primitive aligned with LaporPohon's clean minimalist aesthetic.
- `shadow-md`
  - **Appears in**: HeroSection main white bento card & right tall vertical card, Footer primary CTA button hover state (`shadow-md hover:shadow-xl`).
  - **Evaluation**: **Keep**. Appropriate for elevated floating cards and hover interaction feedback.
- `shadow-inner`
  - **Appears in**: HeroSection inline headline image pill container (`shadow-inner`).
  - **Evaluation**: **Keep**. Provides inset depth for media embedded inside inline typography.
- `shadow-xl`
  - **Appears in**: WorkflowSection scroll navigation left/right buttons, Footer primary CTA button hover state (`hover:shadow-xl`).
  - **Evaluation**: **Keep**. Used exclusively for interactive elevated floating navigation buttons.
- `shadow-2xl`
  - **Evaluation**: **Removed**. `shadow-2xl` on WorkflowSection carousel cards was removed in favor of natural `shadow-sm border border-black/5` with hover elevation (`hover:shadow-md`), creating a clean, soft, organic card surface without dark artificial drop shadows.

---

## 6. Component Tokens

Repeated class string patterns and named tokens documented in code:

| Token Name | Tailwind Classes | Used In |
|---|---|---|
| `SECTION_WRAPPER` | `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8` | `_tokens.ts` (Standard layout container wrapper) |
| `CARD_BASE` | `bg-white rounded-2xl border border-black/5` | `_tokens.ts`, HeroSection bento cards, FeaturesSection data widget |
| `CARD_DARK` | `bg-[#19382B] rounded-2xl text-white` | `_tokens.ts`, StatsSection container, FeaturesSection top right card |
| `CARD_SURFACE` | `bg-[#ecefe6] rounded-2xl` | `_tokens.ts`, FeaturesSection clean bottom right card |
| `PILL_BADGE` | `text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full` | `_tokens.ts`, Navbar, section headers |
| `BTN_PRIMARY` | `bg-[#19382B] text-white font-bold rounded-full px-5 py-2.5 hover:bg-[#234A39] transition-all text-xs` | `_tokens.ts`, Navbar CTAs, Hero buttons, Features buttons |
| `BTN_LIME` | `bg-[#88d937] text-[#111111] font-bold rounded-full px-5 py-2.5 hover:bg-[#78c92a] transition-all text-xs` | `_tokens.ts` (Pre-defined lime accent button token) |
| `SECTION_HEADER_BADGE` | `text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block` | QuoteHighlightSection, WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection |
| `SECTION_HEADER_TITLE` | `text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.1]` | QuoteHighlightSection, WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection, Footer CTA |
| `SECTION_HEADER_SUBTITLE` | `text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed` | QuoteHighlightSection, WorkflowSection, StakeholdersSection, FeaturesSection, TeamSection |

---

## 7. Animation

Framer Motion patterns, properties, and CSS micro-animations used across landing components:

### Entry Animations (`initial`, `animate`, `whileInView`)
- **Hero Headline**: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}`
- **Hero Bento Left Grid**: `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 / 0.2 }}`
- **Hero Right Card**: `initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}`
- **Marquee Infinite Scroll**: `animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 25 }}`
- **Stats Cards**: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}`
- **QuoteHighlight Cards**: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: 0 / 0.1 / 0.2 }}`
- **Workflow Header**: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}`
- **Workflow Cards**: `initial={{ opacity: 0.3, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ root: scrollContainerRef, margin: "0% -35% 0% -35%", amount: "some" }} transition={{ duration: 0.4, ease: "easeOut" }}`
- **Stakeholders List**: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1 }}`
- **Features Header & AI Engine Card**: `initial={{ opacity: 0, y: 20 / 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }}`
- **Features Right Cards**: `initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, delay: 0.2 / 0.3 }}`
- **Team Header**: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }}`
- **Team Overlapping Cards**: `initial={{ opacity: 0, y: 40, rotate: index === 0 ? -8 : index === 2 ? 8 : 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}`
- **Team Member Names Row**: `initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}`

### Hover Animations (`whileHover` and CSS `group-hover`)
- **Team Member Cards**: `whileHover={{ scale: 1.06, rotate: 0, zIndex: 50, y: -8 }}`
- **CSS Scale Transforms**: `hover:scale-105`, `hover:scale-110`, `group-hover:scale-105`, `group-hover:scale-110`, `group-hover:scale-150` (Footer blur).
- **CSS Rotation & Translation Transforms**: `group-hover:rotate-6`, `group-hover:rotate-0` (Recycle icon), `group-hover:translate-x-0` (Arrow icon), `hover:-translate-y-1` (Footer CTA button).

### Transition Settings
- **Durations**: `0.3s`, `0.4s`, `0.5s`, `0.6s`, `0.7s`, `0.8s`, `25s` (marquee loop).
- **Delays**: `0.1s`, `0.15s`, `0.2s`, `0.3s`, `0.4s`, `index * 0.1s`, `index * 0.15s`.
- **Easings**: `"easeOut"`, `"linear"`.
- **Viewport Options**: `once: true`, `margin: "-50px"`, `margin: "-100px"`, `root: scrollContainerRef`.

---

## 8. Icon Library

### Setup & Package Metadata
- **Package Name**: `@phosphor-icons/react`
- **Version**: `^2.1.10` (from `package.json`)

### Icon Weights Used
- `regular` — Navbar center navigation links (`weight="regular"`), FeaturesSection Scan icon (`weight="regular"`).
- `bold` — Navbar CTAs (`weight="bold"`), HeroSection arrow buttons (`weight="bold"`), Instagram icon (`weight="bold"`), QuoteHighlight arrow (`weight="bold"`), Workflow nav buttons (`weight="bold"`), Stakeholders arrow (`weight="bold"`), Features CTA arrows (`weight="bold"`), Footer CTA arrow & social icons (`weight="bold"`).
- `fill` — Navbar tree icon (`weight="fill"`), Hero Sparkle & Recycle icons (`weight="fill"`), Twitter & Facebook logos (`weight="fill"`), StatsSection icons (`weight="fill"`), Features Recycle & Tree icons (`weight="fill"`), Footer tree icon (`weight="fill"`).
- `duotone` — QuoteHighlight & Stakeholders User, Buildings, Storefront icons (`weight="duotone"`), StatsSection Leaf icon (`weight="duotone"`), Features Leaf icon (`weight="duotone"`).

### Complete List of Active Icons

| Icon Name | Weight | Component Usage |
|---|---|---|
| `Tree` | fill | Navbar, HeroSection, StatsSection, FeaturesSection, Footer |
| `House` | regular | Navbar |
| `Leaf` | regular / fill / duotone | Navbar, FeaturesSection |
| `GearSix` | regular | Navbar |
| `Users` | regular | Navbar |
| `SignIn` | bold | Navbar |
| `Layout` | bold | Navbar |
| `ArrowRight` | bold | HeroSection, QuoteHighlightSection, WorkflowSection |
| `ArrowLeft` | bold | WorkflowSection |
| `ArrowUpRight` | bold | StakeholdersSection, FeaturesSection, Footer |
| `ArrowsLeftRight` | bold | HeroSection |
| `ArrowsClockwise` | regular | MarqueeBanner |
| `Sparkle` | fill | HeroSection |
| `Recycle` | fill | HeroSection, FeaturesSection |
| `TwitterLogo` | fill | HeroSection |
| `FacebookLogo` | fill | HeroSection |
| `InstagramLogo` | bold | HeroSection, Footer |
| `GithubLogo` | bold | Footer |
| `LinkedinLogo` | bold | Footer |
| `User` | duotone | QuoteHighlightSection, StakeholdersSection |
| `Buildings` | duotone | QuoteHighlightSection, StakeholdersSection |
| `Storefront` | duotone | QuoteHighlightSection, StakeholdersSection |
| `Barbell` | fill | StatsSection |
| `Lightning` | fill | StatsSection |
| `Plant` | fill | StatsSection |
| `Scan` | regular | FeaturesSection |
| `X` | regular | HeroSection (import) |

---

## 9. Image Strategy

### Image Sources & Asset URLs
All image assets in landing components are fetched from **Unsplash CDN** (`https://images.unsplash.com/photo-...`) with explicit query parameters (`?q=80&w=...&auto=format&fit=crop`):
- `photo-1542273917363-3b1817f69a2d` — Green tree forest / Pohon Hijau (Hero inline image, Hero bento background, Hero vertical card background, Workflow step 1 image, Features AI engine background).
- `photo-1518531933037-91b2f5f229cc` — Green foliage / leaf texture (Hero bento thumb images, Workflow step 2 image).
- `photo-1448375240586-882707db888b` — Forest canopy (Hero right tall card, Workflow step 3 image).
- `photo-1513836279014-a89f7a76ae86` — Wood log texture / nature (Workflow step 4 image).
- `photo-1534528741775-53994a69daeb` — Female portrait (Team member Mayang photo).
- `photo-1507003211169-0a1dd7228f2d` — Male portrait (Team member Sultan photo).
- `photo-1500648767791-00dcc994a43e` — Male portrait (Team member Sahrul photo).

### Element Usage & Tag Types
- Standard HTML `<img>` tags are used across all landing components (`HeroSection`, `WorkflowSection`, `TeamSection`).
- Next.js `<Image />` component from `next/image` is **not used** in the landing page components.
- CSS background images (`backgroundImage: url(...)`) combined with `bg-cover bg-center` are used for absolute background cards (Hero bento background, Hero right vertical card, Workflow carousel cards, Features AI Engine card).

### Alt Text Patterns
Explicit, descriptive Indonesian alt text strings are used on `<img>` elements:
- `alt="Pohon Hijau"`
- `alt="Thumb"`
- `alt="Mayang Putri Mutiara"`
- `alt="Sultan Abdul Fatah"`
- `alt="Sahrul Solihin"`

### Object-Fit & Object-Position
- `object-cover` — Universal rule applied to all standard images (`w-full h-full object-cover`).
- `object-top` — Applied specifically to team portrait headshots in `TeamSection` (`object-cover object-top`) to preserve proper head framing.

---

## 10. Responsive Breakpoints

Tailwind CSS breakpoints present in the codebase: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).

### Responsive Layout Strategy

#### Mobile (< 768px / md)
- **Navbar**: Desktop pill menu links and right CTA buttons hidden (`hidden md:flex`). On mobile screens (< 768px), the right action area renders a 3-line dark green circular hamburger toggle button (`w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center`). Tapping the toggle opens a smooth animated mobile menu drawer (`bg-[#ecefe6]/95 backdrop-blur-xl border border-black/10 rounded-3xl p-4`) containing all 5 section links and dynamic action buttons (**Masuk**, **Daftar**, or **Dashboard Saya**).
- **HeroSection**: Main headline displays at `text-3xl`, text paragraph stacked below title (`flex-col-reverse lg:flex-row`), bento grid single column (`grid-cols-1`) with explicit 3-step mobile ordering (`order-1` for "01 - Foto & Laporkan Sekarang" at the top, `order-2` for "Manfaat Utama Platform" in the middle, `order-3` for "Limbah Kayu ke UMKM" at the bottom), right vertical card fixed height `h-[500px]`.
- **WorkflowSection**: Carousel card width `w-[85vw]`, scroll navigation buttons hidden (`hidden sm:flex`), drag/scroll enabled.
- **StakeholdersSection**: Section header stacked vertically, list items rendered as flat full-width rows with bottom border separators (`border-b border-black/10`) and internal text padding (`px-4 sm:px-6 md:px-8`) with compact scaled fonts (`text-base font-bold` titles) and dynamic light text contrast (`group-hover:text-white/70`) for dark background hover items.
- **FeaturesSection**: Section header stacked vertically, bento cards stacked vertically (`flex-col lg:flex-row`), AI card height `min-h-[480px]`.
- **TeamSection**: Team photo cards stack vertically on mobile (`flex-col items-center gap-8`) with large clean cards (`w-[220px] h-[280px]`) and centered role/name badges (`-top-4 left-1/2 -translate-x-1/2`).
- **Footer**: Hero CTA banner stacked vertically (`flex-col md:flex-row`), navigation menu rendered as a compact 3-column grid on mobile (`grid grid-cols-3 gap-2`) with scaled font sizes (`text-[10px]` headers, `text-[11px]` links), background watermark text scaled down (`text-[9vw]`), legal bottom bar stacked vertically (`flex-col sm:flex-row`).

#### Tablet (sm: 640px - 768px / md: 768px - 1024px)
- Headlines scale up to `sm:text-4xl`.
- Hero bento grid converts to 2 columns (`sm:grid-cols-2`).
- Workflow carousel cards scale to `sm:w-[320px]`, scroll navigation buttons reveal on container hover (`sm:flex`).
- Team cards expand to `sm:w-[190px] sm:h-[260px]` with `-mx-4` overlap, member names row displays horizontally (`sm:flex-row`).
- Footer CTA banner converts to side-by-side flex layout (`md:flex-row`), footer navigation displays in 2 columns (`md:grid-cols-2`).

#### Desktop (md: 768px+ / lg: 1024px / xl: 1280px)
- **Navbar**: Full center pill navigation items (`hidden md:flex`) with smooth animated scrolling (`scrollToSection` helper with `-85px` floating header offset calculation) and right desktop CTA buttons (`hidden md:flex`) revealed. Mobile hamburger button hidden (`flex md:hidden`).
- **Headlines**: Scale to `lg:text-6xl` or `lg:text-5xl`.
- **HeroSection**: Original 3-line desktop headline preserved (`Satu foto: laporkan pohon,` -> `[Capsule Image]` + `cegah bahaya,` -> Paragraph left + `kota aman.` italic right), side-by-side asymmetrical layout (`lg:flex-row`, left ~70%, right fixed `lg:w-[320px] xl:w-[340px] lg:h-auto`).
- **QuoteHighlightSection**: Side-by-side sticky layout (`lg:flex-row`, sticky manifesto `lg:w-5/12`, cascading list `lg:w-7/12`).
- **WorkflowSection**: Carousel cards expand to `lg:w-[400px]`.
- **StakeholdersSection**: Full hover expand interactions enabled (`sm:hover:px-8`).
- **FeaturesSection**: 40% / 60% asymmetrical layout (`lg:w-[40%]` tall AI Engine card `lg:min-h-[640px]`, `lg:w-[60%]` stacked horizontal cards).
- **TeamSection**: Original fan-stacked overlapping cards preserved (`-rotate-6`, `rotate-0`, `rotate-6`, `-mx-4 md:-mx-5`, card size `sm:w-[190px] md:w-[230px] sm:h-[260px] md:h-[310px]`) with horizontal member names row.
- **Footer**: Navigation expands to 12-column grid (`lg:grid-cols-12`: `lg:col-span-5` brand info, `lg:col-span-2` platform links, `lg:col-span-2` services links, `lg:col-span-3` team info).

---

## 11. Section Index

Index of all landing page section components:

| Component File | Section ID | Description | Key Layout Pattern |
|---|---|---|---|
| `Navbar.tsx` | N/A | Sticky top floating light green pill navbar (`bg-[#ecefe6]/90`) with zero shadow, dark green brand icon circle (`bg-[#19382B]`), active section highlight pill (`bg-[#19382B]`), desktop CTA buttons, and mobile 3-line hamburger menu toggle (`md:hidden`). | Sticky top container (`sticky top-4 z-50 flex flex-col items-center`) with max-width floating pill wrapper `max-w-[960px] border border-black/10 backdrop-blur-md` and animated mobile menu drawer. |
| `HeroSection.tsx` | `#beranda` | Hero banner with 3-line headline & inline image pill, subtext paragraph, bento feature grid, 01 card, and right vertical image card with social links. | Asymmetrical flex layout (`flex flex-col lg:flex-row`) with internal 2-column bento grid (`grid-cols-1 sm:grid-cols-2`). |
| `MarqueeBanner.tsx` | N/A | Continuously scrolling horizontal banner highlighting 4 core platform capabilities with spinning sync icons. | Framer Motion infinite loop (`animate={{ x: ["0%", "-50%"] }}`) with `whitespace-nowrap` flex row. |
| `StatsSection.tsx` | N/A | Key impact metric banner displaying 4 real-time statistics (Laporan Terverifikasi, Kayu Dimanfaatkan, Respon Cepat, Pohon Pengganti). | Dark rounded container (`rounded-[2rem]`) with radial dot texture overlay and 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`). |
| `QuoteHighlightSection.tsx` | N/A | Sticky section displaying platform manifesto ("Solusi Pintar Kota Aman & Hijau") alongside 3 cascading stakeholder benefit cards. | 2-column flex layout (`flex flex-col lg:flex-row`) with sticky left sidebar (`lg:sticky lg:top-32 lg:w-5/12`) and cascading right column (`lg:w-7/12`). |
| `WorkflowSection.tsx` | `#alur` | Interactive 4-step workflow carousel detailing user journey (Foto & Kirim, Analisis AI, Tindakan Petugas, Daur Ulang UMKM) with navigation controls. | Horizontal snap scroll container (`flex overflow-x-auto snap-x snap-mandatory`) with Framer Motion scale & opacity transitions. |
| `StakeholdersSection.tsx` | `#ekosistem` | Ecosystem directory showcasing 3 key user groups (Masyarakat, Dinas Pertamanan, UMKM Perajin Kayu) with interactive hover expansions. | Vertical stacked list (`border-t border-black/10 flex flex-col`) with responsive flex items (`flex flex-col md:flex-row`) and hover expand padding (`sm:hover:px-8`). |
| `FeaturesSection.tsx` | `#fitur` | Asymmetrical showcase of 3 primary solution pillars: AI Hazard Engine, Circular Wood Economy, and Public Replant Transparency Audit. | Asymmetrical 40%/60% split (`flex flex-col lg:flex-row`) featuring a left tall organic card and right stacked horizontal dark & surface cards. |
| `TeamSection.tsx` | `#tim` | Developer team section featuring fan-stacked overlapping photo cards with floating role badges for 3 ITTS student developers. | Overlapping centered flex container (`flex items-end justify-center gap-0`) with negative margins, rotated card transforms, and hover pop-out animations. |
| `Footer.tsx` | N/A | Global footer featuring a floating hero CTA banner ("Temukan pohon berisiko di sekitarmu?"), giant watermark, brand column, 3 navigation link columns, and legal copyright bar. | Multi-layer stacked container with top hero CTA banner (`rounded-[2.5rem]`), giant absolute centered watermark, and 12-column footer grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-12`). |
| `(auth)/layout.tsx` | N/A | Soft light green page background (`bg-[#ecefe6]`) with back button, brand badge, compact header, Framer Motion entrance animation, and centered white overlay card (`max-w-[410px]`). | Compact light green container (`bg-[#ecefe6] max-w-[410px]`) with entrance animation (`initial={{ opacity: 0, y: -12 }}`) and white card overlay (`rounded-[1.75rem] sm:rounded-[2.25rem] bg-white shadow-xl`). |
| `login/page.tsx` | N/A | Compact authentication login page with pill tab switcher (`Masuk` / `Daftar`), full rounded pill icon inputs (`rounded-full`), password toggle, Framer Motion staggered animations, and primary green button (`#2d5341`). | Compact white card (`max-w-[410px]`) with staggered entrance animations (`motion.div delay`), top pill tab switcher (`bg-[#ecefe6]`), full rounded pill inputs (`rounded-full`), options row, and Google OAuth login button. |
| `register/page.tsx` | N/A | Compact authentication registration page featuring 4 full rounded pill icon inputs (`rounded-full`), live password validation checklist, and OTP verification step. | Compact white card (`max-w-[410px]`) with 1-column full rounded pill inputs (`rounded-full`), top pill tab switcher (`bg-[#ecefe6]`), live password validation checklist, and OTP verification form. |

---

## 12. Button Variants

Complete reference of every button and link variant found across the landing components:

| Variant Name | Class String | Usage Context | Target Route / Href |
|---|---|---|---|
| Navbar Mobile Hamburger Toggle | `flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-all` | Replaces "Daftar" button on mobile screens (< 768px) to toggle mobile menu drawer | N/A (interactive state toggle) |
| Navbar Dark Green CTA | `bg-[#19382B] hover:bg-[#234A39] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all` | Navbar right desktop pill CTA button (logged-out "Daftar" or logged-in "Dashboard") | `/register`, `/dashboard` |
| Navbar Text Link | `px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors text-[#111111]/70 hover:text-[#111111]` (Active: `bg-[#19382B] text-white font-semibold`) | Navbar center desktop menu items matching exact page order | `#beranda`, `#ekosistem`, `#alur`, `#fitur`, `#tim` |
| Navbar Text Link (Masuk) | `inline-flex items-center gap-1 text-[12px] font-semibold text-[#111111]/80 hover:text-[#19382B] px-3 py-1.5 transition-colors` | Navbar desktop login link | `/login` |
| Primary Dark Button | `bg-[#19382B] hover:bg-[#234A39] text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-[14px] font-semibold transition-colors shadow-sm flex items-center gap-2` | Primary dark green brand button | `/dashboard`, `/register` |
| Hero Action Arrow Circle | `w-7 h-7 rounded-full bg-[#0b3d2c] flex items-center justify-center text-white hover:bg-[#07291d] transition-all` | HeroSection "01 Card" primary action link button | `/dashboard` |
| Hero Toggle Circle | `w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-sm border border-black/5 hover:bg-gray-50` | HeroSection "01 Card" secondary swap/toggle button | N/A (interactive button element) |
| Glass Social Circle | `w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors shadow-sm` | HeroSection right vertical card social media links | `#` |
| Manifesto Link with Arrow Circle | `group inline-flex items-center gap-3 text-[13px] font-bold text-[#111111] uppercase tracking-widest hover:text-[#0b3d2c] transition-colors` with nested icon circle `w-10 h-10 rounded-full border border-black/20 flex items-center justify-center group-hover:bg-[#0b3d2c] group-hover:border-[#0b3d2c] group-hover:text-white transition-all` | QuoteHighlightSection manifesto CTA link ("Jelajahi Solusi Kami") | `#fitur` |
| Workflow Nav Button | `w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-white flex items-center justify-center text-[#111111] hover:bg-white hover:scale-110 transition-all hidden sm:flex opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed` | WorkflowSection carousel scroll left/right navigation buttons | N/A (scroll handler button) |
| Workflow Carousel Dot | Active: `h-2 rounded-full transition-all duration-300 w-8 bg-[#111111]` / Inactive: `w-2 bg-[#111111]/20 hover:bg-[#111111]/40` | WorkflowSection pagination dot navigation controls | N/A (slide scroll trigger) |
| Stakeholder Interactive Row | `group flex flex-col md:flex-row md:items-center justify-between py-10 sm:py-12 border-b border-black/10 transition-all duration-500 cursor-pointer sm:hover:px-8 hover:bg-[#ecefe6]` (or `hover:bg-[#19382B] hover:text-white`) with nested circle arrow `w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-white text-[#111111] sm:-translate-x-4 sm:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shrink-0` | StakeholdersSection interactive directory row items | `/lapor`, `/login`, `/register` |
| Feature Outline Pill | `inline-flex items-center gap-2 border border-black/20 rounded-full px-5 py-2 text-xs font-bold text-[#111111] hover:bg-[#19382B] hover:text-white transition-all` | FeaturesSection AI Engine card button ("Coba Lapor Sekarang") | `/lapor` |
| Feature Circle Arrow Button | `w-12 h-12 rounded-full border border-white/30 flex items-center justify-center shrink-0 group-hover:bg-[#88d937] group-hover:border-[#88d937] group-hover:text-[#111111] text-white transition-all` | FeaturesSection dark card top right link button | `#alur` |
| Footer Primary CTA Button | `w-full sm:w-auto text-center bg-[#0b3d2c] text-white hover:bg-[#07291d] font-bold px-8 py-4 rounded-full text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2` | Footer floating CTA hero banner primary button ("Laporkan Pohon") | `/lapor` |
| Footer Secondary CTA Button | `w-full sm:w-auto text-center bg-white text-[#0b3d2c] hover:bg-gray-50 border border-black/5 font-bold px-8 py-4 rounded-full text-sm transition-all shadow-sm` | Footer floating CTA hero banner secondary button ("Daftar Akun UMKM") | `/register` |
| Footer Social Circle | `w-9 h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5` | Footer brand column social links (GitHub, Instagram, LinkedIn) | `https://github.com`, `https://instagram.com`, `https://linkedin.com` |
| Footer Nav Text Link | `hover:text-[#0b3d2c] hover:font-bold transition-all` | Footer Platform and Layanan navigation links | `#beranda`, `#fitur`, `#alur`, `#ekosistem`, `/lapor`, `/login`, `/register` |
| ScrollToTop Floating Button | `fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] shadow-lg border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group` | Floating scroll-to-top button with smooth entrance animation (`scrollY > 300px`) | `window.scrollTo({ top: 0, behavior: "smooth" })` |
| Token Primary Dark Button | `bg-[#19382B] text-white font-bold rounded-full px-5 py-2.5 hover:bg-[#234A39] transition-all text-xs` | `_tokens.ts` (`BTN_PRIMARY`) | Pre-defined token class |
| Token Lime Accent Button | `bg-[#88d937] text-[#111111] font-bold rounded-full px-5 py-2.5 hover:bg-[#78c92a] transition-all text-xs` | `_tokens.ts` (`BTN_LIME`) | Pre-defined token class |
