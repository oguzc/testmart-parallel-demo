# 🛒 TestMart - E-commerce Demo

A modern, fully-functional e-commerce demo application built specifically for demonstrating **Playwright parallel testing strategies** in the presentation:

> **"Parallel Universe: Architecting Scalable E2E Tests with Playwright"**

## 🎯 Purpose

This application serves as a comprehensive example of how to:
- Implement robust parallel testing with Playwright
- Handle worker isolation and race condition prevention
- Create maintainable test fixtures and data factories
- Build scalable E2E testing architectures

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run parallel tests
npm run test:e2e

# View test results
npm run test:ui
```

## 🏗️ Architecture

### Frontend Stack
- **React 19** with TypeScript for modern UI development
- **Vite** for lightning-fast build tooling
- **Tailwind CSS** for responsive, utility-first styling
- **React Router** for client-side navigation
- **Context API** for state management

### Testing Stack
- **Playwright** for cross-browser E2E testing
- **Worker Isolation** to prevent test interference
- **Custom Fixtures** for test data management
- **Parallel Execution** strategies for scalable testing

## 🧪 Parallel Testing Features

### Worker Isolation
Each test worker operates in complete isolation:
```typescript
// tests/fixtures/playwright-fixtures.ts
export const test = base.extend<TestFixtures>({
  workerIndex: async ({}, use, testInfo) => {
    await use(testInfo.workerIndex);
  },
  
  isolatedStorage: [async ({ page, workerIndex }, use) => {
    // Worker-specific storage isolation
  }, { scope: 'worker' }],
});
```

### Test Data Factories
Dynamic data generation prevents conflicts:
```typescript
// tests/fixtures/TestDataFactory.ts
static generateUniqueUser(workerIndex: number): TestUser {
  return {
    email: `user.worker${workerIndex}.${Date.now()}@testmart.dev`,
    firstName: `TestUser${workerIndex}`,
    // ... more worker-specific data
  };
}
```

### Race Condition Prevention
Smart timing and isolation strategies:
- Worker-specific data generation
- Isolated browser storage per worker
- Atomic operations for cart management
- Proper wait strategies for async operations

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components
├── context/            # React context providers
├── data/              # Mock data and API simulation
└── types.ts           # TypeScript type definitions

tests/
├── e2e/               # End-to-end test suites
├── fixtures/          # Test fixtures and data factories
└── mocks/            # API mocking setup
```

## 🎮 Demo Features

### User Management
- User registration and authentication
- Session persistence across pages
- Role-based access control

### Shopping Experience
- Product catalog with search/filtering
- Shopping cart management
- Multi-step checkout process
- Order confirmation and history

### Testing Scenarios
- **User Registration Flow**: Parallel user creation without conflicts
- **Shopping Cart Tests**: Concurrent cart operations
- **Checkout Process**: End-to-end purchase workflows
- **Cross-browser Testing**: Chrome, Firefox, and Safari support

## 🔧 Configuration

### Playwright Setup
```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Worker Isolation
Each worker gets isolated:
- Browser context
- Local storage
- Session data
- Test data sets

## 📊 Test Execution

Run tests with different parallelization strategies:

```bash
# Full parallel execution
npm run test:e2e

# Single worker (debugging)
npm run test:e2e -- --workers=1

# Specific browser
npm run test:e2e -- --project=chromium

# UI mode for debugging
npm run test:ui
```

## 🎯 Key Learning Points

1. **Worker Isolation**: How to prevent test interference in parallel execution
2. **Data Management**: Strategies for generating unique test data per worker
3. **Race Conditions**: Identifying and preventing common parallel testing pitfalls
4. **Scalability**: Building test suites that scale with team size and CI resources
5. **Debugging**: Techniques for troubleshooting parallel test failures

## 🌟 Best Practices Demonstrated

- ✅ Worker-specific test data generation
- ✅ Isolated browser contexts per worker
- ✅ Atomic operations for state changes
- ✅ Proper wait strategies and timing
- ✅ Comprehensive error handling
- ✅ Clean test isolation and cleanup

## 🤝 Contributing

This demo is designed for educational purposes. Feel free to explore, modify, and use as a reference for your own parallel testing implementations!

---

**Built for the presentation**: *"Parallel Universe: Architecting Scalable E2E Tests with Playwright"*