import { test as base, expect } from '@playwright/test';
import { TestDataFactory } from './TestDataFactory';
import type { TestUser } from './TestDataFactory';

// Simple fixtures for parallel testing
type TestFixtures = {
  testUser: TestUser;
  workerIndex: number;
};

export const test = base.extend<TestFixtures>({
  workerIndex: async ({}, use, testInfo) => {
    await use(testInfo.workerIndex);
  },

  testUser: async ({ workerIndex }, use) => {
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    await use(user);
  },
});

export { expect };