# TIMGAS Multi-Purpose Cooperative Frontend

A responsive, frontend-first cooperative website built with React, TypeScript, Vite, CSS Modules, React Router, React Hook Form, Zod, TanStack Query, and Lucide icons.

## Local development

```bash
npm install
npm run dev
```

Open the URL shown by Vite. Public application submission and manager authentication are intentionally preview-only until Firebase is configured.

## Quality checks

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Frontend structure

- `src/components` — reusable interface components with colocated CSS Modules
- `src/layouts` — page-level layout shells
- `src/pages` — route-level features
- `src/data` — typed placeholder content to be replaced by Firestore queries
- `src/styles` — design tokens and minimal global styles
- `src/assets` — project-owned static assets

## Backend handoff

The next phase should replace mock content with Firebase services, submit applications through a validated TypeScript Cloud Function, protect manager routes using the `admin: true` custom claim, and connect private Cloud Storage uploads. Environment variable names are listed in `.env.example`; no secrets are included.
