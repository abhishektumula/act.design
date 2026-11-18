# Rehearsal: the home page illustrations (Stageshow redesign)

Three surfaces were rebuilt with the Stageshow skill (`.agents/skills/stageshow`):
the principles bento (`features.tsx`), the hero's inspector framing (`hero.tsx`),
and the closing terminal (`install-terminal.tsx`). The kit lives in `stage/`
(upstream, colours snapped to the Tailwind palette, brand marks removed, the
`all: revert` guard removed as before); `kit.ts` imports only the parts the
site uses; `stage-look.css` maps the site's tokens onto the kit's.

## Principles bento

Gold: `ruled-bento` (kept: one ruled container, mixed spans, one Stage per
tile pinned to its cell, copy as page text, one beat per tile once in view).
Changed: the site's hairline grid and Crosses frame; tiles and words are
act.design's own; every picture is measured to its slot's width *and* height,
so the gutter under the copy is the same at every width.

| Tile | Span (lg) | Kind | The one thing |
|---|---|---|---|
| File | 1 × 1 | Stat | "1 file", no motion |
| Detents | 2 × 1 | Hero UI (the only window) | the Speed fader dragged to the end: ticks light per detent, the readout steps, the knob gives 10px past the end and springs back |
| Quiet | 1 × 1 | Component | the Sound sheet: Save is clicked and becomes Saved; nothing else moves |
| Spring | 2 × 1 | Diagram | a spring curve draws in over a linear one and settles |
| Palette | 3 × 1 | Collection | the neutral scale and the signal chip, filling in left to right |

Two of five tiles are UI, chrome appears once, no kind sits beside itself
across or down, no real string repeats. Tablet: hero across, stat + quiet,
spring band, palette band. Phone: stacked, palette in two rows of six.

## Hero inspector

Layout: corner bleed (`framing.md`). From xl (1280) the window runs past the
page's right edge by a fixed share at every width, with a filler properties
column under the cut; at every width it runs off the hero's bottom through a
filler section. Every live control stays whole; Reset moved after the title so
the crop can never reach it. The "Made of the …" caption moved under the CTAs.

## Closing terminal

Gold: `ruled-bento` Create (kit `chrome="terminal"`, output lines arriving),
with an `overlap`-style card. Pinned bottom bleed. Desktop (xl): the install
command types into a layout reserved from the first frame, output prints, then
the setup guide's real `lib/utils.ts` streams into a card over the terminal's
lower half. Stacked (below xl) the cell is short, so it is a still of the
finished install, wider than tall. The closing grid now stacks below xl.

## Captured

- Widths 1440, 1280, 1100, 820 and 390; light, and the site's dark class
  (screenshots via the page's own theme toggle storage), reduced-motion posters.
- `film.mjs --gate` on `.principles` at 1440 and 390: **rehearsal passed**.
- `film.mjs --gate` on `.install-terminal` at 1440 (loop), 1280, 1100 and 390 (stills): **rehearsal passed**.
- The hero tile's beats at 300ms (`--select .pr-cell--hero`): passed.

## Film lines that stand, and why

- `kit override:` on `.ss-phone__*`, `.ss-row`, `.ss-avatar`, `.ss-toast`:
  film skips stylesheets whose path contains `/kit/`; Next bundles CSS into
  hashed chunks, so the kit's own rules were attributed to the page. No site
  CSS touches those classes. Fixed for real by importing only the parts the
  site uses (`kit.ts`), after which the bento gate passes.
- Whole-page gate, stage-1 is the hero inspector, which is an `.ss-stage`
  holding the library's *real* components: `clipped glyph` (the Dial's tick
  ring draws past its SVG box by design), `lopsided` (the Stepper's ±
  buttons), and at 390 `framing: narrower than tall` (the live panel stacks
  its controls on a phone; cropping it would cut working controls). These are
  the components themselves, not the illustration, and predate this branch.
- The hydration-mismatch overlay seen while filming comes from film tagging
  stages before hydration; a plain load logs no errors.
- `settle snap` on the terminal caret: the typing caret hands off to the next
  prompt's caret when the command finishes.

## Not checked

- Touch input on a device; Safari and Firefox (Chrome only).
- `--dark` in film emulates the OS preference, while the site themes by a
  class, so dark was checked by screenshots, not filmed loops.
- A fresh-eye review (`review.md`) by a second reviewer.
