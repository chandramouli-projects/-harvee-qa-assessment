import { defineConfig, devices } from '@playwright/test';
import { env, type BrowserName } from './utils/environment';

const DESKTOP_DEVICES: Record<BrowserName, (typeof devices)[string]> = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.retries,
  // Cross-browser runs on a laptop can starve Firefox (see docs/known-limitations.md); WORKERS caps this.
  ...(env.workers > 0 ? { workers: env.workers } : env.isCI ? { workers: 2 } : {}),
  timeout: env.timeouts.test,
  expect: { timeout: env.timeouts.expect },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    headless: env.headless,
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  // BROWSER selects which projects exist (chromium by default; "all" for cross-browser runs).
  projects: env.browsers.map((name) => ({
    name,
    use: { ...DESKTOP_DEVICES[name] },
  })),
});
