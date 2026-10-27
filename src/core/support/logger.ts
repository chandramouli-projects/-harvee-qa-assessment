import { configure, getLogger } from 'log4js';

// The file always records step traces at info level. The console only shows LOG_LEVEL and above
// (default warn), so the Playwright list reporter stays readable. Set LOG_LEVEL=info to follow
// every step live.
configure({
  appenders: {
    stdout: {
      type: 'stdout',
      layout: { type: 'pattern', pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] %m' },
    },
    console: {
      type: 'logLevelFilter',
      appender: 'stdout',
      level: process.env['LOG_LEVEL'] ?? 'warn',
    },
    file: {
      type: 'file',
      filename: 'logs/test-execution.log',
      layout: { type: 'pattern', pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] [pid %z] %m' },
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});

export const logger = getLogger('harvee-qa');
