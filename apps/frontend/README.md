# Frontend

Next.js App Router client for the LMS API. See the root [README](../../README.md) for setup, database initialization, role flows, and project architecture.

## Local development

Copy `.env.example` to `.env.local`, install dependencies, and run:

```bash
npm ci
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the API base URL, including `/api`.

## Code areas

- `src/app`: public, auth, and protected dashboard routes and layouts.
- `src/components`: shared layouts, course and lesson UI, and form controls.
- `src/services`: API requests.
- `src/schemas`: client-side Zod validation.
- `src/types`: API and domain types.
- `src/context`: authentication state.
