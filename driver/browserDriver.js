
/**
 * Playwright browser launch utility module.
 * @module browserDriver
 * @author Nannu
 * @purpose Provides a utility to launch browsers dynamically for Playwright automation.
 */
const { chromium, firefox, webkit } = require('playwright');
const baseConfig = require('../playwright.config');

/**
 * Launches a browser dynamically based on options, environment variable, or Playwright config.
 * Priority: options > env > playwright.config.js > default
 *
 * @function
 * @param {Object} [options] - Options to override config/env.
 * @param {string} [options.browserName] - 'chrome', 'chromium', 'firefox', or 'webkit'.
 * @param {boolean} [options.headless] - Whether to run headless.
 * @param {number} [options.timeout] - Timeout for browser launch and waits (ms).
 * @returns {Promise<{browser, context, page, timeout, baseUrl}>} Browser, context, page, timeout, and baseUrl.
 * @purpose Launches the specified browser and returns context/page for automation.
 * @author Nannu
 */
async function launchBrowser(options = {}) {
  // Priority: options > env > playwright.config.js > default
  // Determine browser name
  // Determine headless mode
  // Determine timeout
  const env = process.env.PW_ENV || 'prod';
  const project = (baseConfig.projects || []).find(p => p.name === env) || baseConfig.projects[0];
  const browserName = options.browserName || process.env.BROWSER || (project && project.use && project.use.browserName) || 'chromium';
  // Determine headless: priority options > env var HEADLESS > project.use > baseConfig.use > default false
  let headless;
  if (options.headless !== undefined) {
    headless = options.headless;
  } else if (process.env.HEADLESS !== undefined) {
    const envHeadless = process.env.HEADLESS.toString().toLowerCase();
    headless = (envHeadless === 'true' || envHeadless === '1');
  } else if (project && project.use && project.use.headless !== undefined) {
    headless = project.use.headless;
  } else if (baseConfig.use && baseConfig.use.headless !== undefined) {
    headless = baseConfig.use.headless;
  } else {
    headless = false;
  }
  const timeout = options.timeout !== undefined ? options.timeout : (baseConfig.timeout || 10000);
  let browser;
  // Launch the selected browser
  if (browserName === 'chrome') {
    browser = await chromium.launch({ channel: 'chrome', headless, timeout });
  } else if (browserName === 'chromium') {
    browser = await chromium.launch({ headless, timeout });
  } else if (browserName === 'firefox') {
    browser = await firefox.launch({ headless, timeout });
  } else if (browserName === 'webkit') {
    browser = await webkit.launch({ headless, timeout });
  } else {
    throw new Error(`Unsupported browser: ${browserName}`);
  }
  // Create context and page
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page, timeout, baseUrl: (project && project.use && project.use.baseURL) };
}

module.exports = { launchBrowser };
