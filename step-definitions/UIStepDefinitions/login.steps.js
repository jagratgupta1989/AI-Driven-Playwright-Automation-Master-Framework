const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
// Increase default step timeout to 120 seconds to accommodate slower test environments
setDefaultTimeout(120 * 1000); // 120 seconds
const { launchBrowser } = require('../../driver/browserDriver');
const { LoginPage } = require('../../pageObjects/LoginPage');

let browser, context, page, loginPage;

/**
 * Step definition: Launches browser and navigates to login page.
 * Purpose: To initialize browser, context, and page for login scenario.
 * Author: Nannu
 */
Given('I am on the login page', async function () {
  const { browser, context, page, baseUrl } = await launchBrowser();
  this.browser = browser;
  this.context = context;
  this.page = page;
  this.loginPage = new LoginPage(this.page);
  await this.page.goto(baseUrl || 'https://rahulshettyacademy.com/client/');
  await this.page.waitForSelector('#userEmail', { state: 'visible', timeout: 10000 });
});

/**
 * Step definition: Enters username and password.
 * Purpose: To fill in login credentials on the login page.
 * Author: Nannu
 */
const { getCredentials } = require('../../utils/credentials');

When('I enter username {string} and password {string}', async function (alias, _unused) {
  // Fetch encrypted credentials by alias
  const creds = getCredentials(alias);
  await this.loginPage.enterCredentials(creds.username, creds.password);
  await this.page.waitForTimeout(500); // Wait for input to be processed
});

/**
 * Step definition: Clicks the login button.
 * Purpose: To submit the login form and trigger authentication.
 * Author: Nannu
 * Date: 2025-10-11
 */
When('I click on the login button', async function () {
  await this.loginPage.clickLogin();
  await this.page.waitForLoadState('networkidle', { timeout: 10000 });
});

/**
 * Step definition: Verifies dashboard redirection.
 * Purpose: To assert successful login by checking dashboard visibility.
 * Author: Nannu
 */
Then('I should be redirected to the dashboard', async function () {
  await this.page.waitForSelector('#sidebar p', { state: 'visible', timeout: 10000 });
  await this.loginPage.assertHomeLabel();
  await this.browser.close();
});
