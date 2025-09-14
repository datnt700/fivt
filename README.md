# FIVT Monorepo

A modern Turborepo monorepo with Next.js applications, comprehensive testing, and development automation.

## Quick Start

1. Install dependencies:
```sh
pnpm install
```

2. Start development (from webapp directory):
```sh
cd apps/webapp

# Windows (PowerShell)
.\scripts\dev.ps1 dev

# Unix/Linux/macOS
./scripts/dev.sh dev
```

3. Run full workflow validation:
```sh
# Windows (PowerShell)
.\scripts\dev.ps1 all

# Unix/Linux/macOS
./scripts/dev.sh all
```

## Development Scripts

The `webapp` includes convenient development scripts for common workflows:

### Windows (PowerShell)
```powershell
# From apps/webapp directory
.\scripts\dev.ps1 [command]

# Available commands:
.\scripts\dev.ps1 test        # Run unit tests
.\scripts\dev.ps1 build       # Build application
.\scripts\dev.ps1 dev         # Start dev server
.\scripts\dev.ps1 lint        # Run ESLint
.\scripts\dev.ps1 typecheck   # TypeScript check
.\scripts\dev.ps1 clean       # Clean build artifacts
.\scripts\dev.ps1 install     # Install dependencies
.\scripts\dev.ps1 all         # Run full workflow
.\scripts\dev.ps1 help        # Show help
```

### Unix/Linux/macOS
```bash
# From apps/webapp directory
./scripts/dev.sh [command]

# Available commands:
./scripts/dev.sh test        # Run unit tests
./scripts/dev.sh build       # Build application
./scripts/dev.sh dev         # Start dev server
./scripts/dev.sh lint        # Run ESLint
./scripts/dev.sh typecheck   # TypeScript check
./scripts/dev.sh clean       # Clean build artifacts
./scripts/dev.sh install     # Install dependencies
./scripts/dev.sh all         # Run full workflow
./scripts/dev.sh help        # Show help
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) documentation app
- `webapp`: a [Next.js](https://nextjs.org/) application with authentication, testing, and modern architecture
- `@repo/ui`: a shared React component library
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: shared `tsconfig.json` configurations

### Webapp Features

- **Next.js 15**: App Router with `src/` directory structure
- **Authentication**: NextAuth.js with magic link signin
- **Database**: Prisma ORM with PostgreSQL
- **Testing**: Vitest with 27+ comprehensive unit tests
- **Styling**: Tailwind CSS with dark/light theme support
- **Type Safety**: Full TypeScript with Zod schema validation
- **Development**: Automated scripts for complete workflow management

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
