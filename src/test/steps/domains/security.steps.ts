import { Given, When, Then, expect, logger } from '../../../core/support/base-step';
import { testConfig } from '../../../../config/testConfig';
import { resolvePlaceholders, splitList } from '../../support/users';

/**
 * Steps for features/Security/Security.feature. Passive checks only: headers, redirects, cookies,
 * browser storage and actions that affect nothing but our own browser.
 */

const SESSION_COOKIE = 'session-username';
const RESPONSE_HEADERS = 'responseHeaders';
const REQUESTED_URLS = 'requestedUrls';

/** Header names are case-insensitive; Playwright returns them in lower case. */
function headerValue(headers: Record<string, string>, name: string): string | undefined {
  return headers[name.toLowerCase()];
}

// ══════════════════════════════════════════════════════════════════════════════
// TRANSPORT (SC01 - SC03)
// ══════════════════════════════════════════════════════════════════════════════

When('I request the home page over plain HTTP', async ({ request, testContext }) => {
  const httpUrl = testConfig.baseUrl.replace(/^https:/, 'http:') + '/';
  logger.info(`>> [STEP] GET ${httpUrl} (redirects not followed)`);
  const response = await request.get(httpUrl, { maxRedirects: 0 });
  testContext.setValue('httpRedirect', {
    status: response.status(),
    location: response.headers()['location'] ?? '',
  });
});

Then('I should be redirected permanently to the HTTPS address', ({ testContext }) => {
  const { status, location } = testContext.getValue<{ status: number; location: string }>(
    'httpRedirect',
  );
  expect([301, 308], `plain HTTP should answer with a permanent redirect, got ${status}`).toContain(
    status,
  );
  expect(location, 'the redirect should point to the HTTPS address').toMatch(/^https:\/\//);
});

When('I request the home page over HTTPS', async ({ request, testContext, $testInfo }) => {
  const response = await request.get(`${testConfig.baseUrl}/`);
  expect(response.ok(), `home page should load, got ${response.status()}`).toBe(true);
  const headers = response.headers();
  await $testInfo.attach('response headers', {
    body: JSON.stringify(headers, null, 2),
    contentType: 'application/json',
  });
  testContext.setValue(RESPONSE_HEADERS, headers);
});

/** An empty expected value only requires the header to be present. */
Then(
  'the response header {string} should contain {string}',
  ({ testContext }, name: string, expected: string) => {
    const value = headerValue(testContext.getValue<Record<string, string>>(RESPONSE_HEADERS), name);
    expect(value, `response should include the "${name}" header`).toBeDefined();
    expect(value, `"${name}" should contain "${expected}"`).toContain(expected);
  },
);

Given('I watch every network request', ({ page, testContext }) => {
  testContext.setValue<string[]>(REQUESTED_URLS, []);
  page.on('request', (request) => {
    testContext.getValue<string[]>(REQUESTED_URLS).push(request.url());
  });
});

Then('no request should have used plain HTTP', ({ testContext }) => {
  const urls = testContext.getValue<string[]>(REQUESTED_URLS);
  expect(urls.length, 'requests should have been recorded').toBeGreaterThan(0);
  expect(
    urls.filter((url) => url.startsWith('http://')),
    'requests sent without encryption',
  ).toEqual([]);
});

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE HEADERS (SC04)
// ══════════════════════════════════════════════════════════════════════════════

/** X-Frame-Options DENY/SAMEORIGIN, or a CSP frame-ancestors directive, blocks clickjacking. */
Then('the response should forbid framing by other sites', ({ testContext }) => {
  const headers = testContext.getValue<Record<string, string>>(RESPONSE_HEADERS);
  const frameOptions = headerValue(headers, 'X-Frame-Options')?.toUpperCase();
  const csp = headerValue(headers, 'Content-Security-Policy') ?? '';
  const protectedByFrameOptions = frameOptions === 'DENY' || frameOptions === 'SAMEORIGIN';
  const protectedByCsp = /frame-ancestors\s+('none'|'self')/i.test(csp);
  expect(
    protectedByFrameOptions || protectedByCsp,
    `framing should be blocked; X-Frame-Options=${frameOptions ?? 'missing'}, ` +
      `CSP frame-ancestors=${/frame-ancestors[^;]*/i.exec(csp)?.[0] ?? 'missing'}`,
  ).toBe(true);
});

// ══════════════════════════════════════════════════════════════════════════════
// SESSION COOKIE (SC06, SC07)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Records every document.cookie write, so the cookie can be judged by what the SITE sets, not by
 * each browser's default (a missing SameSite reads as "Lax" in Chromium but "None" in Firefox/WebKit).
 */
Given('I record how the page writes cookies', async ({ context }) => {
  await context.addInitScript(() => {
    const native = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    if (!native?.get || !native.set) return;
    const writes: string[] = [];
    (window as unknown as { cookieWrites: string[] }).cookieWrites = writes;
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => native.get!.call(document) as string,
      set: (value: string) => {
        writes.push(value);
        native.set!.call(document, value);
      },
    });
  });
});

/**
 * Secure and SameSite must be written by the site. A cookie written by page script can never be
 * HttpOnly; a server-set cookie is judged by the flags the browser stored.
 */
Then(
  'the session cookie should be set with the protections {string}',
  async ({ page, context, $testInfo }, protectionList: string) => {
    const cookie = (await context.cookies()).find((entry) => entry.name === SESSION_COOKIE);
    if (!cookie) throw new Error(`the "${SESSION_COOKIE}" cookie should exist after login`);
    const writes = await page.evaluate(
      () => (window as unknown as { cookieWrites?: string[] }).cookieWrites ?? [],
    );
    const scriptWrite = writes.find((write) => write.startsWith(`${SESSION_COOKIE}=`));
    await $testInfo.attach('session cookie as written by the page', {
      body: scriptWrite?.replace(/=[^;]*/, '=<value>') ?? 'not written by page script',
      contentType: 'text/plain',
    });
    const has: Record<string, boolean> = scriptWrite
      ? {
          Secure: /;\s*secure\b/i.test(scriptWrite),
          SameSite: /;\s*samesite=(lax|strict)/i.test(scriptWrite),
          HttpOnly: false,
        }
      : {
          Secure: cookie.secure,
          SameSite: cookie.sameSite === 'Lax' || cookie.sameSite === 'Strict',
          HttpOnly: cookie.httpOnly,
        };
    const missing = splitList(protectionList).filter((protection) => {
      if (!(protection in has)) {
        throw new Error(`Unknown protection "${protection}". Use Secure, SameSite or HttpOnly.`);
      }
      return !has[protection];
    });
    expect(
      missing,
      `protections missing on the "${SESSION_COOKIE}" cookie` +
        (scriptWrite ? ' (it is written by page script, so it cannot be HttpOnly)' : ''),
    ).toEqual([]);
  },
);

Then('the session cookie should be removed', async ({ context }) => {
  const names = (await context.cookies()).map((entry) => entry.name);
  expect(names, 'the session cookie should be gone after logout').not.toContain(SESSION_COOKIE);
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (SC08, SC09, SC11)
// ══════════════════════════════════════════════════════════════════════════════

/** Writes the cookie the site uses as its "logged in" marker, as anyone could in DevTools. */
When(
  'I set the session cookie to {string} without logging in',
  async ({ context }, username: string) => {
    const value = resolvePlaceholders(username);
    logger.info('>> [STEP] Set a hand-made session cookie (no login)');
    await context.addCookies([
      { name: SESSION_COOKIE, value, domain: new URL(testConfig.baseUrl).hostname, path: '/' },
    ]);
  },
);

Then('the page URL should not contain the username or the password', ({ page }) => {
  const url = decodeURIComponent(page.url());
  expect(url, 'the URL should not contain the password').not.toContain(testConfig.password);
  expect(url, 'the URL should not contain the username').not.toContain(testConfig.users.standard);
});

// ══════════════════════════════════════════════════════════════════════════════
// DATA PROTECTION AND INPUT HANDLING (SC12, SC13)
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'browser storage and cookies should not contain the password or {string}',
  async ({ page, context, $testInfo }, details: string) => {
    const stored = await page.evaluate(() => ({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
    }));
    const cookies = (await context.cookies()).map(({ name, value }) => ({ name, value }));
    const everything = JSON.stringify({ ...stored, cookies });
    await $testInfo.attach('browser storage and cookies', {
      body: everything,
      contentType: 'application/json',
    });
    const found = [testConfig.password, ...splitList(details)].filter((secret) =>
      everything.includes(secret),
    );
    // Values are not printed, so the password never reaches the report.
    expect(found.length, `${found.length} sensitive value(s) found in browser storage`).toBe(0);
  },
);

Then('the page should not contain elements created from the typed text', async ({ page }) => {
  const injected = await page.evaluate(
    () =>
      document.querySelectorAll('img[src="x"]').length +
      [...document.querySelectorAll('script')].filter((script) =>
        (script.textContent ?? '').includes('alert('),
      ).length,
  );
  expect(injected, 'typed HTML or script should not become page elements').toBe(0);
});

// ══════════════════════════════════════════════════════════════════════════════
// EXTERNAL LINKS (SC14)
// ══════════════════════════════════════════════════════════════════════════════

Then(
  'every link that opens a new tab should use {string} or {string}',
  async ({ page }, first: string, second: string) => {
    const links = await page.locator('a[target="_blank"]').evaluateAll((elements) =>
      elements.map((element) => ({
        href: (element as HTMLAnchorElement).href,
        rel: (element as HTMLAnchorElement).rel.toLowerCase().split(/\s+/),
      })),
    );
    expect(links.length, 'the page should have links that open a new tab').toBeGreaterThan(0);
    const unsafe = links
      .filter(({ rel }) => !rel.includes(first) && !rel.includes(second))
      .map(({ href }) => href);
    expect(unsafe, `new-tab links without rel="${first}" or "${second}"`).toEqual([]);
  },
);
