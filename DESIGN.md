---
name: Todo List
description: A crisp, clinical instrument-panel system in cool blue-gray with one teal-blue signal accent.
colors:
  instrument-white: "oklch(1 0 0)"
  panel-ink: "oklch(0.148 0.004 228.8)"
  signal-blue: "oklch(0.52 0.105 223.128)"
  on-signal: "oklch(0.984 0.019 200.873)"
  quiet-gray: "oklch(0.967 0.001 286.375)"
  ink-quiet: "oklch(0.21 0.006 285.885)"
  gray-mute: "oklch(0.56 0.021 213.5)"
  hairline-gray: "oklch(0.925 0.005 214.3)"
  focus-ring-gray: "oklch(0.723 0.014 214.4)"
  alert-red: "oklch(0.577 0.245 27.325)"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: "calc(0.45rem - 6px)"
  sm: "calc(0.45rem - 4px)"
  md: "calc(0.45rem - 2px)"
  lg: "0.45rem"
  xl: "calc(0.45rem + 4px)"
spacing:
  label-gap: "0.375rem"
  field-gap: "1rem"
  page-top: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  button-secondary:
    backgroundColor: "{colors.quiet-gray}"
    textColor: "{colors.ink-quiet}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
  input:
    backgroundColor: "{colors.instrument-white}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
---

# Design System: Todo List

## Overview

**Creative North Star: "The Instrument Panel"**

A cool, restrained blue-gray field with exactly one signal color. Nothing competes with `signal-blue` for attention — it marks the one primary action or active state per view, the way a control panel reserves color for the indicator that actually matters. Everything else lives in near-white surfaces, hairline gray borders, and ink-toned text.

The register is clinical, not decorative: no gradients, no illustration, no warm tones. It reads as a precise working tool, not a lifestyle app. Components are crisp and no-nonsense — tight corners, hairline borders, minimal ornament — deliberately avoiding the soft-rounded, shadow-heavy default that most AI-generated UIs reach for.

**Key Characteristics:**
- One accent color (`signal-blue`), used sparingly and only for primary actions/active state
- Flat body content; only chrome (header/sidebar, once built) is meant to read as floating
- Hairline borders (`hairline-gray`) do the structural work that shadows would otherwise do
- Single typeface (Inter) across the whole system — no display/body pairing
- Full light/dark pair already defined; dark mode is a first-class invariant, not an afterthought

## Colors

Restrained color strategy: neutrals plus one accent. No true secondary/tertiary hue — `quiet-gray` and its relatives are toned-down neutrals, not a second brand color.

### Primary
- **Signal Blue** (`oklch(0.52 0.105 223.128)`): the one accent. Primary buttons, active links, focus intent. Used on a small minority of any given screen — its rarity is what makes it legible as "the action."
- **On Signal** (`oklch(0.984 0.019 200.873)`): text/icon color placed on top of Signal Blue.

### Neutral
- **Instrument White** (`oklch(1 0 0)`): page background, card, popover surfaces (light mode).
- **Panel Ink** (`oklch(0.148 0.004 228.8)`): primary text; also the dark-mode background (light/dark are literal inversions of each other at the token level).
- **Quiet Gray** (`oklch(0.967 0.001 286.375)`): secondary/muted/accent surface fill — the "quiet" backdrop for anything that isn't the primary action.
- **Ink Quiet** (`oklch(0.21 0.006 285.885)`): text on Quiet Gray surfaces.
- **Gray Mute** (`oklch(0.56 0.021 213.5)`): muted/help text, placeholders.
- **Hairline Gray** (`oklch(0.925 0.005 214.3)`): borders and input outlines — the primary depth cue in a flat system.
- **Focus Ring Gray** (`oklch(0.723 0.014 214.4)`): the ring/hover border color, one step darker than Hairline Gray.

### Semantic / State
- **Alert Red** (`oklch(0.577 0.245 27.325)`): the only other saturated color in the system, reserved for destructive actions and validation errors. In dark mode it lightens to `oklch(0.704 0.191 22.216)` for contrast rather than staying fixed.

### Named Rules
**The One Signal Rule.** `signal-blue` marks exactly one thing per view: the primary action or the active state. If a screen has two elements fighting for that color, one of them is wrong.

## Typography

**Body/Display Font:** Inter (with `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` fallback)

**Character:** One typeface for the whole system — no serif/sans pairing, no display face. The instrument-panel register reads through weight and size, not through a second voice.

### Hierarchy
- **Headline** (600, 1.5rem/24px, 1.3 line-height): page titles only (`Login`, `Register`, `Todo Dashboard`).
- **Body** (400, 0.875rem/14px, 1.5 line-height): everything else — form labels, help text, input values, buttons. Color varies by role (`panel-ink` for input text, `gray-mute` for labels/help) but size and weight stay constant.

Only two tiers exist today. A third (e.g. a `title` tier for section headers inside the dashboard) is not yet established — do not invent one without a real need.

## Layout

Single-column, centered forms today: auth pages at `max-w-sm` (24rem) with a `6rem` top margin; the dashboard shell at `max-w-2xl` (42rem) with a `2rem` top margin. Vertical rhythm inside a form is `1rem` between fields, `0.375rem` between a label and its input.

Fully responsive by default (Tailwind utility classes, no fixed pixel widths); no custom breakpoints defined yet since nothing has needed one. The product is used in short, frequent sessions and the backlog can grow long, so once the real todo list is built it should favor a scannable, densely-listable layout over a card grid.

**Committed but not yet built:** the header and sidebar are meant to read as a floating layer, visually separated from the page background, while the body content underneath stays flat. This is a stated invariant for the next layout pass, not yet implemented — the current dashboard has no sidebar.

## Elevation & Depth

Flat by default. No drop shadows anywhere in the system today; depth is conveyed by background/border contrast (`--card` vs `--background`, `hairline-gray` borders) rather than shadow.

**Exception, committed for future work:** the header/sidebar chrome should read as floating — separated from the body via background contrast (and shadow if needed to sell the effect) — while the content body underneath it stays flat. This is the one place shadows or elevation may be introduced; the content area itself should not gain them.

### Named Rules
**The Flat Body Rule.** Page content is flat at rest. Only structural chrome (header, sidebar) may float above it.

## Shapes

Corner radius is a single token (`--radius: 0.45rem`) with four derived steps (`xs`/`sm`/`md`/`lg`/`xl` at −6/−4/−2/+0/+4px). Buttons and inputs both use `md` (≈5.2px) — tight, not sharp-square and not pill-shaped. No borders wider than 1px anywhere; no clipping or decorative shapes.

## Components

### Buttons
- **Shape:** `md` radius (≈5.2px), 1px solid border matching the fill color, `6px 10px` padding, 16px label text.
- **Primary:** `signal-blue` background, `on-signal` text — the one-per-view action.
- **Secondary:** `quiet-gray` background, `ink-quiet` text — used for lower-priority actions (e.g. Logout).

### Inputs
- **Style:** `instrument-white` background, 1px `hairline-gray` border, `md` radius, `panel-ink` text, `gray-mute` placeholder.
- **Focus:** border shifts to `focus-ring-gray`.
- **Invalid:** border and placeholder shift to `alert-red`.

### Messages (inline feedback)
- Rendered via PrimeVue's `Message` component at `severity="error"` for form-level errors. Not yet re-themed beyond the global bridge — currently uses PrimeVue's own red, not `alert-red` explicitly. Worth reconciling in a future pass.

## Do's and Don'ts

### Do:
- **Do** reserve `signal-blue` for exactly one primary action or active state per screen (The One Signal Rule).
- **Do** use `hairline-gray` borders as the default way to separate surfaces; reach for background contrast before reaching for a shadow.
- **Do** keep the whole system on Inter — no second typeface without a real reason.
- **Do** treat light and dark mode as equally first-class; every new color decision needs both a light and dark value.

### Don't:
- **Don't** add drop shadows to page content/body surfaces — flat is the rule there.
- **Don't** introduce a second accent hue; secondary/muted/accent stay neutral grays.
- **Don't** round corners past `xl` (≈11.2px) or below `xs` — the system reads as crisp, not soft or sharp.
