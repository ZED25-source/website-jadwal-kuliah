# DESIGN.md

## Principles
Calm, quiet, readable. Content leads; the interface stays out of the way.
When a rule below conflicts with readability or accessibility, readability wins.

## Color

### Tokens
Define as CSS custom properties. Never hardcode hex values in components.

| Token             | Light       | Dark        | Use                              |
|-------------------|-------------|-------------|----------------------------------|
| `--bg`            | `#FAF7F2`   | `#1C1915`   | Page background                  |
| `--text`          | `#2B2620`   | `#EDE7DD`   | Body and headings                |
| `--text-muted`    | `#6B6155`   | `#A39889`   | Captions, metadata, secondary    |
| `--accent`        | `#9A6232`   | `#D4A06A`   | Links, focus rings, small marks  |
| `--accent-hover`  | `#7E4E24`   | `#E2B584`   | Hover/active state of accent     |

### Rules
- No pure `#000` or `#FFF`. No gradients.
- Accent is sparing: links, focus states, one highlight per screen at most.
- Contrast minimums (WCAG AA): 4.5:1 for body text, 3:1 for large text and UI
  boundaries. Check `--text-muted` and `--accent` against `--bg` in both themes.
- Respect `prefers-color-scheme`. Dark mode is warm, not blue-grey.
- Never rely on color alone to convey state; links are also underlined.

## Typography

- Family: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  (optionally pair with one serif for headings: `Georgia, "Times New Roman", serif`)
- Never more than two families, and if two, one serif and one sans.

| Role    | Size  | Line-height | Weight |
|---------|-------|-------------|--------|
| Caption | 14px  | 1.5         | 400    |
| Body    | 16px  | 1.6         | 400    |
| Lead    | 20px  | 1.5         | 400    |
| H3      | 24px  | 1.3         | 600    |
| H2      | 32px  | 1.2         | 600    |
| H1      | 40px  | 1.15        | 600    |

- Body text never goes below 16px.
- Max line length: 65ch for prose.
- Use rem units in code (14/16/20/24/32/40px → 0.875/1/1.25/1.5/2/2.5rem) so user font settings are respected.
- Left-align text. No justified text, no all-caps paragraphs.
- Scale headings down one step on screens under 640px (H1 → 32px, H2 → 24px).

## Spacing
One scale: 4 / 8 / 16 / 24 / 48 / 96 px. Define as tokens (`--space-1` … `--space-6`).

- Within a component: 4–16px.
- Between related elements: 16–24px.
- Between sections: 48–96px.
- Separate sections with whitespace only, not borders, boxes, or rules.
- Exceptions where borders are allowed: form inputs, table rows, `:focus-visible`
  outlines, and code blocks. These are functional, not decorative.

## Layout
- Single column, `max-width: 65ch` for prose, up to `720px` for the container.
- One focal point per section: one heading, one idea, at most one call to action.
- Mobile first. Horizontal padding: 24px (mobile), 48px (≥ 640px).
- Images and media: full column width, no decorative frames or shadows.

## Components

### Links
Accent color, underlined with `text-underline-offset: 0.2em`. Hover uses `--accent-hover`.

### Buttons
One primary style: accent background, `--bg` text, 8px/16px padding, 4px radius.
One secondary style: text-only link. No third style.

### Focus
Every interactive element has a visible `:focus-visible` state:
`outline: 2px solid var(--accent); outline-offset: 2px`. Never remove outlines.

### Forms
Visible labels above inputs (no placeholder-only labels). Inputs get a 1px
border in `--text-muted`. Errors use text plus an icon-free message, never color alone.

### Touch targets
Minimum 44×44px for anything tappable.

## Motion
- Allowed: opacity fades, 150–250ms, `ease-out`.
- Nothing moves on scroll. No parallax, no autoplay, no floating blobs.
- Under `prefers-reduced-motion: reduce`, disable all transitions and animation.

## Don'ts
- No emoji as icons
- No stock illustrations
- No glassmorphism, blur, or drop shadows
- No gradient text
- No identical icon-title-blurb card grids
- No carousels, modals, or auto-opening popups
- No decorative animation

## Copy
Write like a person explaining something to a colleague. Short sentences. Concrete verbs.

- Never use: seamless, revolutionize, cutting-edge, unlock, empower, leverage,
  game-changing, robust, streamline, supercharge.
- Prefer "use" over "utilize", "help" over "facilitate", "start" over "get started".
- Buttons and links describe the result: "Read the guide", not "Click here".
- Do not invent testimonials, stats, names, or claims. Where a fact is missing, write `TODO`.
- Headings are sentence case.

## Accessibility baseline
- Semantic HTML first (`header`, `main`, `nav`, `section`, `footer`).
- One `h1` per page; headings never skip levels.
- Alt text on every meaningful image; `alt=""` on decorative ones.
- Keyboard-navigable in a logical order, with a skip link on multi-section pages.
- Set `lang` on `<html>`.

## Reference implementation

```css
:root {
  --bg: #FAF7F2;
  --text: #2B2620;
  --text-muted: #6B6155;
  --accent: #9A6232;
  --accent-hover: #7E4E24;

  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 48px; --space-6: 96px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1C1915;
    --text: #EDE7DD;
    --text-muted: #A39889;
    --accent: #D4A06A;
    --accent-hover: #E2B584;
  }
}

body {
  background: var(--bg);
  color: var(--text);
  font: 1rem/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

main { max-width: 65ch; margin-inline: auto; padding: var(--space-5) var(--space-4); }

a { color: var(--accent); text-underline-offset: 0.2em; }
a:hover { color: var(--accent-hover); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```