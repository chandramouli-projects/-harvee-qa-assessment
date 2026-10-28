import { defineConfig, devices } from '@playwright/test';
import { testConfig } from '../../config/testConfig';
export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results/b1-plain-playwright',
  use: { baseURL: testConfig.baseUrl, testIdAttribute: 'data-test' },
  workers: 2,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
