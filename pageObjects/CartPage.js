const { expect } = require('@playwright/test');


/**
 * CartPage class encapsulates cart validation and checkout actions.
 * @class
 * @author Nannu
 * @purpose Encapsulates all cart page interactions for UI automation.
 */
class CartPage {
  /**
   * Initializes the CartPage with the given Playwright page instance.
   * @param {import('playwright').Page} page - Playwright page object.
   */
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('div.cartSection h3');
    this.checkoutButton = page.locator('text=Checkout');
  }

  /**
   * Asserts that the specified product is present in the cart.
   * @param {string} productName - Name of the product to check.
   * @returns {Promise<void>}
   * @purpose Verifies product presence in the cart.
   * @author Nannu
   */
  async assertProductInCart(productName) {
    await expect(this.cartItems).toContainText(productName);
  }

  /**
   * Clicks the checkout button to proceed to checkout.
   * @returns {Promise<void>}
   * @purpose Proceeds to the checkout page.
   * @author Nannu
   */
  async clickCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };