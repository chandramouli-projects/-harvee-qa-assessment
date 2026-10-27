// Builds the Cucumber "Spark" HTML report from the JSON written by playwright-bdd's
// cucumberReporter (see playwright.config.ts). Run after a test run: npm run report:spark
const fs = require('fs');
const os = require('os');
const path = require('path');

const jsonDir = path.join(__dirname, '..', 'reports', 'cucumber');
const reportPath = path.join(__dirname, '..', 'reports', 'spark-report');

if (!fs.existsSync(path.join(jsonDir, 'cucumber-report.json'))) {
  console.error('No reports/cucumber/cucumber-report.json found. Run `npm test` first.');
  process.exit(1);
}

async function main() {
  // multiple-cucumber-html-reporter v4 is ESM-only, so it is loaded with a dynamic import.
  const { generate } = await import('multiple-cucumber-html-reporter');
  await generate({
    jsonDir,
    reportPath,
    openReportInBrowser: !process.env.CI,
    saveCollectedJSON: false,
    disableLog: true,
    pageTitle: 'Harvee QA Assessment - Test Report',
    reportName: 'Sauce Demo - Cucumber Spark Report',
    displayDuration: true,
    metadata: {
      browser: { name: process.env.BROWSER || 'chromium', version: 'Playwright bundled' },
      device: process.env.CI ? 'CI runner' : 'Local machine',
      platform: { name: process.platform, version: os.release() },
    },
    customData: {
      title: 'Execution Info',
      data: [
        { label: 'Project', value: 'Harvee QA Assessment' },
        { label: 'Application', value: 'https://www.saucedemo.com' },
        { label: 'Environment', value: process.env.ENV || 'demo' },
        { label: 'Generated', value: new Date().toLocaleString() },
      ],
    },
  });
  console.log(`Spark report: ${path.join(reportPath, 'index.html')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
