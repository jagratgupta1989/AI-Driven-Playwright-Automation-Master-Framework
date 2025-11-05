const { LoginPage } = require('../pageObjects/LoginPage');
const { getCredentials } = require('../utils/credentials');

/**
 * Helper to perform UI login using alias defined in credentials utility.
 * @param {import('playwright').Page} page
 * @param {string} alias
 */
async function performLogin(page, alias) {
  const creds = getCredentials(alias);
  const loginPage = new LoginPage(page);
  // Ensure on login page
  await page.goto('https://rahulshettyacademy.com/client/');
  await page.waitForSelector('#userEmail', { state: 'visible', timeout: 10000 });
  await loginPage.enterCredentials(creds.username, creds.password);
  await loginPage.clickLogin();
  // Wait for dashboard indicator
  await page.waitForSelector('#sidebar p', { state: 'visible', timeout: 15000 });
}

module.exports = { performLogin };
