import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    passWithNoTests: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**', 
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'tests/**', // Exclude E2E tests directory
      'e2e/**',   // Exclude any e2e directory
    ],
    // Include coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        'build/',
        '.next/',
        '**/*.stories.*',
        '**/prisma.ts',
        '**/middleware.ts',
        'src/app/**/layout.tsx', // Layout files are harder to test meaningfully
        'src/app/**/loading.tsx', // Loading components are simple
        'src/app/**/not-found.tsx', // Error pages
        'src/app/**/error.tsx', // Error pages
        'src/fonts/**',
        'src/types/**', // Type definitions
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Disable PostCSS in tests
    'process.env.NODE_ENV': '"test"',
  },
})