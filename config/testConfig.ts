import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { DEFAULT_ENV, environments } from './environments';

/**
 * MASTER CONFIGURATION FILE
 * -------------------------
 * 1. Resolves the environment from ENV (default `demo`) using the registry in environments.ts.
 * 2. Loads config/.env.<env>. Values already in process.env (e.g. from CI) take precedence.
 * 3. Validates every value. Error messages name the variable but never echo its value,
 *    so secrets cannot leak into logs.
 */

export const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type BrowserName = (typeof SUPPORTED_BROWSERS)[number];

export class ConfigurationError extends Error {
  override name = 'ConfigurationError';
}

// ===========================
// ENVIRONMENT RESOLUTION
// ===========================

const envKey = process.env['ENV']?.trim() || DEFAULT_ENV;
const selectedEnv = environments[envKey];
if (!selectedEnv) {
  throw new ConfigurationError(
    `Unknown ENV "${envKey}". Use one of: ${Object.keys(environments).join(', ')}.`,
  );
}
// Resolved against this file's directory, so it works from the repo root, VS Code or CI alike.
const envFile = path.resolve(__dirname, selectedEnv.envFile);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, quiet: true });
}

const SETUP_HINT = `Copy config/.env.example to config/${selectedEnv.envFile}, or set the variable in the CI environment.`;

// ===========================
// VALIDATED READERS
// ===========================

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ConfigurationError(`Missing required environment variable ${name}. ${SETUP_HINT}`);
  }
  return value;
}

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readUrl(name: string): string {
  const value = readRequired(name);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigurationError(`${name} must be an absolute http(s) URL.`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new ConfigurationError(`${name} must use http or https.`);
  }
  return url.origin;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = readOptional(name)?.toLowerCase();
  if (value === undefined) return fallback;
  if (['true', '1', 'yes'].includes(value)) return true;
  if (['false', '0', 'no'].includes(value)) return false;
  throw new ConfigurationError(`${name} must be true or false (received "${value}").`);
}

function readInteger(name: string, fallback: number, min: number): number {
  const value = readOptional(name);
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < min) {
    throw new ConfigurationError(`${name} must be a whole number >= ${min} (received "${value}").`);
  }
  return Number(value);
}

function readBrowsers(name: string): BrowserName[] {
  const value = (readOptional(name) ?? 'chromium').toLowerCase();
  if (value === 'all') return [...SUPPORTED_BROWSERS];
  const requested = value.split(',').map((browser) => browser.trim());
  const unknown = requested.filter(
    (browser) => !(SUPPORTED_BROWSERS as readonly string[]).includes(browser),
  );
  if (unknown.length > 0) {
    throw new ConfigurationError(
      `${name} contains unsupported browser(s): ${unknown.join(', ')}. ` +
        `Use ${SUPPORTED_BROWSERS.join(', ')} or "all".`,
    );
  }
  return [...new Set(requested)] as BrowserName[];
}

// ===========================
// CONFIGURATION
// ===========================

export const testConfig = Object.freeze({
  // Environment
  env: envKey,
  envFile,
  baseUrl: readUrl('BASE_URL'),

  // Demo users, referred to by role in the feature files
  users: Object.freeze({
    standard: readRequired('STANDARD_USER'),
    lockedOut: readRequired('LOCKED_OUT_USER'),
    problem: readRequired('PROBLEM_USER'),
    performanceGlitch: readRequired('PERFORMANCE_GLITCH_USER'),
    error: readRequired('ERROR_USER'),
    visual: readRequired('VISUAL_USER'),
  }),
  password: readRequired('PASSWORD'),

  // Execution
  browsers: readBrowsers('BROWSER'),
  headless: readBoolean('HEADLESS', true),
  /** Slow-motion delay (ms) for watching a headed run step by step. */
  slowMo: readInteger('SLOWMO', 0, 0),
  isCI: readBoolean('CI', false),
  retries: readInteger('RETRIES', 0, 0),
  /** 0 = Playwright's default (half the CPU cores). */
  workers: readInteger('WORKERS', 0, 0),

  // Timeouts (ms)
  timeouts: Object.freeze({
    test: readInteger('TEST_TIMEOUT', 30_000, 1_000),
    action: readInteger('ACTION_TIMEOUT', 10_000, 1_000),
    navigation: readInteger('NAVIGATION_TIMEOUT', 15_000, 1_000),
    expect: readInteger('EXPECT_TIMEOUT', 10_000, 1_000),
  }),
  /** Scenarios slower than this are logged as a warning; it is not a performance assertion. */
  responseTimeThreshold: readInteger('RESPONSE_TIME_THRESHOLD', 15_000, 1_000),
});
