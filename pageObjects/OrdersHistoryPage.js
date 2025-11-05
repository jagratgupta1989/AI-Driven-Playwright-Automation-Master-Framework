const { expect } = require('@playwright/test');


/**
 * OrdersHistoryPage class encapsulates order history validation actions.
 * @class
 * @author Nannu
 * @purpose Encapsulates all orders history page interactions for UI automation.
 */
class OrdersHistoryPage {
  /**
   * Initializes the OrdersHistoryPage with the given Playwright page instance.
   * @param {import('playwright').Page} page - Playwright page object.
   */
  constructor(page) {
    this.page = page;
    this.orderRows = page.locator('table tbody tr');
  }

  /**
   * Asserts that the specified order id is present in the orders history table.
   * @param {string} orderId - The order id to check for.
   * @returns {Promise<void>}
   * @purpose Verifies the order id is present in history.
   * @author Nannu
   */
  async assertOrderIdPresent(orderId) {
    const count = await this.orderRows.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const row = this.orderRows.nth(i);
      const text = await row.textContent();
      if (text && text.includes(orderId)) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
  }
}

module.exports = { OrdersHistoryPage };
