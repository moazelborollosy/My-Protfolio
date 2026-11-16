# Moaz Elborollosy — Mechatronics Portfolio

Finished React + TypeScript portfolio with an autonomous canvas network, responsive layouts, project filtering and expandable project details.

## Run locally

Use Node.js 22.12+ or 24 LTS.

```bash
npm ci
npm run dev
```

## Build and preview

```bash
npm run build
npm run preview
```

Upload the contents of `dist/` to any static website host. Relative asset paths support subdirectory deployments, including GitHub Pages. Do not open `dist/index.html` directly with the file:// protocol; use a web server.

The included `dist/` folder is a ready-to-host production build. No database, backend, API key, or environment variable is required.

## Content and editing

- `src/data/portfolio.ts`: project descriptions, skills, contact and repository links.
- `src/components/`: individual sections.
- `src/index.css`: layout, colors and animation.
- `public/assets/Moaz-Elborollosy-CV.pdf`: latest supplied CV.

Content is based on the supplied September 27, 2026 CV. The Assembly Interpreter and Clans of the Eclipse repositories were checked against public GitHub content. LinkedIn blocked access to individual project posts; the site links to the supplied profile instead. No project photographs or CAD renders were available in the supplied archive. The homepage uses the supplied transparent portrait PNG over the live network background, with a subtle fade at the bottom to blend into the page.

The contact section opens the visitor's email application and offers a copy-email button. It does not claim a message has been sent. There is no contact-form backend or tracking.

The CV is the supplied PDF, unchanged. Its internal project links contain placeholder file destinations; the portfolio's repository and profile links are valid URLs independently of the PDF.

Reduced-motion settings are respected. The network runs autonomously without mouse, hover or scroll listeners. Mobile navigation supports Escape to close; all filters, project disclosures and links are keyboard accessible.

## Verification

```bash
npm run build
npm run lint
```

Production build and ESLint passed. Automated browser inspection was attempted but the execution environment blocked Chromium from starting, so visual and interaction checks could not be completed here.
