# LMS roadmap status

This checklist tracks the roadmap supplied with the project. It records what is implemented in the repository and what still needs work or an external environment.

## Phase 1 — Core platform

- [x] Public, auth, and protected dashboard layouts; signed-in users see role-aware navigation on course pages.
- [x] Login session hydration, logout, expired-token handling, and immediate role refresh from the database.
- [x] Course and lesson CRUD paths with API response shapes aligned to the frontend.
- [x] Enrollment checks before students can view lessons; ownership is enforced on writes.
- [x] Loading, empty, and structured error states for course and lesson flows.
- [ ] Manual database-backed verification for every role and CRUD path.

## Phase 2 — Frontend quality

- [x] Responsive header, mobile menu, active sidebar state, and menus limited by role.
- [x] Course cards show category, instructor, price, and thumbnail/fallback treatment.
- [x] Course search, category filter, price sort, and client-side pagination.
- [x] Course loading skeleton, retry action, empty state, and inline form validation.
- [ ] Add course taxonomy management and server-side pagination if the catalog grows beyond a small demo.

## Phase 3 — Learning experience

- [x] Course detail, enrollment, My Courses, lesson viewing, and lesson completion tracking.
- [x] Course progress percentage and progress display.
- [ ] Role-specific dashboard metrics.
- [ ] Draft, published, and archived course lifecycle.
- [ ] Rich lesson content and file upload.

## Phase 4 — Security and reliability

- [x] Backend role, ownership, and enrollment checks; current account roles are reloaded for protected requests.
- [x] Input limits and validation; parameterized SQL; consistent API error responses and bounded JSON bodies.
- [x] JWT secret, database, CORS, port, and API URL configuration through environment variables.
- [x] One-day JWT expiry and session clearing on 401.
- [ ] Replace localStorage bearer tokens with secure HttpOnly cookies before production use with sensitive learner data.

## Phase 5 — Quality checks

- [x] Backend validation and role/auth middleware unit tests.
- [x] Frontend ESLint and TypeScript checks; backend TypeScript checks.
- [x] GitHub Actions checks for tests, typechecks, lint, and builds.
- [ ] Add database-backed API and browser end-to-end tests with disposable test data.

## Phase 6 — Portfolio and deployment

- [x] Setup instructions, architecture/authentication diagrams, environment examples, schema, and migration notes.
- [ ] Add screenshots and a demo account after seeding a safe sample database.
- [ ] Configure production hosting, managed database, backups, HTTPS, and deployment secrets.

The database schema in `docs/database.sql` is for a new installation. Existing installations should apply the relevant SQL in `docs/migrations` once before running code that uses the added columns and tables.
