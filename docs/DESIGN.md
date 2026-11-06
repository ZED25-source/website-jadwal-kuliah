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
| `--yellow`        | `#FFC928`   | Sticky notes, highlights                     |
| `--red`           | `#DC2626`   | Pushpin, delete hover, errors                |
| `--grid-gray`     | `#E2E8F0`   | Borders, dividers, subtle lines              |
| `--bg`            | `#F8FAFC`   | Page background (off-white)                  |
| `--bg-card`       | `#FFFFFF`   | Card surfaces                                |
| `--text`          | `#1E293B`   | Body text                                    |
| `--text-on-navy`  | `#FFFFFF`   | Text on navy/royal/purple backgrounds        |
| `--text-muted`    | `#64748B`   | Secondary text, metadata                     |
| `--accent`        | `var(--navy)` | Focus rings, links                         |
| `--danger`        | `#DC2626`   | Error states, open task badges (5.61:1)      |
| `--on-danger`     | `#FFFFFF`   | Text on danger background (5.61:1)           |
| `--success`       | `#55A64E`   | Success states, completed task badges (4.77:1)|
| `--on-success`    | `#1E293B`   | Text on success background (4.77:1)          |

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
- Task status badges: red (#DC2626) with white text (5.61:1) for open tasks with count, green (#55A64E) with dark text (#1E293B, 4.77:1) and checkmark for all tasks complete. Both meet WCAG AA requirements.

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
- Single column, max-width: 1200px (≥1280px: 1440px for two-column layout).
- Mobile first. Horizontal padding: 24px (mobile), 48px (≥ 768px).
- At ≥ 768px, schedule uses CSS grid: time column, content column, actions column. Below 768px, vertical layout.
- No horizontal scroll at 360px. Text wraps. Decorative elements hidden or scaled on narrow screens.

### Page Structure (Top to Bottom)
1. **Header**: Program information, semester badge, SKS count. Editable via dialog. Full width above main content.
2. **Main container** (max-width 1200px < 1280px, 1440px ≥ 1280px):
   - **≥ 1280px: Two-column layout**
     - Left column (main, flex: 1): Hero + Week Overview
     - Right column (sidebar, 300px fixed width): Actions, Tasks, Add Task Form, Motivation
     - Gap between columns: var(--space-6)
   - **< 1280px: Single column**
     - Hero (if courses exist)
     - Week Overview (≥ 640px, if courses exist)
     - Day Groups (< 640px, if courses exist)
     - Sidebar (full width, non-sticky)
3. **Hero "Kuliah Hari Ini"** (≥ 640px and < 640px): Current date in Indonesian, list of today's courses sorted by time, status badges for "Sedang berlangsung" and "Berikutnya", count of open tasks for today's courses. Updates every 60 seconds. Compact layout with flex horizontal for date + status on ≥ 768px.
4. **Week Overview** (≥ 640px only): Grid of day columns (auto-fit, minmax 150px), each with day heading and chips for courses. Badge "Hari ini" in separate row above pill (all columns have min-height badge slot for alignment). Clicking a chip opens a detail dialog with full CourseCard.
5. **Day Groups** (< 640px only): Full course details grouped by day, shown below hero on mobile for NFR-02 compliance.
6. **Sidebar** (right column ≥ 1280px, below main content < 1280px):
   - **Actions**: "Tambah mata kuliah" button (primary), DataTools (export, import, reset)
   - **Tasks section**: Heading "Tugas", list of all open tasks (overdue first with "Terlambat" label, then upcoming by due date, then no due date), done tasks in collapsible <details>
   - **Calendar section**: Month calendar with navigation, day grid (6 rows × 7 columns, Monday start), today indicator, visual marks for tasks (red dot for open tasks, green ✓ for all complete), keyboard navigation (arrow keys, PageUp/PageDown), deadline panel showing tasks for selected date
   - **Add Task Form**: Collapsible <details> element with "Tambah tugas" summary (closed by default), containing form with course select, title input (maxlength 120), and optional due date
   - **Motivation**: Sticky notes with quotes
   - **Sticky positioning** (≥ 1280px): `position: sticky; top: var(--space-5); max-height: calc(100vh - 2 * var(--space-5)); overflow-y: auto`

### Two-Column Width Calculation (≥ 1280px)
- Container: 1440px
- Padding: 2 × 48px = 96px
- Available: 1344px
- Sidebar: 300px
- Gap: var(--space-6) = 32px
- Main column: 1344 - 300 - 32 = **1012px**
- Week Overview grid with 6 columns: 1012px / 6 = **~168px per column** (exceeds minmax 150px ✓)

### Responsive Breakpoint: 640px
- ≥ 640px: Show Hero + Week Overview. Hide Day Groups (details accessed via dialog).
- < 640px: Show Hero + Day Groups. Hide Week Overview (preserve full detail view per NFR-02).

### Responsive Breakpoint: 1280px
- ≥ 1280px: Two-column layout, sidebar sticky on right, max-width 1440px.
- < 1280px: Single column, sidebar below main content (non-sticky), max-width 1200px.

## Components

### Background Decoration
- Fixed position, z-index: 0, pointer-events: none.
- Navy/royal curved shapes in top corners.
- Light blue wave at bottom.
- Dot patterns, dashed lines, and monitor icon positioned in main content area (left side), not behind sidebar.
- Decorations hidden on screens <1360px where sidebar is below content.

### Header
- Title: display font, uppercase, navy, responsive sizing (clamp(1.25rem, 6vw, 1.75rem) on <1024px, clamp(1.5rem, 2.4vw, 2.25rem) on ≥1024px).
- Badges: pill-shaped, white background, navy text (program, semester).
- SKS card: label above value, white text on navy background.
- Compact layout: ≥1024px single row with title+pills left, SKS+button right. <1024px stacked with pills below title, SKS and button in one row.
- Padding: var(--space-4) vertical. Target height ≤150px on ≥1024px, ≤240px on 360px.

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
- Task badge: red background with white text and count for open tasks, green background with white checkmark for all complete, no badge when no tasks. aria-label describes status.
- Actions: navy primary button (add task), royal outline (edit), subtle outline (delete).

### Tasks
- Checkbox: clear, 20px.
- Done items: line-through, muted, with "Selesai" label (green).
- Due date: orange pill, small.
- Delete button: outline, hover red.

### Calendar
- Header: Previous/next month buttons (‹ ›), month label in Indonesian, "Hari ini" button to return to current month.
- Week row: Sen Sel Rab Kam Jum Sab Min (full names in abbr title), starts Monday.
- Grid: Always 6 rows × 7 columns for consistent height. Empty cells for dates outside current month (aria-hidden).
- Day cells: Minimum 32px touch target, button element with roving tabindex for keyboard navigation.
- Today indicator: Outline border and aria-current="date".
- Selected day: Light blue background, pressed state with aria-pressed="true".
- Day marks: Red dot (6px circle) for incomplete tasks, green ✓ for all tasks complete, no mark for no tasks. Uses --danger and --success tokens.
- Keyboard navigation: Arrow keys move ±1 day (left/right) or ±7 days (up/down), PageUp/PageDown change month, Home/End jump to first/last day of month. Focus visible on all interactions.
- Deadline panel: Appears below calendar when a date is selected. Shows "Tenggat <date>" heading and list of tasks with that due date. Uses same task item component as Tasks section (checkbox, course name, delete with confirmation). Empty state: "Tidak ada tenggat pada tanggal ini."
- Responsive: Max-width 360px when sidebar is full-width (<1360px). Day cells scale from 32px to 36px based on available width.
- Tasks without due dates are excluded from calendar display but remain in Tasks section.

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

  /* Status tokens */
  --danger: #DC2626;
  --on-danger: #FFFFFF;
  --success: #55A64E;
  --on-success: #1E293B;

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
