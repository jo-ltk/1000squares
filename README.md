# 1000squares

Responsive Next.js App Router application based on the supplied 1000SQUARES landing, wedding-template listing, saved-items, and account mockups. The UI is written in TypeScript and shares components, design tokens, and assets across routes.

## Routes

- `/` — Landing page with the original hero, trending templates, press strip, studio preview, and story section.
- `/templates/` — Product listing with occasion, style, colour, format, and sort controls. Invitation previews flip to show details; on smaller screens the filters open in a bottom sheet.
- `/saved/` — Saved templates and sample design drafts. Saved items sync between pages in browser storage.
- `/account/` — Responsive sample account screen with editable demo profile and notification toggles.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run build      # production build
npm start          # production server
```

The production build uses the Next.js server. It can be deployed to a Node.js host that supports Next.js.

## Project structure

```text
app/
  account/          Account route
  saved/            Saved route
  templates/        Listing route and client-side filters
  layout.tsx        Root layout, metadata, and self-hosted fonts
  page.tsx          Landing route
  ds.css            Design-system tokens and component styles
  site.css          Responsive page styles and motion
components/
  FlipCard.tsx       Draggable, tilt-enabled invitation preview card
  FlipCard.css
  SavedTemplatesProvider.tsx
  SiteFooter.tsx
  icons.ts
  ui.tsx
data/
  templates.ts      Sample catalogue, occasions, colours, and press names
public/
  images/           Source hero, handshake, and logo images
```

The original downloaded HTML folders remain alongside this project. The image files in `public/images/` are copied from those exports. Anton and Archivo are loaded with `next/font` using the font families referenced by the HTML mockups.

## Demo data and services

The supplied pages are visual mockups, so the catalogue and account details are sample content. Saved templates and edited profile details persist in the current browser. Newsletter submission validates the email and shows a local confirmation; connect a mailing provider, account service, catalogue, and checkout before using real customer data or taking orders.

CSS motion follows the source designs and respects `prefers-reduced-motion`.
