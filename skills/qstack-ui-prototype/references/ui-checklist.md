# UI checklist for a static prototype

Load this at the audit step, after the mock exists. Walk every rule a static
HTML prototype can break. Fix what you find. Anything left unfixed goes in the
report with a reason, never silently.

Adapted from the `quick-reference.md` and `pro-rules.md` references in
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) by
Next Level Builder, MIT licensed, at commit
`f3ac195224eac1eb0dfe1a3059c2a6add78ffbe3`. Trimmed to what a mock can show:
rules about runtime performance, network, analytics, and framework internals
are left out. Wording is condensed; the standards cited are WCAG 2.2, Apple
HIG, and Material Design, as in the source.

## 1. Accessibility

- Text contrast at least 4.5:1, large text 3:1, in every theme the mock has.
- Controls and meaningful icons at least 3:1 against what they sit on.
- Visible focus ring on every interactive element, 2 to 4px, never removed.
- Tab order matches visual order. Nothing reachable only by pointer.
- Every icon-only control has an accessible name. Decorative icons beside
  visible text are `aria-hidden`.
- Every image that carries meaning has alt text. Decorative ones have `alt=""`.
- Headings run h1 to h6 in order with no skipped level.
- Every input has a visible `<label for>`. Placeholder is not a label.
- Nothing is conveyed by color alone. Pair it with text or an icon.
- Sticky bars and overlays never cover the focused control.
- Modals and multi-step flows have a visible cancel or back.
- Anything that drags or swipes has a button or keyboard alternative.
- Auto-rotating content has a pause control and stops under reduced motion.
- `prefers-reduced-motion` is honored: animation is reduced or removed.
- Body text scales with the user's text size without truncating.

## 2. Touch and pointer

- Targets at least 44 by 44 CSS px on touch surfaces, 24 by 24 on pointer
  surfaces. Extend the hit area past the visual bounds when the glyph is small.
- At least 8px between adjacent targets.
- Nothing depends on hover. Whatever hover reveals is also reachable by tap
  and keyboard.
- Pressed and focused states are visible and do not shift layout.
- Clickable elements show `cursor: pointer`.
- Disabled controls look disabled, carry the `disabled` attribute, and do
  nothing.
- On a phone-shaped mock, primary actions sit where a thumb reaches, clear of
  the screen edges and the home indicator area.

## 3. Style and consistency

- One visual language across every screen in the mock.
- SVG or icon-font glyphs, never emoji, for icons.
- One icon set. One stroke width. Filled or outline per hierarchy level, not
  both.
- Icon sizes come from a scale, such as 16, 20, 24, not arbitrary values.
- One shadow and radius scale. Effects match the chosen style: a flat mock
  has no blur, a glass mock has no hard shadows.
- Blur is for dismissing a background, not decoration.
- One primary call to action per screen. Everything else is subordinate.
- Colors come from semantic tokens: surface, on-surface, primary, danger.
  No stray hex values in components.
- Light and dark are designed together. Dark is desaturated and lighter,
  not inverted, and its contrast is measured on its own.
- Dividers and borders are visible in both themes.
- Modal scrims are strong enough to isolate the foreground over the real
  background.

## 4. Layout and responsive

- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  Zoom is never disabled.
- Holds together at 375px and at the frame's width. Test by resizing.
- No horizontal scroll on the narrow width.
- Body text at least 16px on mobile.
- Line length 45 to 75 characters. Prose has a max width.
- Spacing on a 4 or 8px rhythm. Section gaps come from a small tiered scale,
  such as 16, 24, 32, 48.
- Consistent max content width on desktop.
- Fixed or sticky bars reserve space so content is never hidden behind them.
- No nested scroll regions fighting the main scroll. Inside an iframe, the
  page flows top to bottom and never uses `100vh` layouts.
- Core content first on the narrow width. Secondary content folds below.
- Hierarchy comes from size, weight, and spacing, not color alone.
- Chips and tags wrap before they shrink. A `+n` overflow is a real control.
- Long values, URLs, and IDs wrap with `overflow-wrap: anywhere`, not
  `word-break: break-all` on prose.
- Logical properties throughout: `padding-inline`, `margin-block`,
  `inset-inline-start`.

## 5. Typography and color

- Line height 1.5 to 1.75 for body text.
- A type scale with a few steps, such as 12, 14, 16, 18, 24, 32, and the
  mock uses only those.
- Weight carries hierarchy: 600 to 700 headings, 400 body, 500 labels.
- One or two type families. If two, they are clearly different.
- Default letter spacing on body text. No tight tracking below 18px.
- Tabular figures for numbers in columns, prices, and timers.
- Wrapping over truncation. When truncating, an ellipsis plus a way to see
  the full value.
- Functional colors, such as error red and success green, always travel with
  an icon or text.

## 6. Motion

- At most one or two things move per view, and each answers a cause.
- Only `transform` and `opacity` animate. Never width, height, top, or left.
- Arrivals decelerate, exits accelerate, exits are shorter than entrances.
- State changes animate briefly rather than snapping, and never block input.
- No fade-and-slide on every section. No hover transition on every card.
- Everything is off or reduced under `prefers-reduced-motion`.

## 7. Forms and feedback

- Visible label on every field. Helper text below complex fields, persistent.
- Required fields marked.
- Errors appear below the field they belong to, linked with
  `aria-describedby`, and say what went wrong and how to fix it.
- Validation on blur, not per keystroke.
- After a failed submit with several errors, a focusable summary at the top
  linking to each field, and inline errors kept.
- Buttons show a loading state and are disabled while pending.
- Success is confirmed briefly. Destructive actions ask first and use the
  danger color, separated from the primary action.
- Undo for destructive and bulk actions where the product allows it.
- Empty states say what is missing and offer the first action.
- Semantic input types: `email`, `tel`, `number`, `url`. Autocomplete
  attributes set. Password fields have a show toggle. Paste is allowed.
- Multi-step flows show progress and allow going back.
- Read-only looks different from disabled.
- Toasts use `aria-live="polite"`, never steal focus, and dismiss in 3 to 5s.

## 8. Navigation

- Current location is highlighted.
- Every nav item has an icon and a text label. Icon-only navigation is not
  navigation.
- Bottom navigation, when used, holds at most five top-level destinations.
- Primary navigation and secondary navigation are visibly different tiers,
  and never three patterns at one level.
- Navigation placement is the same on every screen.
- Modals and sheets have an obvious close. Modals are not used to navigate.
- Breadcrumbs for hierarchies three levels or deeper on the web.
- Dangerous items, such as delete account and sign out, sit apart from
  everything else.
- When actions outgrow the space, an overflow menu, not a cram.
- A destination that is unavailable says why rather than disappearing.

## 9. Charts and data, when the mock has any

- Chart type matches the data: trend to line, comparison to bar, part of a
  whole to a bar unless there are five or fewer parts.
- Data lines at least 3:1 against the background. Labels at least 4.5:1.
- No red and green as the only pair. Patterns or shapes supplement color.
- Legend visible and near the chart. Small datasets label values directly.
- Axes labeled with units, ticks readable, gridlines quiet.
- A table alternative, or at least a text summary, for the key insight.
- Empty, loading, and error states drawn, not left as a blank axis.
- Locale-aware number and date formatting.

## Pre-delivery pass

Before reporting, confirm each of these by looking, not by recalling:

- [ ] Opened from `file://` with no network. Nothing missing.
- [ ] Scripts disabled still shows a complete default state.
- [ ] Resized to 375px and to the frame width. Nothing overflowed.
- [ ] Both themes checked, when the product has both.
- [ ] Reduced motion checked.
- [ ] Tabbed through every control. Focus visible, order sensible.
- [ ] No emoji as icons. One icon family.
- [ ] Every field labeled. Every icon control named.
- [ ] One primary action per screen.
- [ ] Held against the calibration list in `frontend-design.md`: no cream
      and terracotta, no single accented headline word, no `01 / 02 / 03`
      over content that is not a sequence, no fade-up on every section.
- [ ] Real content from the brief, no lorem ipsum, no invented numbers where
      real ones were given.
