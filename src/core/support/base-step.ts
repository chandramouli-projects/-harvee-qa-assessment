// Single import surface for step definitions and hooks.
// Step files import from here only — never directly from 'playwright-bdd' or '@playwright/test'.
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from './fixtures';
import { logger } from './logger';

export const { Given, When, Then, Before, After, BeforeAll, AfterAll } = createBdd(test);
export { test, expect, logger };
