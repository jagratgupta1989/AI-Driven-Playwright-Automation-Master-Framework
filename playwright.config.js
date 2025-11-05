// playwright.config.js
// Author: Nannu
// Purpose: Centralized Playwright configuration for multiple environments and project settings

const { devices } = require('@playwright/test');

/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  timeout: 60000,
  retries: 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'dev',
      use: {
        baseURL: 'https://dev.rahulshettyacademy.com/client/',
        browserName: 'chromium',
      },
    },
    {
      name: 'qa',
      use: {
        baseURL: 'https://rahulshettyacademy.com/client/',
        browserName: 'chrome',
      },
    },
    {
      name: 'stage',
      use: {
        baseURL: 'https://stage.rahulshettyacademy.com/client/',
        browserName: 'webkit',
      },
    },
    {
      name: 'prod',
      use: {
        baseURL: 'https://rahulshettyacademy.com/client/',
        browserName: 'chromium',
      },
    },
  ],
  reporter: [['list'], ['html', { outputFolder: 'reports', open: 'never' }]],
  outputDir: 'test-results/',
};

module.exports = config;
