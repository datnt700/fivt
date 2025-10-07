#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appName = process.argv[2] || 'microapp';
const appDir = path.join(__dirname, '..', 'apps', appName);

console.log(`🚀 Creating microapp: ${appName}`);

// Create app directory
if (fs.existsSync(appDir)) {
  console.error(`❌ App ${appName} already exists!`);
  process.exit(1);
}

fs.mkdirSync(appDir, { recursive: true });

// Create package.json
const packageJson = {
  name: appName,
  version: "0.1.0",
  type: "module",
  private: true,
  scripts: {
    dev: "next dev --port 3001",
    build: "next build",
    start: "next start",
    lint: "next lint",
    export: "next build && next export"
  },
  dependencies: {
    next: "^15.5.0",
    react: "^19.1.0",
    "react-dom": "^19.1.0",
    "@tailwindcss/postcss": "^4.1.13",
    "tailwindcss": "^4.1.13",
    "clsx": "^2.1.1",
    "next-intl": "^3.22.4"
  },
  devDependencies: {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "@types/react": "19.1.0",
    "@types/react-dom": "19.1.1",
    "eslint": "^9.34.0",
    "typescript": "5.9.2"
  }
};

fs.writeFileSync(
  path.join(appDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create Next.js config
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
`;

fs.writeFileSync(path.join(appDir, 'next.config.js'), nextConfig);

// Create TypeScript config
const tsConfig = {
  extends: "@repo/typescript-config/nextjs.json",
  compilerOptions: {
    plugins: [{ name: "next" }]
  },
  include: [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  exclude: ["node_modules"]
};

fs.writeFileSync(
  path.join(appDir, 'tsconfig.json'),
  JSON.stringify(tsConfig, null, 2)
);

// Create ESLint config
const eslintConfig = `import baseConfig from "@repo/eslint-config/next.js";

export default baseConfig;
`;

fs.writeFileSync(path.join(appDir, 'eslint.config.js'), eslintConfig);

// Create Tailwind config
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

fs.writeFileSync(path.join(appDir, 'tailwind.config.js'), tailwindConfig);

// Create PostCSS config
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
  },
}
`;

fs.writeFileSync(path.join(appDir, 'postcss.config.js'), postcssConfig);

// Create src directory structure
const srcDir = path.join(appDir, 'src');
const appSrcDir = path.join(srcDir, 'app');
const componentsDir = path.join(srcDir, 'components');
const i18nDir = path.join(srcDir, 'i18n');
const messagesDir = path.join(appDir, 'messages');

fs.mkdirSync(appSrcDir, { recursive: true });
fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(i18nDir, { recursive: true });
fs.mkdirSync(messagesDir, { recursive: true });

// Create globals.css
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

fs.writeFileSync(path.join(appSrcDir, 'globals.css'), globalsCss);

// Create i18n configuration
const i18nConfig = `import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'fr', 'vi'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming \`locale\` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(\`../messages/\${locale}.json\`)).default
  };
});
`;

fs.writeFileSync(path.join(i18nDir, 'request.ts'), i18nConfig);

// Create middleware for i18n routing
const middleware = `import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr', 'vi'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|vi|en)/:path*']
};
`;

fs.writeFileSync(path.join(srcDir, 'middleware.ts'), middleware);

// Create message files
const enMessages = {
  "HomePage": {
    "title": appName.charAt(0).toUpperCase() + appName.slice(1),
    "description": "Welcome to your new microapp! This is a standalone Next.js application that can be deployed as a static website.",
    "getStarted": "Get Started",
    "builtWith": "Built with Next.js & Tailwind CSS",
    "readyForDeployment": "Ready for static deployment"
  }
};

const frMessages = {
  "HomePage": {
    "title": appName.charAt(0).toUpperCase() + appName.slice(1),
    "description": "Bienvenue dans votre nouvelle microapp ! Il s'agit d'une application Next.js autonome qui peut être déployée comme un site web statique.",
    "getStarted": "Commencer",
    "builtWith": "Construit avec Next.js & Tailwind CSS",
    "readyForDeployment": "Prêt pour le déploiement statique"
  }
};

const viMessages = {
  "HomePage": {
    "title": appName.charAt(0).toUpperCase() + appName.slice(1),
    "description": "Chào mừng bạn đến với microapp mới! Đây là một ứng dụng Next.js độc lập có thể được triển khai như một trang web tĩnh.",
    "getStarted": "Bắt Đầu",
    "builtWith": "Được xây dựng với Next.js & Tailwind CSS",
    "readyForDeployment": "Sẵn sàng để triển khai tĩnh"
  }
};

fs.writeFileSync(path.join(messagesDir, 'en.json'), JSON.stringify(enMessages, null, 2));
fs.writeFileSync(path.join(messagesDir, 'fr.json'), JSON.stringify(frMessages, null, 2));
fs.writeFileSync(path.join(messagesDir, 'vi.json'), JSON.stringify(viMessages, null, 2));

// Create root layout.tsx
const rootLayoutTsx = `import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css'

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
`;

fs.writeFileSync(path.join(appSrcDir, 'layout.tsx'), rootLayoutTsx);

// Create localized layout structure
const localizedDir = path.join(appSrcDir, '[locale]');
fs.mkdirSync(localizedDir, { recursive: true });

// Create localized layout
const localizedLayoutTsx = `import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

const locales = ['en', 'fr', 'vi'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming \`locale\` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Enable static rendering
  unstable_setRequestLocale(locale);

  return children;
}
`;

fs.writeFileSync(path.join(localizedDir, 'layout.tsx'), localizedLayoutTsx);

// Create localized page.tsx
const localizedPageTsx = `import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  const t = useTranslations('HomePage');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('description')}
        </p>
        <Button className="w-full">
          {t('getStarted')}
        </Button>
        <div className="mt-6 text-sm text-gray-500">
          <p>✨ {t('builtWith')}</p>
          <p>🚀 {t('readyForDeployment')}</p>
        </div>
      </div>
    </main>
  )
}

export function generateMetadata({ params: { locale } }: Props) {
  return {
    title: '${appName.charAt(0).toUpperCase() + appName.slice(1)}',
    description: 'Generated microapp with Next.js and i18n support',
  };
}
`;

fs.writeFileSync(path.join(localizedDir, 'page.tsx'), localizedPageTsx);

// Create redirect page for root
const rootPageTsx = `import { redirect } from 'next/navigation';

// This page redirects to the default locale
export default function RootPage() {
  redirect('/en');
}
`;

fs.writeFileSync(path.join(appSrcDir, 'page.tsx'), rootPageTsx);

// Create Button component
const uiDir = path.join(componentsDir, 'ui');
fs.mkdirSync(uiDir, { recursive: true });

const buttonTsx = `import { clsx } from 'clsx'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3 rounded-md': size === 'sm',
            'h-11 px-8 rounded-md': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
`;

fs.writeFileSync(path.join(uiDir, 'button.tsx'), buttonTsx);

// Create Language Switcher component
const languageSwitcherTsx = `'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(\`/\${newLocale}\`);
    });
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isPending}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'language-switcher.tsx'), languageSwitcherTsx);

// Create next-env.d.ts
const nextEnvDts = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

fs.writeFileSync(path.join(appDir, 'next-env.d.ts'), nextEnvDts);

// Create Next.js config with i18n
const nextConfigWithI18n = `import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default withNextIntl(nextConfig);
`;

// Update the Next.js config file
fs.writeFileSync(path.join(appDir, 'next.config.js'), nextConfigWithI18n);

// Create README
const readme = `# ${appName}

A microapp built with Next.js, ready for static deployment.

## Getting Started

### Development
\`\`\`bash
# From root directory
npm run dev:${appName}

# Or from this directory
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
# From root directory
npm run build:${appName}

# Or from this directory
npm run build
\`\`\`

### Export Static Website
\`\`\`bash
# From this directory
npm run export
\`\`\`

The static files will be generated in the \`out\` directory.

## Deployment

This app is configured for static export and can be deployed to:
- Vercel
- Netlify  
- GitHub Pages
- AWS S3
- Any static hosting service

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS for styling
- ✅ Static export ready
- ✅ ESLint configuration
- ✅ Responsive design
- ✅ Internationalization (i18n) with next-intl
- ✅ Multi-language support (English, French, Vietnamese)
- ✅ Automatic locale detection and routing
- ✅ Language switcher component

## Languages

This microapp supports multiple languages:
- 🇺🇸 English (\`/en\`)
- 🇫🇷 French (\`/fr\`)
- 🇻🇳 Vietnamese (\`/vi\`)

## Adding New Languages

1. Add the locale to \`src/middleware.ts\`
2. Create a new message file in \`messages/[locale].json\`
3. Update the \`languages\` array in \`src/components/language-switcher.tsx\`
4. Add the locale to \`generateStaticParams\` in \`src/app/[locale]/layout.tsx\`
`;

fs.writeFileSync(path.join(appDir, 'README.md'), readme);

console.log(`✅ Microapp '${appName}' created successfully!`);
console.log(`📁 Location: apps/${appName}`);
console.log(`\n🚀 Next steps:`);
console.log(`   cd apps/${appName}`);
console.log(`   npm install`);
console.log(`   npm run dev`);
console.log(`\n📦 Or from root:`);
console.log(`   npm run dev:${appName}`);