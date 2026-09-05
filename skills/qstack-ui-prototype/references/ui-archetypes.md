# UI archetypes

Find the row closest to the product before making a visual choice. The row
sets three dials and names the mistakes that product type usually makes. It is
a starting position, not a rule: the brief and the existing design override it.

The dials:

- **Density.** How much information one screen carries. Low is a landing page
  with one message. High is a trading desk.
- **Motion.** How much moves without being asked. Low is nothing but a focus
  ring. High is one orchestrated reveal on load.
- **Restraint.** How far the design may stray from the plain, expected form.
  High restraint is an internal tool that must not surprise anyone. Low
  restraint is a brand page that is allowed to take a risk.

| Archetype | Density | Motion | Restraint | The screen's job | Anti-patterns for this type |
| --- | --- | --- | --- | --- | --- |
| Internal ops tool | high | low | high | Let one person finish a task they do forty times a day without thinking about the interface | Hero sections, marketing copy, cards for tabular data, decorative color, anything that costs a click |
| Admin or settings screen | medium | low | high | Show current state and let it be changed safely | Burying the save action, toggles with no labels, settings spread across tabs to look organized |
| Analytics dashboard | high | low | high | Answer "how are we doing" in one glance, then let the reader drill | Gauges and donuts, one color per metric, decorative gradients on charts, KPI tiles with no comparison |
| Data table or list view | high | low | high | Scan, sort, filter, and pick one row | Card grids for rows, truncation without a way to see the full value, fixed-width columns, actions hidden behind hover only |
| Form or multi-step flow | medium | low | high | Get correct input with the least friction and recover from mistakes | Placeholder-only labels, validation on every keystroke, errors only at the top, progress bars with no back |
| Developer tool or console | high | low | high | Show exact state and exact output; be quiet | Rounded friendliness, hidden IDs, prose where a monospaced value belongs, color used for status alone |
| CLI or terminal output | high | none | high | Be readable at 80 columns and pipeable | Boxes and emoji, color with no NO_COLOR fallback, alignment that breaks on long values |
| Documentation or reference site | medium | none | high | Get the reader to the answer and out | Marketing hero above the docs, sidebars that collapse the section you are in, code blocks without copy |
| Marketing or landing page | low | medium | low | Make one thing clear and one action obvious | Three-column feature grids, a stat row with a gradient accent, one italic word in the headline, fade-up on every section |
| Consumer mobile app screen | medium | medium | medium | One task per screen, reachable with a thumb | Desktop patterns shrunk down, targets under 44pt, primary action out of thumb reach, gestures with no visible alternative |
| Editor or canvas tool | medium | low | high | Get out of the way of the content | Chrome that competes with the canvas, panels that cannot be hidden, unlabelled icon toolbars |
| Notification, email, or transactional message | low | none | high | Say what happened and what to do in the first two lines | Branding above the message, images that carry the meaning, three calls to action |
| Onboarding or empty state | low | low | medium | Get the person to their first real action | Illustration with no next step, a tour before there is anything to tour, an empty table with no way to fill it |

## How to use a row

1. Pick the closest row. If two fit, the one describing the screen's job
   wins over the one describing the product.
2. Set the three dials from the row. Write them in the brief.
3. Read the anti-pattern cell as a list of things to remove from the first
   draft, because the first draft will contain some of them.
4. Let the existing design override the dials when the product already has
   one. A restrained internal tool inside a playful brand stays playful in
   its tokens and restrained in its layout.

The row is derived from what the plan says the screen does, in plain words.
It is not a lookup from a catalog, and the mock should not look like the
archetype. It should look like this product.
