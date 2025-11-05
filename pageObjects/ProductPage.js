const { expect } = require('@playwright/test');


/**
 * ProductPage class encapsulates product listing and cart navigation actions.
 * @class
 * @author Nannu
 * @purpose Encapsulates all product page interactions for UI automation.
 */
class ProductPage {
  /**
   * Initializes the ProductPage with the given Playwright page instance.
   * @param {import('playwright').Page} page - Playwright page object.
   */
  constructor(page) {
    this.page = page;
    this.productCards = page.locator('.card-body');
    this.cartButton = page.locator('button[routerlink="/dashboard/cart"]');
  }

  /**
   * Adds the specified product to the cart by name.
   * @param {string} productName - Name of the product to add.
   * @returns {Promise<void>}
   * @purpose Clicks 'Add To Cart' for the given product.
   * @author Nannu
   */
  async addProductToCart(productName) {
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = await card.locator('b').textContent();
      if (name.trim() === productName) {
        await card.locator('text=Add To Cart').click();
        break;
      }
    }
  }

  /**
   * Navigates to the cart page.
   * @returns {Promise<void>}
   * @purpose Clicks the cart button to go to the cart page.
   * @author Nannu
   */
  async goToCart() {
    await this.cartButton.click();
  }
}

module.exports = { ProductPage };