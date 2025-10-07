## FIVT Monorepo – AI Agent Working Guide

Purpose: Enable an AI coding agent to contribute productively and safely within ~1 minute. Focus on what is unique here (Turborepo + Next.js 15 App Router, Prisma, Auth, i18n, financial domain models, custom scripts).

### 1. Repository & Architecture Overview

- Monorepo managed by Turborepo (`turbo.json`). Apps: `apps/webapp` (primary product), `apps/docs` (docs site). Shared packages: `packages/ui` (React components), `packages/eslint-config`, `packages/typescript-config`.
- Tech Stack: Next.js 15 (App Router, React 19), TypeScript, Prisma (PostgreSQL), NextAuth v5 beta (magic link + Google), next-intl for i18n, Vitest (unit), Playwright (e2e), Tailwind CSS v4, Radix UI primitives, React Query for data fetching / caching, OpenAI integration for AI features.
- Domain Models (Prisma): Users, Accounts (OAuth), Sessions, Categories, Transactions, Bridge*/Powens* financial aggregation entities (external banking providers). See `apps/webapp/prisma/schema.prisma` for authoritative schema.

### 2. Execution & Core Workflows

- Install (root): `pnpm install` (Node >=18, pnpm@9). Postinstall in webapp runs `prisma generate`.
- Dev (root aggregate): `pnpm dev` → `turbo run dev` (not cached). Typically focus on webapp: run from `apps/webapp`: `pnpm dev` (Turbopack, port 3000) or use PowerShell helper: `./scripts/dev.ps1 dev`.
- Full local CI-style check (webapp): `./scripts/dev.ps1 all` (install → typecheck → lint → test → build). Prefer this before committing.
- Build all: `pnpm build` (turbo). Each task inherits env constraints defined in `turbo.json`.
- Unit tests: `pnpm test:unit` (Vitest) inside `apps/webapp` or `pnpm test:unit` at root (turbo pipeline). E2E: `pnpm test:e2e` (requires built app & Playwright browsers).
- Type checking: `pnpm check-types` (tsc --noEmit) or integrated in scripts.

### 3. Environment & Configuration

- Critical env vars surfaced in `turbo.json` task `env`/`globalEnv`: Auth (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, magic link RESEND*), Database (`DATABASE_URL`), External Banking (`BRIDGE_*`, `POWENS_*` + `POWENS_API_BASE`), Deployment (`VERCEL_PROJECT_PRODUCTION_URL`, `NEXTAUTH_URL`). Do NOT hardcode; reference via `process.env.*`.
- Host/port logic: `apps/webapp/src/config.ts` picks production host via `VERCEL_PROJECT_PRODUCTION_URL`, fallback `http://localhost:3000`.
- **MANDATORY i18n**: next-intl middleware (`src/middleware.ts`) auto localizes all non-excluded routes. ALWAYS use `useTranslations()` hook for all user-facing text in components and pages. Message keys should be added to `messages/en.json`, `messages/fr.json`, `messages/vi.json`. Avoid manual locale prefixes in redirects; use relative paths so middleware re-writes. Exclusions: API routes, protected dashboard/banking routes, static assets.

### 4. Authentication Pattern

- Centralized in `apps/webapp/src/auth.ts` using NextAuth v5 beta with PrismaAdapter.
- Providers: Resend (custom `sendVerificationRequest` – keep async error handling & HTML template render via `@react-email/render`) + Google OAuth. When adding providers, follow existing array structure and ensure required secrets added to `turbo.json` env arrays if build-time required.
- Session callback augments `session.user.id`. Maintain this pattern when enriching session—always check for `session.user` existence.

### 5. Data Layer & Server Actions

- Prisma client factory lives under `apps/webapp/src/lib/prisma` (not shown here—assume singleton). Always reuse; never instantiate new PrismaClient per request.
- Server Actions: Marked with `'use server'` (e.g., `src/actions/category.ts`, `src/actions/transaction.ts`). Conventions:
  - First: authenticate via `auth()`; throw or return `{ success:false }` on missing user.
  - Validate foreign keys (see `createTransaction` category existence check) before create.
  - Return shape: either `{ success: true, data: ... }` or `{ success:false, error:string }` (note `createTransaction` currently returns `{ data: {...} }` without explicit success flag—follow existing file-specific pattern for consistency or consider normalizing if refactoring across all actions).
  - For Decimal fields, convert to string before returning to avoid serialization issues (`amount: transaction.amount.toString()`). Preserve this.

### 6. Domain Notes

- Financial integrations (Bridge*, Powens* entities) are mapped in Prisma with snake-case DB table mapping via `@@map`. If adding migrations for new external provider models, mirror naming (e.g., `<provider>_users`, `<provider>_accounts`). Maintain referential integrity to `User` with `onDelete: Cascade`.
- Amount precision: `Decimal(10,2)` for `Transaction.amount` — enforce two decimal places in any new validation utilities.

### 7. UI / Shared Packages

- Shared UI components under `packages/ui/src/*` can be imported via `@repo/ui`. Keep components framework-agnostic (no direct app router dependencies) & typed.
- ESLint + TypeScript configs centralized (`packages/eslint-config`, `packages/typescript-config`). Extend rather than duplicating per package.

### 7a. Route-Scoped Modular Structure (Underscore Folders)

- Feature / route segments under `apps/webapp/src/app/(protected)/(dashboard)/<feature>` use collocated underscore-prefixed folders to separate concerns:
  - `_components`: Presentational + small stateful UI pieces (e.g., `create-transaction-form.tsx`, `powens-link.tsx`). Avoid business logic here.
  - `_hooks`: React Query + state hooks wrapping services (`use-transaction.ts`, `use-categories.ts`, `use-profile.ts`). Each mutation/query maps 1:1 to a service call and handles cache invalidation.
  - `_services`: Thin API/client layer (e.g., `transaction-service.ts`, `category-service.ts`) performing fetch/server action invocation + minimal shaping. No React imports.
  - `_validations`: Zod schemas & inferred TS types (`transaction-schema.ts`). Keep naming `<entity>-schema.ts` and export both schema + `type`.
  - `_types`: Shared local domain types for that module (e.g., `Transaction`, `MonthOption`, `PowensLinkProps`). Prefer importing Prisma enums directly instead of duplicating.
  - `_utils`: Pure helpers referencing `_types` (e.g., date/month mapping utilities) – must stay side-effect free.
- Import order preference inside module code: external libs → shared packages (`@repo/ui`) → cross-module imports → local module folders (`../_types`, `../_services/...`) → same-folder relatives.
- When adding a new feature, replicate this structure; only create folders actually needed (avoid empty placeholders).
- Cross-module sharing: if logic becomes generic (used in >1 feature), promote to `src/lib` (utilities) or `packages/ui` (visual component) instead of reaching across feature boundaries.
- Keep server actions OUT of `_services` (they live globally in `src/actions`); services call them via fetch or direct import if server-only.

### 8. Testing Conventions

- **MANDATORY**: Always generate unit tests when creating new components or pages. Unit test files may live under `src/**` with `.test.` or `.spec.` suffix or in `tests/` (see `turbo.json` inputs). When adding new tests, follow those globs to ensure cache invalidation.
- Test structure: Use Vitest + React Testing Library for components. Test props, user interactions, and i18n message rendering. Mock server actions and external services.
- Playwright E2E config: `apps/webapp/playwright.config.ts` (not inspected here; assume standard). Requires build; `test:e2e` depends on `^build` via turbo.
- Prefer Vitest for React component / server action logic; mock Prisma cautiously (or use a test db URL). Avoid global new PrismaClient instances.

### 8a. Forms, Validation & Data Fetching Patterns

- React Query setup: Query client provider (see likely `client-provider.tsx`) wraps protected areas. Query keys include locale: e.g. `['categories', locale]`, `['transactions', locale]` enabling locale-scoped caches.
- Mutations (`useCreateCategory`, `useCreateTransaction`) always `invalidateQueries` with matching locale key to refresh lists after create.
- Keep `staleTime` (currently 5 min) consistent when introducing new list queries; reuse existing pattern for cache timing.
- react-hook-form + zod: Forms (e.g., `create-transaction-form.tsx`) use `useForm` with `zodResolver(createTransactionSchema)`; schemas live under `_validations/*-schema.ts`. Coerce numeric input via `z.coerce.number()` and enforce business rules (positive amounts, max description length). Follow this folder co-location pattern when adding new forms.
- Dynamic select pattern: categories select supports inline creation via sentinel value `'__new__'`; preserve this UX when adding similar cascade-creation selects.
- Zod -> JSON schema: Financial recipe schema (`src/lib/recipeFinancialSchema.ts`) converts to JSON via `zodToJsonSchema` for API/LLM use. If adding schemas requiring external consumption, export both original Zod schema and derived JSON schema with `<Name>JsonSchema` naming.
- Framer Motion: Imported as `motion` in UI pages/components (e.g., profile pages) for progressive animations. Keep animations declarative and avoid server components; wrap only client components (`'use client'` present) to prevent hydration mismatch.

### 9. Performance & Caching Considerations

- Turborepo caches build/lint/typecheck/test tasks unless `cache:false` (dev, watch, clean). If you introduce new tasks, decide whether outputs should be cached and declare env dependencies explicitly.
- Add any env var needed at build time to appropriate task `env` array; otherwise turbo may produce nondeterministic caching across contributors.

### 10. Adding New Features (Example Workflow)

1. Define/extend schema in `apps/webapp/prisma/schema.prisma`; run `pnpm prisma migrate dev --name add_<feature>` inside webapp.
2. Export server action in `src/actions/<feature>.ts` following auth + validation + return pattern.
3. Create UI component(s) in `apps/webapp/src/components/...` or shared `packages/ui` if generic.
4. **MANDATORY**: Add i18n message keys to all three locale files (`messages/en.json`, `messages/fr.json`, `messages/vi.json`) and use `useTranslations()` in components.
5. **MANDATORY**: Write unit test in same folder (`*.test.ts(x)`) or under `tests/` covering component props, user interactions, and i18n message rendering.
6. Run `./scripts/dev.ps1 all` before commit.

### 11. Safe Change Guidelines (Project-Specific)

- Never remove an env var from `turbo.json` without checking tasks that rely on it (auth/email/banking would silently break in build).
- Maintain the session enrichment pattern (`session.user.id`) or downstream server actions expecting `user.id` will fail.
- Preserve decimal-to-string conversions for transactions in server action returns to avoid Next serialization errors.
- When adjusting middleware route exclusions, ensure i18n routing still matches fallback pattern `/((?!api|...).*)`.

### 12. Things NOT To Do

- Do not introduce ad-hoc Prisma clients.
- Do not hardcode provider secrets or magic link email HTML inline; keep using templated render path.
- Do not add global polyfills or experimental flags without updating this file & root README if they affect build tasks.
- **NEVER create components or pages without i18n** - all user-facing text must use `useTranslations()` hook.
- **NEVER create components or pages without unit tests** - every new component/page requires corresponding test file.

### 13. Quick Reference

- Auth file: `apps/webapp/src/auth.ts`
- Middleware (i18n): `apps/webapp/src/middleware.ts`
- Server actions: `apps/webapp/src/actions/*`
- Prisma schema: `apps/webapp/prisma/schema.prisma`
- Dev scripts: `apps/webapp/scripts/dev.ps1` / `dev.sh`
- Turbo tasks: `turbo.json`
- Module pattern: `(route)/_components|_hooks|_services|_validations|_types|_utils`
- Query client setup: `apps/webapp/src/app/(protected)/client-provider.tsx`
- Config: `apps/webapp/src/config.ts` (hosts, routes)

---

Feedback welcome: If any convention above is outdated or unclear, specify the section number so it can be refined.
