// config/environments.ts
// Registry of supported environments.
// Each environment maps to a `.env.<env>` file in this directory (copy `.env.example` to create one).
// Select one with ENV=<key>; the default is `demo`.

export interface EnvironmentInfo {
  /** Human readable description */
  description: string;
  /** Corresponding .env filename inside config/ */
  envFile: string;
}

export const DEFAULT_ENV = 'demo';

export const environments: Record<string, EnvironmentInfo> = {
  demo: {
    description: 'Sauce Demo public practice site (the only site authorised for this assessment)',
    envFile: '.env.demo',
  },
};
