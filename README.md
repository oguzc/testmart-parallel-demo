# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

# TestMart - Parallel E2E Testing Demo

This application demonstrates how to architect scalable end-to-end tests with Playwright that can run safely in parallel without conflicts or flaky behavior.

## 🎯 What This Demo Shows

### Parallel Testing Challenges
- **Race Conditions**: Multiple tests trying to register with the same email
- **State Conflicts**: Shared cart data between test workers  
- **Resource Contention**: Database conflicts and timing issues
- **Flaky Tests**: Tests that pass individually but fail in parallel

### Solutions Implemented
- **Worker-Specific Data**: Unique test data per worker thread
- **Isolated Storage**: Separate browser storage per test
- **Race Condition Prevention**: Proper test isolation patterns
- **Reliable Test Architecture**: Battle-tested patterns for scale

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Start the Application
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### 3. Run Tests

#### Serial Execution (Traditional)
```bash
npm run test:serial
```

#### Parallel Execution (Optimized)
```bash
npm run test:parallel
```

#### Debug Mode
```bash
npm run test:debug
```

#### Interactive UI Mode
```bash
npm run test:ui
```

## 🏗️ Architecture Overview

### Application Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages  
├── context/            # React context providers
├── data/               # Mock data store
└── types.ts           # TypeScript definitions

tests/
├── fixtures/           # Test utilities and data factories
├── e2e/               # End-to-end test scenarios
└── playwright.config.ts
```

### Test Architecture

#### 1. Data Isolation
```typescript
// Each worker gets unique test data
const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
// user.email = "worker0-1640995200000-abc123@worker0.testmart.local"
```

#### 2. Worker-Specific Resources
```typescript
// Prevents conflicts between parallel tests
static getWorkerSpecificData(workerIndex: number) {
  return {
    emailDomain: `worker${workerIndex}.testmart.local`,
    storagePrefix: `testmart_worker_${workerIndex}_`,
    dataNamespace: `test_data_worker_${workerIndex}`
  };
}
```

## 📊 Test Scenarios

### User Management Tests
- ✅ Parallel user registration with unique emails
- ✅ Login validation with worker-specific credentials
- ✅ Form validation in parallel contexts

### Shopping Cart Tests  
- ✅ Cart state isolation between workers
- ✅ Product inventory management
- ✅ Cart persistence across navigation

### Checkout Flow Tests
- ✅ Complete order processing in parallel
- ✅ Form validation across workers
- ✅ Success state handling

## 🔧 Key Features

### 1. Unique Data Generation
Every test gets completely unique data to prevent conflicts:
```typescript
// User emails are globally unique
email: `test-user-${timestamp}-${randomId}@testmart.com`

// Products have worker-specific names
name: `Test Product ${randomId}-w${workerIndex}`
```

### 2. Isolated Test Environment
```typescript
test.describe('User Registration - Parallel Safe', () => {
  test('should register new user successfully', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    // Test runs with isolated data...
  });
});
```

## 📈 Performance Comparison

### Before: Serial Execution
- **Single worker**: Tests run one after another
- **Total time**: ~5 minutes for 20 tests
- **Resource usage**: Low CPU, underutilized

### After: Parallel Execution  
- **4 workers**: Tests run simultaneously
- **Total time**: ~1.5 minutes for 20 tests
- **Resource usage**: Optimal CPU utilization
- **Speedup**: ~70% faster execution

## 🎭 Playwright Configuration

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,        // Enable parallel execution
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
```

## 🚨 Common Pitfalls Avoided

### ❌ What NOT to do:
```typescript
// Shared test data - causes conflicts!
const SHARED_USER = { email: 'test@example.com' };

test('register user', async ({ page }) => {
  await page.fill('#email', SHARED_USER.email); // ⚠️ Race condition!
});
```

### ✅ What TO do:
```typescript
// Unique test data per worker
test('register user', async ({ page }, testInfo) => {
  const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
  await page.fill('#email', user.email); // ✅ Unique and safe!
});
```

---

**Built for the presentation: "Parallel Universe: Architecting Scalable E2E Tests with Playwright"**

*This demo provides real, working examples of parallel test architecture that you can copy and adapt for your own projects.*

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
