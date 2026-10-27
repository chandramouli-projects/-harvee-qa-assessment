import { Before, After, BeforeAll, logger } from './base-step';
import { testConfig } from '../../../config/testConfig';

// Framework-level hooks only. Browser, context and page lifecycle, plus screenshots, video and
// trace on failure, are owned by Playwright (playwright.config.ts) — not re-implemented here.

BeforeAll(({ browserName }) => {
  logger.info(`>> [CONFIG] Environment : ${testConfig.env}`);
  logger.info(`>> [CONFIG] Base URL    : ${testConfig.baseUrl}`);
  logger.info(`>> [CONFIG] Browser     : ${browserName} (headless: ${testConfig.headless})`);
});

Before(({ $testInfo }) => {
  logger.info(`>> [SCENARIO] Starting: ${$testInfo.title} [${$testInfo.project.name}]`);
});

After(({ $testInfo, testContext }) => {
  const elapsed = Date.now() - testContext.scenarioStartTime;
  const threshold = testConfig.responseTimeThreshold;
  const status = `${$testInfo.status ?? 'unknown'} (expected: ${$testInfo.expectedStatus})`;
  logger.info(`>> [SCENARIO] Finished: ${$testInfo.title} [Status: ${status}]`);

  // Logged, not asserted: a public demo site's response time is not a requirement here.
  if (elapsed > threshold) {
    logger.warn(`>> [RESPONSE TIME] "${$testInfo.title}" took ${elapsed}ms > ${threshold}ms`);
  } else {
    logger.info(`>> [RESPONSE TIME] ${elapsed}ms (threshold: ${threshold}ms)`);
  }
});
