const { expect } = require('@playwright/test');


/**
 * CheckoutPage class encapsulates country selection and order placement actions.
 * @class
 * @author Nannu
 * @purpose Encapsulates all checkout page interactions for UI automation.
 */
class CheckoutPage {
  /**
   * Initializes the CheckoutPage with the given Playwright page instance.
   * @param {import('playwright').Page} page - Playwright page object.
   */
  constructor(page) {
    this.page = page;
    this.countryInput = page.locator('[placeholder="Select Country"]');
    this.countryDropdown = page.locator('.ta-results button');
    this.placeOrderButton = page.locator('text=Place Order');
  }

  /**
   * Selects the specified country from the dropdown during checkout.
   * @param {string} country - Country name to select.
   * @returns {Promise<void>}
   * @purpose Selects a country for shipping/payment.
   * @author Nannu
   */
  async selectCountry(country) {
    await this.countryInput.click();
    await this.countryInput.pressSequentially(country);
    await this.page.waitForSelector('.ta-results button', { state: 'visible', timeout: 10000 });
    // Find the dropdown option that matches the country and click it
    const options = this.page.locator('.ta-results button');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim() === country) {
        await options.nth(i).click();
        break;
      }
    }
  }

  /**
   * Clicks the place order button to complete the order.
   * @returns {Promise<void>}
   * @purpose Places the order and navigates to confirmation.
   * @author Nannu
   */
  async placeOrder() {
    await this.placeOrderButton.click();
  }
}

module.exports = { CheckoutPage };