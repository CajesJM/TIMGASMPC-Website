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
- `src/data` — typed public-site content supplied or confirmed by TIMGAS MPC
- `src/styles` — design tokens and minimal global styles
- `src/assets` — project-owned static assets

## Firebase manager setup

1. Create or select a Firebase project and register a Web app.
2. Enable Authentication → Email/Password.
3. Create the first manager user in Firebase Authentication.
4. Assign that user the custom claim `admin: true` using a trusted Admin SDK environment. Never place service-account credentials in this repository or browser code.
5. Copy `.env.example` to `.env` and fill in the Firebase Web app configuration.
6. Reauthenticate the CLI with `firebase login --reauth`, then bind the project with `firebase use --add`.
7. Deploy admin-only Firestore rules with `firebase deploy --only firestore:rules,firestore:indexes`.

The dashboard route verifies both Firebase Authentication and the `admin: true` claim. Firestore rules enforce the same claim server-side. The dashboard reads these collections without creating sample or fabricated records:

- `applications` — `reference`, `applicantName`, `applicationType`, `submittedAt`, and `status`
- `members` — one document per authorized member record
- `adminProfiles` — manager name, position, contact number, and authentication email
- `posts` — announcements, news, achievements, and certifications with a publication date,
  title, description, optional Storage photo, and `published` status

The application workflow remains disabled until TIMGAS supplies the official form. Its public submission rules and any file-storage requirements must be designed before accepting personal information.

## Public post publishing

The manager dashboard provides CRUD controls for the `posts` collection. Only
an authenticated user with the `admin: true` custom claim can publish or edit
content. Published updates are readable in the public News section, while
certifications appear in their own public section near About. Optional
JPEG, PNG, and WebP photos are stored under `posts/{postId}/` with a 5 MB limit;
only administrators can upload or delete them.
