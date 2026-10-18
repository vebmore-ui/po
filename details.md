# VEBMORE — Project Architecture, Visual Design & Next Section Blueprint

> **Purpose of this document:**  
> This file contains the complete architectural, visual, mathematical, and design specification of the **Vebmore** web experience. It is specifically structured so an AI agent, designer, or developer can understand exactly what exists, how everything looks and animates, what technologies and tokens are used, and seamlessly plan or implement the **next section**.

---

## 1. Project Overview & Brand Identity

- **Brand Name:** VEBMORE
- **Tagline / Persona:** "A creative digital studio for the modern web."
- **Editorial Voice:** Quiet confidence, restraint, clean engineering, premium editorial feel (monospaced notes meets stark Swiss/brutalist typographic confidence).
- **Core Narrative Motif:** Navigational clarity, direction, compass metaphor, modern motion design, transitioning from dark digital canvas into crisp white editorial paper.

---

## 2. Tech Stack & Dependencies

```json
{
  "framework": "React 19 (TypeScript)",
  "build_tool": "Vite 8",
  "styling": "Global CSS plus component-scoped stylesheets",
  "3d_webgl": "Three.js (r134) + Vanta.js (0.5.24 BIRDS effect); p5 1.1.9 + Vanta.js TOPOLOGY for the Works background",
  "animation_libraries": [
    "gsap (^3.15.0)",
    "motion (^13.2.0 - motion/react)"
  ],
  "icons": "simple-icons ^16.35.0 (Gmail, Instagram, WhatsApp; LinkedIn and Outlook are drawn inline)",
  "canvas": "HTML5 Canvas 2D for the compass dial; a separate canvas transition is retained but inactive",
  "linter": "Oxlint"
}
```

---

## 3. Typography System

Fonts are loaded from Google Fonts via `index.html`:

| Font Family | Weights | Role & Usage | Visual Style |
| :--- | :--- | :--- | :--- |
| **`Anton`** | 400 | Hero repeating marquee strips (`ScrollTextLines.tsx`) | Ultra-condensed, bold, high-impact display uppercase |
| **`Bebas Neue`** | 400 | Large headlines, editorial titles (e.g. `FLY MORE WITH VEBMORE`) | Clean tall condensed sans-serif, assertive |
| **`JetBrains Mono`** | 400, 500, 700 | Technical labels, captions, metadata, lede text, body paragraphs | Monospaced, technical yet warm, editorial agency feel |
| **`Archivo`** | 700, 800, 900 | Secondary typographic weight (available globally) | Sturdy grotesque geometric sans |

### Typographic Hierarchy & Scale:
- **Hero Repeating Lines (`Anton`):** `clamp(3rem, 10vw, 12rem)`, uppercase, `letter-spacing: 0.05em`.
- **Hero Question Strip (`Anton`):** `clamp(0.7rem, 1.9vw, 1.4rem)`, uppercase, `letter-spacing: 0.05em`.
- **Section Titles (`Bebas Neue`):** `clamp(3.1rem, 8.6vw, 8.4rem)`, `line-height: 0.86`, `letter-spacing: 0.005em`.
- **Editorial Sub-labels / Section Markers (`JetBrains Mono`):** `clamp(0.68rem, 1.1vw, 0.82rem)`, `font-weight: 500`, `letter-spacing: 0.34em`, uppercase.
- **Body & Lede Text (`JetBrains Mono`):** `clamp(0.68rem, 1vw, 0.8rem)`, `line-height: 1.85`, `letter-spacing: 0.055em`, uppercase.
- **Figure Captions (`JetBrains Mono`):** `clamp(0.6rem, 0.86vw, 0.7rem)`, `letter-spacing: 0.24em`, uppercase.

---

## 4. Color Palette & Aesthetics

### Palette Definitions:
- **Pure Black:** `#000000` (Hero background, dark accents, stark outlines)
- **Pure White / Paper:** `#ffffff` (About section background, dial face, primary contrast)
- **Brand Green (Accent):** `#0f8f4b` (Quotation marks `“ ”`, index counter `02`, highlights)
- **Vanta Birds Vibrant Green 1:** `#13ff00` (Acid electric green bird gradient)
- **Vanta Birds Deep Field Green 2:** `#064c24` (Deep foliage green bird gradient)
- **Compass Metallics & Gradients:**
  - Dial Rim: Multi-stop silver/metallic gradient (`#f0f0f0` → `#c0c0c0` → `#808080` → `#404040`)
  - Needle North: Deep crimson / blood burgundy gradient (`#1a0000` → `#3d0808` → `#6b1818`)
  - Needle South: Midnight navy gradient (`#050d1a` → `#101f35` → `#1a3050`)
- **Muted Borders & Transparencies:**
  - `rgba(0, 0, 0, 0.1)` / `rgba(255, 255, 255, 0.1)` for hairline horizontal dividers
  - `rgba(0, 0, 0, 0.62)` for lede copy
  - `rgba(0, 0, 0, 0.5)` for captions

---

## 5. Current Website Flow & Active Sections

Currently, `src/App.tsx` renders the compass hero followed by two pinned
horizontal stages. The first (**About → Capabilities → Tech stack**,
`AboutCapabilitiesStage.tsx`) slides three white/green panels; the second
(**Works → Contact**, `WorksContactStage.tsx`) pins a black Works roller and
slides into a white Contact panel. On wide screens each stage pins a horizontal
track; on screens at or below 900px, and when reduced motion is requested, the
panels become a normal vertical stack.

```
┌────────────────────────────────────────────────────────┐
│  ACT 1: COMPASS HERO (Pinned Fixed Layer)               │
│  - Question strip: "SEEKING DIGITAL DIRECTION?"        │
│  - Infinite scrolling text ribbons:                     │
│    LET / VEBMORE / BE YOUR / COMPASS                   │
│  - Interactive 2D/SVG/Canvas Compass                    │
│  - Scrubbed exit as user scrolls                        │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (natural scroll handover)
┌────────────────────────────────────────────────────────┐
│  STAGE: ABOUT → CAPABILITIES (stg-track-wrap)           │
│  260vh / 260svh of scroll budget, sticky viewport pin   │
│                                                         │
│  ┌─ Panel 1 — ABOUT (100vw) ──────────────────────────┐ │
│  │  Background: #ffffff                               │ │
│  │  Left: ABOUT “” / FLY MORE WITH VEBMORE / mono lede│ │
│  │  Right: Vanta Birds plate + caption                │ │
│  │  Caption: "02  MOTION STUDY — CURSOR CLOSER…"      │ │
│  └────────────────────────────────────────────────────┘ │
│                       │ track translateX 0 → -100vw      │
│                       ▼                                 │
│  ┌─ Panel 2 — CAPABILITIES (100vw) ───────────────────┐ │
│  │  Label: CAPABILITIES “”                            │ │
│  │  Title: WHAT WE / NAVIGATE                         │ │
│  │  4 bearing rows, each an expandable green-wipe row│ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (natural scroll handover)
┌────────────────────────────────────────────────────────┐
│  STAGE: WORKS → CONTACT (wc-wrap)                       │
│  480svh (4 projects) / 660svh (7 projects) budget       │
│                                                         │
│  ┌─ RIGHT on entry — WORKS (100vw) ───────────────────┐ │
│  │  Background: #000 + Vanta TOPOLOGY (green lines)   │ │
│  │  Label: WORKS “” / GROW MORE WITH / VEBMORE        │ │
│  │  Pinned roller of project names (dwell-eased `f`)  │ │
│  │  Live counter [01/04] · “MORE WORK” chevron        │ │
│  └────────────────────────────────────────────────────┘ │
│                       │ track translateX -100vw → 0      │
│                       ▼                                 │
│  ┌─ LEFT on exit — CONTACT (100vw) ───────────────────┐ │
│  │  Background: #ffffff                               │ │
│  │  Left: CONTACT “” / BE MORE WITH / VEBMORE / lede  │ │
│  │  Right: 01 SOCIAL · 02 EMAIL · 03 WHATSAPP         │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Stage Timeline (`AboutCapabilitiesStage.tsx`)

Progress `p` = how far `.stg-track-wrap` has scrolled past the top of the viewport
(`clamp(-rect.top / (offsetHeight - vh), 0, 1)`), written to DOM refs via `rAF` — no
React state per frame.

| Progress `p` | What happens |
| :--- | :--- |
| `0.00 – 0.28` | About panel holds; the Vanta Birds effect stays live. |
| `0.28 – 0.78` | `.stg-track` slides from `0vw` to `-100vw` using an ease-in-out curve. |
| During slide | Capabilities panel has up to `6vw` of parallax offset, resolving to `0`. |
| `0.52` (once) | Capabilities entry sequence starts. |
| `0.78 – 1.00` | Capabilities panel holds; the sticky pin releases at the end of the track. |

Progress is clamped from the wrapper's scroll position and transforms are
updated in `requestAnimationFrame` through DOM refs rather than React state on
every frame. The birds are not faded or torn down during the horizontal
transition.

---

## 6. Deep Dive into the Current Active Components

### 6.1 Hero & Compass Section (`src/components/hero/`)

#### 1. `ScrollTextLines.tsx`
- **Rows:** 5 horizontal text lines across full viewport width.
  - **Row 0:** White question strip, `SEEKING DIGITAL DIRECTION?`, with an initial typewriter clip (`width: 0 -> 100%` in 2.4s); its repeated text then scrolls right continuously.
  - **Row 1:** `LET` (slides left, infinite loop).
  - **Row 2:** `VEBMORE` (slides right, infinite loop).
  - **Row 3:** `BE YOUR` (slides left, infinite loop).
  - **Row 4:** `COMPASS` (slides right, infinite loop).
- **Style:** Alternating filled and outlined display text on the dark hero.
- **Scroll Response:**
  - As user scrolls down (`textProgress` 0.0 → 1.0), rows 4, 3, 2, 1 exit sequentially by moving down up to 30px while fading out.
  - Row 0 (the question strip) remains visible throughout the hero scroll.

#### 2. `Compass.tsx`, `CompassFace.tsx`, `CompassNeedle.tsx`, `CompassGlass.tsx`
- **Layout:** Centered horizontally, at `top: 78%` on wide screens and `62%` at widths up to 480px (interpolated between); responsive size ranges from `140px` to `420px`.
- **Interactive features:**
  - **Pointer-reactive rim:** The compass face redraws its rim highlight based on pointer position.
  - **Interactive Needle (`CompassNeedle.tsx`):** SVG needle smoothly tracks the pointer, with a subtle sway that is disabled for reduced motion.
  - **Glass Reflection (`CompassGlass.tsx`):** Separate glass overlay above the canvas face and needle.
- **Scroll Response:**
  - Fades out smoothly between `heroProgress` 0.35 and 0.70.

#### 3. Hero Scroll Budget (`App.tsx`)
- The hero is `position: fixed; inset: 0; z-index: 1`.
- A `<div className="scroll-spacer" />` with `height: 1.6 viewports` creates native scroll distance.
- `heroProgress = Math.min(scrollTop / heroTrack, 1)`.
- When `heroProgress >= 1`, the hero container switches to `visibility: hidden`.

---

### 6.2 About Section (`src/components/AboutSection.tsx` & `src/components/motion-world/about.css`)

- **Container:** `.ab-root`, a white paper surface within the first panel of the pinned stage on desktop.
- **Layout:** Two-column grid (`.ab-grid`) on desktop:
  - Left column (`minmax(0, 1.05fr)`): Editorial text.
  - Right column (`minmax(0, 0.95fr)`): Interactive Vanta Birds viewport plate.
  - On mobile (`<= 900px`): Single-column layout; About and Capabilities stack vertically.
- **Sequenced Stagger Reveal:**
  Activated when `aboutActive = true` (`heroProgress >= 0.85`):
  1. `+120ms`: `ABOUT “”` label rises (`ab-rise`).
  2. `+320ms`: Words `FLY`, `MORE`, `WITH` mask-slide up from below overflow container.
  3. `+620ms`: Mark `VEBMORE` mask-slides up.
  4. `+820ms`: Monospaced body paragraphs fade up.
  5. `+1000ms`: Birds figure plate and caption rise.
  6. `+1150ms`: Vanta Birds initializes its WebGL effect.
- **Interactive Birds Plate (`src/components/about/VantaBirds.tsx`):**
  - Crisp 1px black outline (`border: 1px solid #000`).
  - Aspect ratio: `4 / 3` (desktop), `5 / 4` (mobile).
  - Vanta.js BIRDS with Three.js r134 canvas.
  - Responds to mouse hover / cursor movement across the window.
  - Caption underneath: `02  MOTION STUDY — CURSOR CLOSER TO BIRDS.`

### 6.3 Capabilities Panel (`src/components/CapabilitiesSection.tsx`)

- **Layout:** Fills the second white stage panel on desktop; the section header
  sits above four bearing rows.
- **Header:** `CAPABILITIES` label, `WHAT WE / NAVIGATE` display title, and a
  short lede describing the four disciplines.
- **Entry sequence:** Label at 100ms, title at 280ms, lede at 500ms, then rows
  at 650ms, 740ms, 830ms, and 920ms after the stage trigger.
- **Expandable rows:** Four cardinal bearings — Brand Strategy & Identity
  (000° N), Creative Web Development (090° E), Digital Systems & UI/UX
  (180° S), and Motion & 3D (270° W). Each switch toggles its description;
  opening a row closes the previously open row.
- **Responsive/reduced motion:** The stage panel layout becomes vertical and
  content can flow naturally instead of being constrained to the pinned
  viewport.

---

### 6.4 Works → Contact Stage (`WorksContactStage.tsx` & `worksContactStage.css`)

A second pinned horizontal stage, added after the About → Capabilities stage.
Its DOM order is **Contact first, then Works**, and the track starts at
`translateX(-100vw)` (set in CSS, so there is no flash) so Works is the panel on
screen. Scrolling animates the track to `translateX(0)`: Works exits to the
**right** and Contact enters from the **left**.

Scroll is measured in **absolute distance** from the wrapper top (`s`, in `svh`
units) rather than as a fraction of total height, so adding projects later never
shifts the position at which an earlier project rolls in. One rAF-throttled
passive scroll listener writes to DOM refs; no React state per frame.

| Constant | Value (svh) | Meaning |
| :--- | :--- | :--- |
| `HOLD_START` | 10 | first project holds |
| `STEP` | 60 | scroll distance per project-to-project roll |
| `HOLD_END` | 50 | last project holds (user can press "more") |
### 6.4 Stage 2: WORKS → CONTACT (`WorksContactStage.tsx`)

Pinned horizontal stage with fixed timeline constants (in `svh` units):

| Constant | Value (svh) | Meaning |
| :--- | :--- | :--- |
| `HOLD_WORKS` | 80 | Works holds at the start while user interacts with carousel |
| `SLIDE` | 100 | Works → Contact horizontal slide |
| `HOLD_CONTACT` | 40 | Contact holds, then the page ends |

Total wrapper height = `100 + HOLD_WORKS + SLIDE + HOLD_CONTACT = 320svh` (with `vh` fallback).
- Works panel starts on screen (`translateX = -100vw`).
- As user scrolls, the track translates from `-100vw` to `0vw` using `easeInOutCubic`, exiting Works to the RIGHT and entering Contact from the LEFT.
- Contact layer has a parallax lag of `(1 - eased) * -6vw → 0`.
- Works entry fires when reached; Contact entry fires at `q ≥ 0.45`.

---

### 6.5 WORKS — Diagonal Orbit Carousel & Detail Stage (`WorksSection.tsx` & `works.css`)

Black monolith panel (`#000000`) with faint dot grid (radial-gradient, 5% white, 28px pitch). Vanta Topology is completely dormant (no canvas/p5 mounted).

- **Layout:** Two-column grid (`1.25fr 0.75fr`) cleared from the fixed nav by `var(--panel-pad-top)`.
- **Diagonal Orbit Carousel (Left column):**
  - 5 featured projects (`FEATURED_COUNT = 5`).
  - Cards: portrait rounded rectangles (`clamp(112px, 11vw, 168px)` at 3:4), lime mono index, Bebas Neue name, project gradient.
  - Orbit tilted around axis by `AXIS_TILT_DEG = -30°`: `x = Rx * sin φ`, `y = -Ry * cos φ`, `w = cos φ` rotated by -30°.
  - Scale `0.58 + 0.42 * (w+1)/2`, opacity `0.28 + 0.72 * (w+1)/2`, z-index from depth, subtle 3D `rotateY`.
  - Orbit track ellipse in faint hairline (`rgba(255,255,255,0.08)`).
  - One rAF loop writes transforms through refs when panel is on screen (`q < 0.98`).
  - Auto-rotation: ~28s/revolution (~12.86°/s).
  - Hover damping: eases to 0 over 350ms on card enter, resumes over 600ms after pointer leaves for 300ms.
  - Controls: 44px circular ‹ › arrow buttons snap by 72° over 700ms ease-in-out tween; 3s pause after use. Arrow keys ← → and touch swipe supported.
  - Reduced motion: static staggered arrangement without auto-rotation.
- **Detail Stage (Right column):**
  - Idle state: `[05]` count, mono lede, pulsing prompt, dashed plate placeholder.
  - Active state: big plate (`16:10`, max 42svh, project gradient) with clip-path wipe reveal (`inset(100% 0 0 0) → inset(0)` + scale `1.04 → 1` over 550ms). Staggered meta: lime index, Bebas Neue name, mono meta line, description, tag chips, hint, and `VISIT PROJECT ↗` button.
  - 300ms hover intent delay prevents flickering between cards and detail panel.
- **"More Work" Button:**
  - Pill button `MORE DESIGNS & WORK ↗` at the bottom of the right column navigating client-side to `/works`.

---

### 6.6 CONTACT (`ContactSection.tsx` & `contact.css`)

Black panel with shared `var(--panel-pad-top)` top clearance. Two-column editorial layout.

- **Background Embellishments (static, zero JS loops):**
  - Faint dot-grid with radial center mask (`mask-image: radial-gradient(...)`).
  - Large faint SVG compass ring (~60vmin, 6% opacity) behind left column with slow CSS rotation (120s infinite, paused when off screen).
  - Static green radial glow in bottom-right corner at 8-10% opacity.
- **Left Column:**
  - `CONTACT ""` label (lime quotes).
  - `BE MORE WITH` / `VEBMORE` title (Bebas Neue, mask reveals).
  - Agency-focused lede: *"HAVE AN IDEA, A BRIEF OR JUST A ROUGH SKETCH? TELL US WHAT YOU WANT TO BUILD. WE DESIGN AND DEVELOP WEBSITES AND DIGITAL PRODUCTS THAT LOOK SHARP AND PERFORM."*
  - **Live Studio Clock:** Mono line `LOCAL TIME  HH:MM:SS  IST` formatted via `Intl.DateTimeFormat` (24h) for `Asia/Kolkata`. Ticks at 1Hz only while visible.
  - Copyright line.
- **Right Column:**
  - Three action groups: `01 SOCIAL` (LinkedIn, Instagram), `02 EMAIL` (Gmail and Outlook buttons with prefilled subject; email address line removed), `03 WHATSAPP` (direct phone links and WhatsApp buttons with greeting).

---

### 6.7 NAVIGATION, CURSOR, ROUTING & CAPABILITIES

- **Fixed Site Navigation (`SiteNav.tsx`, `nav.css`, `sectionMap.ts`):**
  - Fixed top band at `z-index: 1200`. Left: reserved logo slot (`min-width: 140px`). Right: pill offset `clamp(16px, 2.4vw, 32px)`.
  - Pill: `rgba(0,0,0,0.8)`, `1px solid rgba(255,255,255,0.14)`, `border-radius: 999px`, padding `10px 22px`, no blur.
  - Active item: scaled 1.18, full white, lime `#13ff00` down-pointing triangle, and moves to LEFTMOST position.
  - Visual reordering via CSS `order` with `motion/react` layout FLIP spring; DOM order stays canonical (`HOME`, `ABOUT`, `CAPABILITIES`, `WORK`, `CONTACT`).
  - Scaled width reserved via CSS grid sizer so total pill width is completely constant.
  - Active detection via single rAF-throttled scroll listener using stage geometry constants.
  - Narrow screen (`<=900px`): active word + `MENU` button opening full dropdown list.
- **Custom Cursor (`SiteCursor.tsx`, `cursor.css`):**
  - Fine pointer only (`(hover: hover) and (pointer: fine)`), disabled under reduced motion.
  - Dot: 6px white circle with 1px black outline.
  - Ring: 30px with 1px black outline, 4 cardinal ticks (N/E/S/W), lerps 0.18/frame.
  - States: interactive (48px, ticks rotate 45°), `data-cursor="view"` (64px with mono `VIEW` label), pressed (scaled down).
  - Single rAF loop that sleeps after 1s of stillness and wakes on pointer move.
- **Routing & `/works` Page (`router.tsx`, `WorksPage.tsx`, `worksPage.css`, `vercel.json`):**
  - Tiny zero-dependency router: `usePath()`, `navigate()`, `<Link>`.
  - `WorksPage`: black background, filter bar for tags, responsive 3/2/1 grid of all 8 projects, pop-in animation, footer link back to `/#contact`.
  - Stages and WebGL unmount on `/works` and cleanly remount on `/`.
  - `vercel.json` rewrite rule for production SPA refresh.
- **Capabilities Alignment & Shared Tokens:**
  - Tokens: `--nav-h: clamp(64px, 9vh, 92px)`, `--panel-pad-top: clamp(88px, 13vh, 168px)`.
  - Applied to About, Capabilities, Tech Stack, Works, and Contact so labels line up precisely and content never overlaps nav.
  - Capabilities rows tightened (`cap-btn` padding `clamp(8px, 1.4vh, 18px) 0`) so entire panel fits 100svh at 1920×1080, 1440×800, and 1280×720 without clipping.

---

### 6.8 Fallbacks (≤ 900px or `prefers-reduced-motion: reduce`)

- No pin, no horizontal slide. Normal flow document stack.
- Works stacks header, carousel, and detail panel.
- Contact stacks below Works.
- Nav displays active word + `MENU` dropdown.

---

## 7. Preserved / Dormant Components (Ready to Re-integrate)

These components were built, perfected, and are intentionally retained in the codebase to be reused at any time:

1. **`src/components/hero/VebmoreReveal.tsx`**
   - 3D flipping typography where individual letters of `VEBMORE` flip into place, then the first 3 letters flip 180° into the custom `veb-reveal.png` emblem mark.
2. **`src/components/CurtainsTransition.tsx`**
   - Staggered green vertical columns (7 columns) that sweep downward, hold, and iris open into the next section.
3. **`src/components/MotionWorld.tsx` (`src/components/motion-world/`)**
   - Fullscreen GSAP pinned scrollytelling world scrubbed directly by scroll position.
   - Includes typographic statements: *"You Dream, / We Design, / We Develop, / We Deliver."*
   - Orbit clusters, route paths, sweep arcs, coordinate compass rings.
4. **`src/components/PixelizeTransition.tsx`**
   - High-performance HTML5 Canvas mosaic transition that shatters a black canvas into randomized rectangular pixels and resolves downward into white paper.

---

## 8. Essential Rules & Guidelines for Planning the Next Section

When designing or coding the next section, adhere strictly to these principles:

### 1. Document Flow vs. Fixed Pinned Layers
- Two pinned stages now exist: `AboutCapabilitiesStage` (About → Capabilities →
  Tech stack) and `WorksContactStage` (Works → Contact).
- Add a standard next section after `WorksContactStage` in `App.tsx` so it
  follows the stage naturally when its sticky pin releases.
- If the next section needs its own pinned or scrubbed interaction, give it a
  separate scroll track and ensure it degrades to normal flow on mobile and for
  `prefers-reduced-motion`.
- Follow the established stage pattern: measure scroll in **absolute distance**
  (not fractions), drive one rAF-throttled passive scroll listener writing to
  DOM refs, and keep React state for human-speed changes only.

### 2. Color Palette Continuity
- Since the current stage establishes the **white paper canvas** (`#ffffff`), the next section should either:
  - **Option A (Continuous Editorial White):** Remain on `#ffffff` paper, using stark black typography, hairline borders (`1px solid rgba(0,0,0,0.1)` or `1px solid #000000`), and selective `#0f8f4b` brand green accents.
  - **Option B (Inverted Black Monolith):** Transition into a bold, pure black `#000000` section (e.g., for showcase/work showcase) with high-contrast white typography and lime/green accents.

### 3. Typographic Consistency
- **Headline / Display:** Use `font-family: 'Bebas Neue', 'Anton', sans-serif` for colossal titles.
- **Labels, Indices, Tags & Metadata:** Use `font-family: 'JetBrains Mono', monospace`, uppercase, wide tracking (`letter-spacing: 0.2em - 0.35em`).
- **Numbers / Indices:** Use index numerals styled like `02`, `03` in accent green `#0f8f4b` or bold mono.
- **Copy:** Monospaced or clean grotesque with strict line-height (`1.6 - 1.85`).

### 4. Motion & Micro-Interactions
- Avoid generic fades or standard bounce animations.
- Use **overflow-hidden mask reveals** for text (words sliding up from `translateY(105%)` to `0`).
- Use **hairline geometric lines** that draw in or expand.
- Any 3D or canvas elements must have graceful fallback, cleanup on unmount, and support `prefers-reduced-motion`. Vanta effects are loaded by dynamic import (never a CDN script tag), are torn down when off screen, and are never created at all under reduced motion.

### 5. Layout & Grid Standards
- Max content width: Fluid with clamp margins: `padding: clamp(40px, 8vh, 120px) clamp(20px, 6vw, 104px)`.
- Use CSS Grid with clean fractional ratios (`1fr 1fr`, `1.2fr 0.8fr`, or 3-column bento/editorial splits).
- Responsive breakpoint: `900px` or `768px` where multi-column layouts gracefully collapse to vertical stacks.

---
