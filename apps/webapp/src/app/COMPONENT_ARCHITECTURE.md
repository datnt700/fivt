# Component Organization Documentation

This project follows a modular component architecture with private module-specific components.

## Structure

### Global Components (`src/components/`)
These are shared components used across multiple modules:
- `ui/` - Base UI components (buttons, cards, inputs, etc.)
- `navigation.tsx` - Global navigation
- `theme-provider.tsx` - Theme context provider
- `theme-toggler.tsx` - Theme switcher
- `language-switcher.tsx` - i18n language switcher
- `loading.tsx` - Generic loading component
- `max-width-wrapper.tsx` - Layout wrapper
- `app-sidebar.tsx`, `bottom-nav.tsx`, `nav-items.tsx`, `nav-user.tsx` - Navigation components
- `recipe-card.tsx` - Recipe display component

### Module-Specific Components

#### Auth Module (`src/app/auth/_components/`)
Private components specific to authentication:
- `login-form.tsx` - Login form component
- `magic-link-signin.tsx` - Magic link authentication component
- `index.ts` - Barrel export for clean imports

#### Banking Module (`src/app/(protected)/banking/_components/`)
Private components specific to banking functionality:
- `powens-link.tsx` - Powens bank connection component
- `bridge-link.tsx` - Bridge API bank connection component
- `index.ts` - Barrel export for clean imports

#### Banking Types (`src/app/(protected)/banking/_types/`)
Shared types for banking module:
- `index.ts` - Banking-related TypeScript types and interfaces

### Email Templates (`src/lib/emails/`)
Email templates moved to lib as they're more utility-focused:
- `magic-link-email/` - Magic link email template

## Usage Patterns

### Importing Module Components
```tsx
// Clean imports using barrel exports
import { LoginForm } from '../_components';
import { PowensLink, BridgeLink } from '../_components';

// Import types
import type { PowensLinkProps, BankAccount } from '../_types';
```

### Importing Global Components
```tsx
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { ThemeToggler } from '@/components/theme-toggler';
```

## Benefits

1. **Module Encapsulation**: Components are colocated with their related functionality
2. **Clear Boundaries**: `_components` prefix indicates private/internal components  
3. **Better Organization**: Related components, types, and utilities are grouped together
4. **Cleaner Imports**: Barrel exports reduce import path complexity
5. **Maintainability**: Easier to find and modify related functionality
6. **Performance**: Better tree-shaking of unused components

## Conventions

- `_components/` - Private components for a specific module
- `_types/` - Private types and interfaces for a module
- `_utils/` - Private utilities for a module (when needed)
- `index.ts` - Barrel exports for clean imports
- Global components stay in `src/components/`
- UI primitives stay in `src/components/ui/`