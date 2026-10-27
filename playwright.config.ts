import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { testConfig, type BrowserName } from './config/testConfig';

// Gherkin features are compiled into Playwright tests in .features-gen/ (`npx bddgen`, run by the
// npm test scripts), then executed by the Playwright runner. So the suite keeps Playwright's
// browser projects, parallelism, traces and HTML report while being written as BDD.
const testDir = defineBddConfig({
  features: 'src/test/features/**/*.feature',
  steps: ['src/core/support/fixtures.ts', 'src/core/support/hooks.ts', 'src/test/steps/**/*.ts'],
  outputDir: '.features-gen',
  featuresRoot: 'src/test/features',
});

const DESKTOP_DEVICES: Record<BrowserName, (typeof devices)[string]> = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};

export default defineConfig({
  testDir,
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: testConfig.isCI,
  retries: testConfig.retries,
  // Cross-browser runs on a laptop can starve Firefox (see docs/known-limitations.md); WORKERS caps this.
  ...(testConfig.workers > 0
    ? { workers: testConfig.workers }
    : testConfig.isCI
      ? { workers: 2 }
      : {}),
  timeout: testConfig.timeouts.test,
  expect: { timeout: testConfig.timeouts.expect },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    // Feeds the Cucumber Spark report (npm run report:spark).
    cucumberReporter('json', {
      outputFile: 'reports/cucumber/cucumber-report.json',
      addProjectToFeatureName: true,
    }),
  ],
  use: {
    baseURL: testConfig.baseUrl,
    testIdAttribute: 'data-test',
    headless: testConfig.headless,
    launchOptions: { slowMo: testConfig.slowMo },
    actionTimeout: testConfig.timeouts.action,
    navigationTimeout: testConfig.timeouts.navigation,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  // BROWSER selects which projects exist (chromium by default; "all" for cross-browser runs).
  projects: testConfig.browsers.map((name) => ({
    name,
    use: { ...DESKTOP_DEVICES[name] },
  })),
});
