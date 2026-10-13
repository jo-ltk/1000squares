---
name: "brand-system-to-website"
description: "Turn uploaded brand files and reference images into a design system, then a responsive desktop and mobile landing page and product listing page on a design canvas."
---

# Brand files → design system → website designs

Use when someone uploads a logo plus mood references (a site they like, button or icon styles) and wants a design system and then website pages built from it.

## 1. Sort the uploads before building

- Decide which files are the brand (usually only the logo) and which are mood references (a reference website, button styles, icon renders).
- Sample exact colours from the logo with PIL: ink, accent, tints. Those are the core palette. Reference colours become accents only if the user wants them.
- Ask one short round of questions with AskUserQuestion, only for things the files don't show:
  - how to use each reference;
  - which fonts to use when no font files were sent (suggest a Google Fonts pairing that matches the reference);
  - whether the logo is raster-only.
- If the user answers loosely (for example "like that site, with those buttons in our colours"), take that as the direction. State your assumptions in the final reply.

## 2. Build the design system (Design System artifact)

- **Colour tokens:** light and dark themes. Check every text-on-ground pair for contrast (4.5:1) with a quick Python script, in both themes.
- **Type:** a condensed display face for UPPERCASE headlines and a grotesk for UI. Record hosted Google fonts in `type.families` only.
- **Button material:** turn a reference finish such as grainy glass into CSS:
  - a gradient body;
  - an inset top highlight;
  - a coloured drop shadow, kept as shadow tokens;
  - an SVG `feTurbulence` grain overlay on `::after`, with its opacity as a token.
  - Offer tones in the brand colours: primary accent, soft tint, ink, frost.
- **One button curve.** Every button at every size uses a single radius token. That covers CTA, icon button, FAB and card save buttons, plus inputs and selects. A shape nested inside a button uses `radius - inset`. Only pills, discs and toolbar slots stay round. Users notice mismatched corners right away.
- **Components:** one per pattern in the references (nav bar, CTA with arrow box, numbered index list, section header, hero title with an inline image chip, logo strip, toolbar, colour swatches). Add a product card as a stated "intentional addition" if it's a marketplace. Bundle them as one classic script `window.<Namespace>`, plus `bundle.css`, `index.d.ts` and a README and preview for each component.
- **Logo:** upload the cropped PNG as an asset. For dark grounds, make a reversed copy and a see-through copy with PIL: ink pixels become white, the accent pixels stay, the background goes transparent, and alpha is scaled so solid areas reach 255. Tell the user these are derived copies.
- **Iconography:** if the references use Material-style glyphs, use Material Icons (Apache-2.0) paths and flag it as a substitution.
- **Before publishing:** render every preview in light and dark with Playwright and look at the screenshots.

## 3. Build the pages (Design canvas)

- Install the design system on the canvas:
  - copy `tokens.json` and the bundle with `{artifact, path}` file entries;
  - write `ds/<ns>/tokens.css` yourself if the system has none;
  - add the `designSystems` record.
- Upload the user's images (hero photo, inline-chip photo, logo copies) as assets. Use the reversed logo in navigation over photos.
- Artboards:
  - `Main.dc.html` landing page and `Listing.dc.html` product listing, both `expand: "fill"` with `is_interactive: true`;
  - mobile 390px boards: `MobileHome`, and `MobileListing` with a bottom-sheet filter panel and a glass tab bar.
- Mount the real components with `<x-import component-from-global-scope="Ns.Comp">`, and give arrays and objects as `{{holes}}` from `renderVals()`. Override colours in `<helmet><style>` for components that sit on photos.
- Make the listing interactive: occasion pills, style checkboxes with counts, a colour swatch filter, a sort select and an empty state, all held in component state.
- Use placeholders such as `₹ [PRICE]`, `[Date]`, `[TOTAL]` and `[Press logo]` for facts nobody gave you.

## 4. Responsive rules (learned the hard way)

- **Desktop container:** `max-width: 2160px` with side padding `clamp(16px, 4.5vw, 96px)`. Section spacing `clamp(72px, 7vw, 160px)`. Avoid a fixed ~1340px container; it looks empty on ultrawide screens.
- **Type scales with clamp:** hero display `clamp(48px, 7.6vw, 176px)`, h1 `clamp(44px, 4.8vw, 112px)`, section titles `clamp(34px, 3.1vw, 72px)`, body `clamp(15px, .45vw + 9px, 20px)`.
- **Product grid:** explicit breakpoints, not `auto-fill`:

| Width | Columns |
|---|---|
| Under 560px | 1 |
| 560px and up | 2 |
| 900px and up | 3 |
| 1280px and up | 4 |
| 1800px and up | 5 |

  Wrap each card in a `.tcell` and hide extra cards with `:nth-child` so no row is ragged.
- **Flex children with a large `flex-basis`** need `min-width: 0`, or they overflow at 320px. Toolbars wrap under 560px. Hide the nav CTA under 560px.
- **Never size a canvas board's hero with `vh`/`svh`:** on the canvas the viewport is the whole board, so the hero stretches thousands of px. Use a fixed or `clamp(..., vw, ...)` min-height.
- **Mobile hero buttons:** 44px tall, side by side (`flex: 1 1 140px`), short labels, `box-sizing: border-box`.

## 5. Test when the user asks for testing

- Serve the canvas files locally:
  - `support.js` = the type's `artifact-type/dc-runtime.js`;
  - copy the ds files;
  - map `/_blob/<id>` paths to the local image files;
  - run `python3 -m http.server`.
- Load each page with Playwright at 320, 390, 768, 1024, 1440, 1920 and 2560px. Measure `scrollWidth` against `clientWidth` and list elements whose right edge passes the viewport (ignore children of the logo strip, which clips them). Also measure grid cell widths and computed font sizes, then screenshot.
- Fonts may not load offline. Say so, because Anton renders narrower than its fallback.

## 6. Editing etiquette

- Read the live file before editing; the user may have edited it on the canvas. If a publish is refused, read the files it names and redo the edit on them.
- Change the design system first, then re-copy its files into the canvas so both stay in sync. Update the index's `lastChange` on every design system change.
- Reply with what changed, what was assumed or derived, and what still needs real content. Don't paste URLs.
## 7. Export the pages to code (Next.js + static HTML)

When the user wants the pages as code:

- Scaffold a Next.js 14 App Router project in plain JS:
  - `package.json` pinned to `next@14.2.15`, `react@18.3.1` and `react-dom@18.3.1`;
  - `next.config.mjs` with `output: 'export'`, `images.unoptimized` and `trailingSlash`, so `npm run build` also writes static HTML to `out/`;
  - `jsconfig.json` with the `@/*` alias.
- `app/ds.css` = the design system's `tokens.css` followed by `bundle.css`, minus its font `@import`. Load Google Fonts with a `<link>` in `app/layout.jsx`.
- `components/ui.jsx` (`'use client'`): port every design-system component from `bundle.js` to JSX, using the same class names. Add a `TabBar` for mobile, and keep `TemplateCard`'s save toggle in local state.
- `data/templates.js` holds the dummy catalogue, occasions, styles, tints and press names, plus `formatPrice` (₹, en-IN).
- **One responsive page per route; never ship separate mobile pages.**
  - `app/page.jsx`: the landing page.
  - `app/templates/page.jsx`: the listing page, rendering a client `ListingClient.jsx` that holds the filter, sort and sheet state.
  - Mobile differences live in `app/site.css` media queries:
    - under 900px, the sidebar becomes a sticky toolbar with a bottom-sheet filter panel (Escape closes it, page scroll is locked);
    - under 760px, the tab bar appears and nav links hide;
    - under 560px, the trending grid becomes a swipe rail and the listing grid becomes a compact 2-up.
- Page files may only export the page and `metadata`; put shared pieces such as `SiteFooter` in `components/`.
- **Verify the code:**
  - run `npx next build`;
  - serve `out/` and load `/` and `/templates/` with Playwright at 320, 390, 768, 1024, 1440, 1920 and 2560px;
  - check there is no horizontal overflow, that the tab bar or sidebar shows at the right widths, and that the sheet filters and closes.
- **Package:** zip the project without `node_modules` or `.next`. Include `out/` as `static-html/` and this skill under `skill/`.
