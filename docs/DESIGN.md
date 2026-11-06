# DESIGN.md

## Theme
Modern Academic Infographic Poster: Bold, structured, colorful, and educational.

## Principles
Clarity, hierarchy, and visual engagement. Content is organized like an academic poster: prominent headings, color-coded sections, and clear visual groupings. Information is easy to scan and accessible.

## Color

### Palette Tokens
Define as CSS custom properties. Never hardcode hex values in components except within SVG decorative elements using currentColor or var().

| Token             | Value       | Use                                          |
|-------------------|-------------|----------------------------------------------|
| `--navy`          | `#10346F`   | Primary brand, headings, key actions         |
| `--royal`         | `#14579A`   | Secondary brand, hover states, accents       |
| `--light-blue`    | `#DCECF7`   | Backgrounds, decorative fills                |
| `--off-white`     | `#F8FAFC`   | Page background                              |
| `--teal`          | `#20A6A5`   | Day pill (Tuesday)                           |
| `--green`         | `#55A64E`   | Day pill (Wednesday), success states         |
| `--orange`        | `#F2A526`   | Day pill (Thursday), due dates               |
| `--purple`        | `#7961B2`   | Day pill (Friday), icons                     |
| `--yellow`        | `#FFC928`   | Sticky notes, badges, highlights             |
| `--red`           | `#DC2626`   | Pushpin, delete hover, errors                |
| `--grid-gray`     | `#E2E8F0`   | Borders, dividers, subtle lines              |
| `--bg`            | `#F8FAFC`   | Page background (off-white)                  |
| `--bg-card`       | `#FFFFFF`   | Card surfaces                                |
| `--text`          | `#1E293B`   | Body text                                    |
| `--text-on-navy`  | `#FFFFFF`   | Text on navy/royal/purple backgrounds        |
| `--text-muted`    | `#64748B`   | Secondary text, metadata                     |
| `--accent`        | `var(--navy)` | Focus rings, links                         |

### Day Colors
- Senin (Monday): navy
- Selasa (Tuesday): teal
- Rabu (Wednesday): green
- Kamis (Thursday): orange
- Jumat (Friday): purple
- Sabtu/Minggu (Saturday/Sunday): royal

Text on pills: white on navy, royal, purple; navy on teal, green, orange, yellow.

### Rules
- Contrast minimums (WCAG AA): 4.5:1 for body text, 3:1 for large text/icons.
- Light mode only (dark mode removed for this theme).
- Never rely on color alone to convey state: use text labels, icons, and borders.

## Typography

### Families
- **Display**: `'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue', sans-serif-condensed, sans-serif` — for bold, condensed, uppercase headings
- **Body**: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- **Handwritten**: `'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive` — for sticky notes only

### Scale

| Role    | Size  | Line-height | Weight |
|---------|-------|-------------|--------|
| Caption | 14px  | 1.5         | 400–700|
| Body    | 16px  | 1.6         | 400–700|
| Lead    | 20px  | 1.5         | 600–700|
| H3      | 24px  | 1.3         | 600–700|
| H2      | 32px  | 1.2         | 700    |
| H1      | 40px  | 1.15        | 700–800|
| Display | 48px  | 1.15        | 800    |

- Display headings: uppercase, bold, condensed.
- Body text never goes below 16px.
- Use rem units in code so user font settings are respected.
- Scale headings down one step on screens under 640px.

## Spacing
Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. Define as tokens (`--space-1` … `--space-8`).

- Within a component: 8–16px.
- Between elements: 16–24px.
- Between sections: 48–64px.

## Layout
- Single column, max-width: 1200px.
- Mobile first. Horizontal padding: 24px (mobile), 48px (≥ 768px).
- At ≥ 768px, schedule uses CSS grid: time column, content column, actions column. Below 768px, vertical layout.
- No horizontal scroll at 360px. Text wraps. Decorative elements hidden or scaled on narrow screens.

## Components

### Background Decoration
- Fixed position, z-index: -1, pointer-events: none.
- Navy/royal curved shapes in top corners.
- Light blue wave at bottom.
- Dot patterns, dashed lines, and low-contrast blueprint illustration as background textures.
- White organic-bordered content area in the center.

### Header
- Title: display font, uppercase, navy, large.
- Badges: pill-shaped, royal background, white text (program, semester).
- SKS card: white background, dashed navy border, yellow ribbon label, large navy number.
- Illustrations: circular icons (laptop, book, plant, graduation cap) with soft shadows.

### Day Groups
- Day pill: colored background, rounded pill, icon + day name. Navy/royal/purple use white text; teal/green/orange use navy text.
- "Hari ini" badge: yellow background, navy text, uppercase, pill.
- Card: white background, thin border, rounded corners, soft shadow.
- Desktop grid header: navy background, white uppercase text, rounded top corners. Hidden from screen readers if duplicate.
- Rows alternate with subtle light-blue background tint.

### Course Cards
- Time: large, bold, royal.
- Course name: bold, navy. Code in royal.
- Metadata: caption size, muted.
- Task badge: yellow background, navy text, pill.
- Actions: navy primary button (add task), royal outline (edit), subtle outline (delete).

### Tasks
- Checkbox: clear, 20px.
- Done items: line-through, muted, with "Selesai" label (green).
- Due date: orange pill, small.
- Delete button: outline, hover red.

### Buttons
- Primary: navy background, white text, pill shape.
- Secondary: outline, gray border.
- Destructive: outline, red hover.
- Focus visible on all interactive elements.

### Forms and Dialogs
- Card background, rounded, shadow.
- Labels: bold, above inputs.
- Inputs: thin border, rounded, padding.
- Errors: red text, bold.
- Conflict warnings: orange dashed border, tinted background.

### Footer
- Sticky notes: yellow background, rotated slightly, handwritten font, red pushpin SVG.
- Banner: navy background, white text, italic quote, graduation icons in white circles.
- Paperclip SVG decoration.
- Data tools: subtle links at bottom.

## Motion
- Allowed: opacity fades, 150–250ms, `ease-out`.
- Rotation on sticky notes disabled under `prefers-reduced-motion: reduce`.
- No scroll-triggered animation, no autoplay.

## Decorative Elements
- All decorative SVG and icons: `aria-hidden="true"`.
- Icons are inline SVG, styled with currentColor or CSS variables.
- No external images or fonts.

## Accessibility
- Semantic HTML.
- One `h1` per page; headings never skip levels.
- Alt text on meaningful images; `aria-hidden` on decorative ones.
- Keyboard-navigable in logical order.
- Focus visible on all interactive elements.
- Color contrast checked for all text/background pairs.

## Reference Implementation

```css
:root {
  --navy: #10346F;
  --royal: #14579A;
  --light-blue: #DCECF7;
  --off-white: #F8FAFC;
  --teal: #20A6A5;
  --green: #55A64E;
  --orange: #F2A526;
  --purple: #7961B2;
  --yellow: #FFC928;
  --red: #DC2626;
  --grid-gray: #E2E8F0;

  --bg: var(--off-white);
  --bg-card: #FFFFFF;
  --text: #1E293B;
  --text-on-navy: #FFFFFF;
  --text-muted: #64748B;
  --accent: var(--navy);

  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px;

  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 16px;
  --radius-pill: 999px; --radius-circle: 50%;

  --shadow-soft: 0 2px 8px rgba(16, 52, 111, 0.08);
  --shadow-medium: 0 4px 16px rgba(16, 52, 111, 0.12);
}

body {
  background: var(--bg);
  color: var(--text);
  font: 1rem/1.6 system-ui, sans-serif;
}

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

## Notes
- SRS 1.2 still references "minimalist" theme. This is a known discrepancy; SRS was not updated as part of this theme change.
