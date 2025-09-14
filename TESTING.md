# Testing Guide

This project includes comprehensive testing setup for both unit tests and end-to-end (E2E) tests.

## Testing Stack

### Unit Testing
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Coverage**: V8 provider

### E2E Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Visual Testing**: Screenshots and video recording

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test:unit

# Watch mode for development
pnpm test:watch

# Run tests for specific app
pnpm --filter web test:unit
pnpm --filter @repo/ui test:unit
```

### E2E Tests
```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm --filter web test:e2e:ui

# Run E2E tests in headed mode
pnpm --filter web exec playwright test --headed
```

### All Tests
```bash
# Run all tests (unit + e2e)
pnpm test
```

## Development Workflow

### Pre-commit Hooks
Husky is configured to run:
- Lint-staged (ESLint + Prettier)
- Type checking

### Pre-push Hooks
- Unit tests

### CI/CD Pipeline
The GitHub Actions workflow runs:
1. Lint and type checking
2. Unit tests
3. E2E tests
4. Build verification

## Writing Tests

### Unit Tests Location
- **Web App**: `apps/web/src/test/components/`
- **UI Package**: `packages/ui/src/test/`

### E2E Tests Location
- **Web App**: `apps/web/tests/`

### Example Unit Test
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

### Example E2E Test
```ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'user@example.com')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Coverage Reports

Unit test coverage reports are generated in:
- `apps/web/coverage/`
- `packages/ui/coverage/`

## Configuration Files

### Unit Testing
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test setup and mocks

### E2E Testing
- `playwright.config.ts` - Playwright configuration
- `tests/` - Test files

### Code Quality
- `.lintstagedrc.json` - Lint-staged configuration
- `.husky/` - Git hooks

## Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
3. **Data Testing**: Use `data-testid` attributes for reliable element selection
4. **Mocking**: Mock external dependencies and APIs
5. **Coverage**: Aim for meaningful coverage, not just high percentages
6. **E2E Tests**: Focus on critical user journeys
7. **Performance**: Run unit tests frequently, E2E tests less frequently

## Debugging

### Unit Tests
```bash
# Debug with VS Code
# Set breakpoints and run "Debug Test" from the test file

# Debug in browser
pnpm --filter web test:unit --reporter=verbose
```

### E2E Tests
```bash
# Run with debug mode
pnpm --filter web exec playwright test --debug

# Run with headed browser
pnpm --filter web exec playwright test --headed

# Generate and view test report
pnpm --filter web exec playwright show-report
```

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check environment variables
   - Verify browser dependencies are installed

2. **Slow test execution**
   - Use `test.describe.configure({ mode: 'parallel' })` for Playwright
   - Optimize test setup and teardown

3. **Flaky E2E tests**
   - Add proper waits (`page.waitForLoadState()`)
   - Use more specific selectors
   - Implement retry logic

### Getting Help

- Check the test output for specific error messages
- Review the coverage reports for missed test cases
- Look at the Playwright HTML report for E2E test details
- Use the debugging tools provided by each framework