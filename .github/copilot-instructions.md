## FIVT Monorepo – AI Agent Working Guide

Purpose: Enable an AI coding agent to contribute productively and safely within ~1 minute. Focus on what is unique here (Turborepo + Next.js 15 App Router, Prisma, Auth, i18n, financial domain models, subscription system, modular architecture).

### 1. Repository & Architecture Overview

- **Monorepo Structure**: Managed by Turborepo (`turbo.json`). Apps: `apps/webapp` (primary product), `apps/docs` (docs site). Shared packages: `packages/ui` (React components), `packages/eslint-config`, `packages/typescript-config`.
- **Tech Stack**: Next.js 15 (App Router, React 19), TypeScript, Prisma (PostgreSQL), NextAuth v5 beta (magic link + Google), next-intl for i18n, Vitest (unit), Playwright (e2e), Tailwind CSS v4, Radix UI primitives + shadcn/ui components, React Query for data fetching/caching, OpenAI integration for financial chatbot.
- **Domain Models** (Prisma schema): Users, Accounts (OAuth), Sessions, Categories, Transactions, Bridge*/Powens* financial aggregation entities (external banking providers), Subscription system (Service, UserSubscription, SubscriptionPlan). See `apps/webapp/prisma/schema.prisma` for authoritative schema.
- **Package Manager**: pnpm@9 required (Node >=18). Workspace configuration in `pnpm-workspace.yaml`.

### 2. Execution & Core Workflows

- **Install** (root): `pnpm install` (Node >=18, pnpm@9 required). Postinstall in webapp runs `prisma generate`.
- **Dev Server**: From `apps/webapp`: `pnpm dev` (Turbopack on port 3000). Or root: `pnpm dev` (runs all apps, not cached).
- **Build**: Root: `pnpm build` (turbo builds all). Each task inherits env constraints from `turbo.json`.
- **Tests**:
  - Unit: `pnpm test:unit` (Vitest) - from webapp or root (turbo pipeline)
  - E2E: `pnpm test:e2e` (Playwright, requires `^build` dependency)
  - Coverage: `pnpm test:coverage` (V8 provider, 80% thresholds)
  - Watch: `pnpm test:watch` (uncached, persistent)
- **Type Checking**: `pnpm check-types` (tsc --noEmit, all packages).
- **Linting**: `pnpm lint` (ESLint with `--max-warnings 0`).
- **Clean**: `pnpm clean` (removes `.next`, `.turbo`, uncached).

### 3. Environment & Configuration

- **Critical env vars** in `turbo.json` task `env`/`globalEnv`:
  - Auth: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, `AUTH_RESEND_FROM`
  - Database: `DATABASE_URL`
  - External Banking: `BRIDGE_*`, `POWENS_*`, `POWENS_API_BASE`
  - Deployment: `VERCEL_PROJECT_PRODUCTION_URL`, `NEXTAUTH_URL`
  - AI: `OPENAI_API_KEY`
  - Do NOT hardcode; reference via `process.env.*`
- **Host/port logic**: `apps/webapp/src/config.ts` picks production host via `VERCEL_PROJECT_PRODUCTION_URL`, fallback `http://localhost:3000`.
- **MANDATORY i18n**: next-intl with routing config (`src/i18n/routing.ts`) using `localePrefix: 'never'` strategy (no URL prefixes). ALWAYS use `useTranslations()` hook for all user-facing text. Message keys must exist in `messages/en.json`, `messages/fr.json`, `messages/vi.json`. Locale detection via `src/i18n/request.ts`.

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

### 6a. AI/Chatbot Feature

- Financial chatbot at `/chatbot` using OpenAI API (`src/app/api/chat/route.ts`) with intent detection and response caching.
- Chat routes defined in `src/config/routes/chat.ts` with utility functions (`isChatRoute`, `isChatApiRoute`, `getChatSessionRoute`).
- Streaming chat responses via service layer (`_services/chat-service.ts`) with React Query mutations in `_hooks/use-chat.ts`.
- Multi-language support: responses adapt to user locale (en/fr/vi) with appropriate messaging for unsupported intents.

### 7. UI / Shared Packages

- Shared UI components under `packages/ui/src/*` can be imported via `@repo/ui`. Keep components framework-agnostic (no direct app router dependencies) & typed.
- shadcn/ui components in `apps/webapp/src/components/ui/` for app-specific UI primitives (Button, Card, Dialog, etc.). Follow existing component patterns and Tailwind styling.
- ESLint + TypeScript configs centralized (`packages/eslint-config`, `packages/typescript-config`). Extend rather than duplicating per package.

### 7a. Route-Scoped Modular Structure (Underscore Folders)

- Feature / route segments under `apps/webapp/src/app/(protected)/(dashboard)/<feature>` OR `apps/webapp/src/app/(protected)/<feature>` use collocated underscore-prefixed folders to separate concerns:
  - `_actions`: Server actions with `'use server'` directive (e.g., `post.ts`, `comment.ts`). Auth via `auth()`, validate inputs, return `{ success, data/error }` shape. Keep module-specific actions colocated.
  - `_components`: Presentational + small stateful UI pieces (e.g., `create-transaction-form.tsx`, `powens-link.tsx`). Avoid business logic here.
  - `_hooks`: React Query + state hooks wrapping services (`use-transaction.ts`, `use-categories.ts`, `use-profile.ts`). Each mutation/query maps 1:1 to a service call and handles cache invalidation.
  - `_services`: Thin API/client layer (e.g., `transaction-service.ts`, `category-service.ts`) performing fetch/server action invocation + minimal shaping. No React imports. Import from `../_actions/*` NOT global `@/actions/*`.
  - `_validations`: Zod schemas & inferred TS types (`transaction-schema.ts`). Keep naming `<entity>-schema.ts` and export both schema + `type`.
  - `_types`: Shared local domain types for that module (e.g., `Transaction`, `MonthOption`, `PowensLinkProps`). Prefer importing Prisma enums directly instead of duplicating.
  - `_utils`: Pure helpers referencing `_types` (e.g., date/month mapping utilities) – must stay side-effect free.
- Import order preference inside module code: external libs → shared packages (`@repo/ui`) → cross-module imports → local module folders (`../_types`, `../_services/...`, `../_actions/...`) → same-folder relatives.
- When adding a new feature, replicate this structure; only create folders actually needed (avoid empty placeholders).
- Cross-module sharing: if logic becomes generic (used in >1 feature), promote to `src/lib` (utilities) or `packages/ui` (visual component) instead of reaching across feature boundaries.
- **Server Actions Location**: For features with custom layouts (outside dashboard), keep actions IN the module as `_actions/`. For dashboard features, either colocate or use global `src/actions/` (legacy pattern being phased out).
- **Modular Architecture Examples**:
  - **Community module** (full-width, no sidebar): `(protected)/community/_actions/post.ts`, `_hooks/use-posts.ts`, `_services/post-service.ts` - fully self-contained
  - **Extensions module** (dashboard sidebar): `(dashboard)/extensions/_hooks/use-extensions.ts`, `_services/extension-service.ts` - imports from colocated structure
  - Import pattern: `import { createPost } from '../_actions/post'` NOT `@/actions/community/post`

### 8. Testing Conventions

- **MANDATORY**: Always use TDD/BDD approach - write tests FIRST in the `src/test/` folder, then implement features. Test files should mirror the `src/` structure but live in `src/test/` directory (e.g., `src/test/components/navigation/app-sidebar.test.tsx` for `src/components/navigation/app-sidebar.tsx`).
- Test structure: Use Vitest + React Testing Library for components. Follow BDD patterns with `describe()` for feature behaviors and `it()` for specific scenarios. Test props, user interactions, and i18n message rendering. Mock server actions and external services.
- **Type Safety in Tests**: Use `ReturnType<typeof hookName>` for typing hook mocks. Avoid `as any` - use `as unknown as ValidType` when testing invalid inputs. Import types from actual implementation files, not duplicated test types.
- Playwright E2E config: `apps/webapp/playwright.config.ts` for integration tests. Requires build; `test:e2e` depends on `^build` via turbo.
- Prefer Vitest for React component / server action logic; mock Prisma cautiously (or use a test db URL). Avoid global new PrismaClient instances.

### 8a. Forms, Validation & Data Fetching Patterns

- React Query setup: Query client provider (`client-provider.tsx`) wraps protected areas. Query keys include locale: e.g. `['categories', locale]`, `['transactions', locale]` enabling locale-scoped caches.
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

1. **MANDATORY**: Write tests FIRST using TDD/BDD approach in `src/test/` folder (mirroring `src/` structure).
2. Define/extend schema in `apps/webapp/prisma/schema.prisma`; run `pnpm prisma migrate dev --name add_<feature>` inside webapp.
3. Create module structure in `src/app/(protected)/(dashboard)/<feature>` OR `src/app/(protected)/<feature>` with `_actions`, `_hooks`, `_services`, `_components`, `_validations` folders as needed.
4. Export server actions in `<feature>/_actions/<entity>.ts` following auth + validation + return pattern.
5. **MANDATORY**: Add i18n message keys to all three locale files (`messages/en.json`, `messages/fr.json`, `messages/vi.json`) and use `useTranslations()` in components.
6. Run tests to verify implementation matches TDD specifications.
7. Run tests to verify implementation matches TDD specifications.

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
- **NEVER create components or pages without tests** - always write tests FIRST using TDD/BDD in `src/test/` folder, then implement.
- **NEVER use `as any` type assertions** - always use proper TypeScript types or `as unknown as ValidType` for intentional type bypassing in tests.
- **NEVER skip TypeScript compilation** - all code must pass `tsc --noEmit` and ESLint without warnings before committing.

### 13. Quick Reference

- Auth file: `apps/webapp/src/auth.ts`
- I18n config: `apps/webapp/src/i18n/routing.ts` + `request.ts`
- Server actions: `apps/webapp/src/actions/*`
- Prisma schema: `apps/webapp/prisma/schema.prisma`
- Turbo tasks: `turbo.json`
- Module pattern: `(route)/_components|_hooks|_services|_validations|_types|_utils`
- Extensions example: `extensions/_hooks/use-extensions.ts`, `extensions/_services/extension-service.ts`
- Query client setup: `apps/webapp/src/app/(protected)/client-provider.tsx`
- Config: `apps/webapp/src/config.ts` (hosts, routes)
- Chat routes: `apps/webapp/src/config/routes/chat.ts`

---

Feedback welcome: If any convention above is outdated or unclear, specify the section number so it can be refined.
