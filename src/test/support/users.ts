import { testConfig } from '../../../config/testConfig';

/**
 * Feature files refer to users by role ("standard", "locked out", …) so usernames never appear
 * in Gherkin. The real values come from config/.env.<env>.
 */
const USERS_BY_ROLE: Record<string, string> = {
  standard: testConfig.users.standard,
  'locked out': testConfig.users.lockedOut,
  problem: testConfig.users.problem,
  'performance glitch': testConfig.users.performanceGlitch,
};

export function usernameFor(role: string): string {
  const username = USERS_BY_ROLE[role];
  if (!username) {
    throw new Error(
      `Unknown user role "${role}". Use one of: ${Object.keys(USERS_BY_ROLE).join(', ')}.`,
    );
  }
  return username;
}

/**
 * Resolves `${VARIABLE}` placeholders in feature-file values from the loaded configuration,
 * e.g. "${PASSWORD}". Fails loudly (without printing values) when a variable is not set.
 */
export function resolvePlaceholders(text: string): string {
  return text.replace(/\$\{([A-Z0-9_]+)\}/g, (_match, name: string) => {
    const value = process.env[name];
    if (value === undefined) {
      throw new Error(
        `Feature placeholder \${${name}} is not set in config/.env.${testConfig.env}.`,
      );
    }
    return value;
  });
}

/** Splits a feature-file list such as "Sauce Labs Backpack, Sauce Labs Onesie". */
export function splitList(text: string): string[] {
  return text
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
