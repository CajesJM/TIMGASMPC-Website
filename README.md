# TIMGAS Multi-Purpose Cooperative Frontend

A responsive, frontend-first cooperative website built with React, TypeScript, Vite, CSS Modules, React Router, React Hook Form, Zod, TanStack Query, and Lucide icons.

## Local development

```bash
npm install
npm run dev
```

Open the URL shown by Vite. Public application submission remains unavailable until TIMGAS provides its official form format.

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

## Firebase manager setup

1. Create or select a Firebase project and register a Web app.
2. Enable Authentication → Email/Password.
3. Create the first manager user in Firebase Authentication.
4. Assign that user the custom claim `admin: true` using a trusted Admin SDK environment. Never place service-account credentials in this repository or browser code.
5. Copy `.env.example` to `.env` and fill in the Firebase Web app configuration.
6. Reauthenticate the CLI with `firebase login --reauth`, then bind the project with `firebase use --add`.
7. Deploy deny-by-default rules with `firebase deploy --only firestore:rules,storage`.

The dashboard route verifies both Firebase Authentication and the `admin: true` claim. Firestore and Storage rules enforce the same claim server-side. The next backend phase should replace dashboard placeholder figures with Firestore queries and implement public application submission through a validated Cloud Function after the official form is received.
