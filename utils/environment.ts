import path from 'node:path';
import dotenv from 'dotenv';

// Values already present in process.env (e.g. from CI) take precedence over the .env file.
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

export const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type BrowserName = (typeof SUPPORTED_BROWSERS)[number];

export class ConfigurationError extends Error {
  override name = 'ConfigurationError';
}

const SETUP_HINT = 'Copy .env.example to .env, or set the variable in the CI environment.';

// Error messages name the variable but never echo its value, so secrets cannot leak into logs.
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

export const env = Object.freeze({
  baseUrl: readUrl('BASE_URL'),
  users: Object.freeze({
    standard: readRequired('STANDARD_USER'),
    lockedOut: readRequired('LOCKED_OUT_USER'),
    problem: readRequired('PROBLEM_USER'),
    performanceGlitch: readRequired('PERFORMANCE_GLITCH_USER'),
  }),
  password: readRequired('PASSWORD'),
  browsers: readBrowsers('BROWSER'),
  headless: readBoolean('HEADLESS', true),
  isCI: readBoolean('CI', false),
  retries: readInteger('RETRIES', 0, 0),
  /** 0 = Playwright's default (half the CPU cores). */
  workers: readInteger('WORKERS', 0, 0),
  timeouts: Object.freeze({
    test: readInteger('TEST_TIMEOUT', 30_000, 1_000),
    action: readInteger('ACTION_TIMEOUT', 10_000, 1_000),
    navigation: readInteger('NAVIGATION_TIMEOUT', 15_000, 1_000),
    expect: readInteger('EXPECT_TIMEOUT', 10_000, 1_000),
  }),
});
