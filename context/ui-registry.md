# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

- Path: `components/layout/Navbar.tsx`
- Classes:
  - Header: `border-b border-border bg-surface`
  - Inner: `mx-auto flex h-20 max-w-[1720px] items-center justify-between px-6 sm:px-10 lg:px-24`
  - Nav: `hidden items-center gap-12 text-[16px] font-medium leading-6 text-text-dark sm:flex`
  - CTA: `rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark`

### Hero

- Path: `components/homepage/Hero.tsx`
- Classes:
  - Section: `border-x border-b border-border`
  - Gradient panel: `landing-gradient border-b border-border px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - H1: `mx-auto max-w-[920px] text-[48px] font-bold leading-[1.08] tracking-normal text-text-black sm:text-[64px] lg:text-[78px]`
  - Copy: `mx-auto mt-8 max-w-[820px] text-[22px] font-normal leading-9 text-text-slate-medium`
  - Primary CTA: `min-w-[190px] rounded-md bg-overlay px-8 py-4 text-[20px] font-semibold leading-7 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark`
  - Secondary CTA: `min-w-[260px] rounded-md border border-border bg-surface/70 px-8 py-4 text-[20px] font-semibold leading-7 text-text-slate shadow-sm transition transform hover:-translate-y-0.5 hover:bg-surface`
  - Preview panel: `bg-surface-tertiary px-6 py-16 sm:px-10 lg:px-24`

### FeatureShowcase

- Path: `components/homepage/FeatureShowcase.tsx`
- Classes:
  - Section: `border-x border-border bg-surface`
  - Grid: `grid border-b border-border lg:grid-cols-2`
  - Text column: `border-r border-border px-6 py-16 sm:px-12 lg:px-24 lg:py-28`
  - Media column: `flex items-center bg-surface-muted px-6 py-14 sm:px-12 lg:px-10`
  - Heading: `max-w-[620px] text-[44px] font-bold leading-[1.1] tracking-normal text-text-slate sm:text-[56px] lg:text-[64px]`
  - Feature row: `border-b border-border py-9 pl-8 border-l-2 border-l-accent` or `border-b border-border py-9 pl-8 border-l-2 border-l-transparent`
  - Feature title: `text-[26px] font-bold leading-8 text-text-darker`
  - Feature copy: `mt-5 max-w-[760px] text-[24px] font-normal leading-10 text-text-slate-medium`
  - Divider: `section-hatch h-28 border-b border-border`

### Testimonial

- Path: `components/homepage/Testimonial.tsx`
- Classes:
  - Section: `border-x border-b border-border bg-surface px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - Eyebrow: `text-[18px] font-semibold uppercase leading-7 tracking-[0.16em] text-accent`
  - Quote: `mx-auto mt-8 max-w-[1120px] text-[34px] font-semibold leading-[1.35] tracking-normal text-text-darker sm:text-[44px] lg:text-[52px]`
  - Author: `mt-10 flex items-center justify-center gap-4`

### BottomCta

- Path: `components/homepage/BottomCta.tsx`
- Classes:
  - Section: `border-x border-b border-border`
  - Gradient panel: `landing-gradient px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - H2: `mx-auto max-w-[980px] text-[48px] font-bold leading-[1.12] tracking-normal text-text-black sm:text-[64px] lg:text-[76px]`
  - Copy: `mx-auto mt-8 max-w-[900px] text-[22px] font-normal leading-9 text-text-slate-medium`

### Footer

- Path: `components/layout/Footer.tsx`
- Classes:
  - Footer: `border-x border-border bg-surface`
  - Inner: `mx-auto flex min-h-44 max-w-[1720px] flex-col justify-between gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-16`
  - Nav: `flex flex-wrap items-center gap-8 text-[20px] font-normal leading-7 text-text-dark`
