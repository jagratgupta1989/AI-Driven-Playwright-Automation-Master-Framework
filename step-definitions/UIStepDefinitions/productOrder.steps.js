const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
// Increase default step timeout to 120 seconds for slower environments
setDefaultTimeout(120 * 1000);
const { ProductPage } = require('../../pageObjects/ProductPage');
const { CartPage } = require('../../pageObjects/CartPage');
const { CheckoutPage } = require('../../pageObjects/CheckoutPage');
const { ConfirmationPage } = require('../../pageObjects/ConfirmationPage');

let productPage, cartPage, checkoutPage, confirmationPage;


const { launchBrowser } = require('../../driver/browserDriver');


/**
 * Step definition: Adds a product to the cart.
 * Purpose: To add a specified product to the shopping cart.
 * Author: Nannu
 */
When('I add product {string} to the cart', async function (productName) {
  // If browser/page is not already initialized (e.g., if this is the first step), launch it
  if (!this.page) {
  // Browser selection is now driven by Playwright config or environment
  const { browser, context, page, timeout, baseUrl } = await launchBrowser();
  this.browser = browser;
  this.context = context;
  this.page = page;
  this.timeout = timeout;
  await this.page.goto(baseUrl || 'https://rahulshettyacademy.com/client/');
  }
  this.productPage = new ProductPage(this.page);
  const timeout = this.timeout || 10000;
  await this.page.waitForSelector('.card-body', { state: 'visible', timeout });
  await this.productPage.addProductToCart(productName);
  await this.page.waitForTimeout(500);
});


/**
 * Step definition: Navigates to the cart page.
 * Purpose: To go to the cart and initialize CartPage object.
 * Author: Nannu
 */
When('I go to the cart', async function () {
  await this.productPage.goToCart();
  await this.page.waitForSelector('div.cartSection h3', { state: 'visible', timeout: 10000 });
  this.cartPage = new CartPage(this.page);
});


/**
 * Step definition: Asserts product is in the cart.
 * Purpose: To verify the specified product is present in the cart.
 * Author: Nannu
 * Date: 2025-10-11
 */
Then('I should see product {string} in the cart', async function (productName) {
  await this.cartPage.assertProductInCart(productName);
  await this.page.waitForTimeout(500);
});


/**
 * Step definition: Clicks the checkout button.
 * Purpose: To proceed to the checkout page.
 * Author: Nannu
 */
When('I click on the checkout button', async function () {
  await this.cartPage.clickCheckout();
  await this.page.waitForSelector('[placeholder="Select Country"]', { state: 'visible', timeout: 10000 });
  this.checkoutPage = new CheckoutPage(this.page);
});


/**
 * Step definition: Selects a country during checkout.
 * Purpose: To select the specified country for shipping/payment.
 * Author: Nannu
 */
When('I select country as {string}', async function (country) {
  await this.checkoutPage.selectCountry(country);
  await this.page.waitForTimeout(500);
});


/**
 * Step definition: Places the order.
 * Purpose: To complete the order and reach the confirmation page.
 * Author: Nannu
 */
When('I place the order', async function () {
  await this.checkoutPage.placeOrder();
  await this.page.waitForSelector('.hero-primary', { state: 'visible', timeout: 10000 });
  this.confirmationPage = new ConfirmationPage(this.page);
});


/**
 * Step definition: Asserts the thank you message after order.
 * Purpose: To verify the order confirmation message is displayed.
 * Author: Nannu
 */
Then('I should see the message {string}', async function (message) {
  await this.confirmationPage.assertThankYouMessage();
  await this.page.waitForTimeout(500);
});


/**
 * Step definition: Picks the order id from confirmation page.
 * Purpose: To extract the order id for later validation.
 * Author: Nannu
 */
When('I pick the order id', async function () {
  this.orderId = await this.confirmationPage.getOrderId();
});


/**
 * Step definition: Navigates to Orders History page.
 * Purpose: To go to the Orders History page for order validation.
 * Author: Nannu
 */
When('I go to the Orders History page', async function () {
  // 2. Click on Orders History Page (assuming a link or button exists)
  await this.page.click('button[routerlink="/dashboard/myorders"]');
  await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 10000 });
  const { OrdersHistoryPage } = require('../../pageObjects/OrdersHistoryPage');
  this.ordersHistoryPage = new OrdersHistoryPage(this.page);
});


/**
 * Step definition: Asserts the order id is present in history.
 * Purpose: To verify the placed order appears in the Orders History page.
 * Author: Nannu
 */
Then('I should see the order in history', async function () {
  // 3. Validate order id is present
  await this.ordersHistoryPage.assertOrderIdPresent(this.orderId);
  await this.page.waitForTimeout(500);
  await this.browser.close();
});
