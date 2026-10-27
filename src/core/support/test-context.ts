/**
 * Scenario-scoped data store, shared by every step of one scenario.
 *
 * A fresh instance is created per scenario by the `testContext` fixture (fixtures.ts), so values
 * never leak between scenarios, workers or browsers.
 * Usage in a step: `testContext.setValue('selectedItems', items)` and
 * `testContext.getValue<LineItem[]>('selectedItems')`.
 */
export class TestContext {
  private readonly testData = new Map<string, unknown>();

  /** Scenario execution start time (ms), used by the response-time log in hooks.ts. */
  readonly scenarioStartTime = Date.now();

  setValue<T>(key: string, value: T): void {
    this.testData.set(key, value);
  }

  /** Throws when the key was never set, so a missing earlier step fails loudly instead of passing. */
  getValue<T>(key: string): T {
    if (!this.testData.has(key)) {
      throw new Error(
        `[TestContext] No value stored for "${key}". Check that an earlier step sets it.`,
      );
    }
    return this.testData.get(key) as T;
  }

  getValueOr<T>(key: string, fallback: T): T {
    return this.testData.has(key) ? (this.testData.get(key) as T) : fallback;
  }
}
