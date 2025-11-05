const { expect } = require('@playwright/test');


/**
 * ConfirmationPage class encapsulates order confirmation and order id extraction actions.
 * @class
 * @author Nannu
 * @purpose Encapsulates all confirmation page interactions for UI automation.
 * @date 2024-06-11
 */
class ConfirmationPage {
  /**
   * Initializes the ConfirmationPage with the given Playwright page instance.
   * @param {import('playwright').Page} page - Playwright page object.
   */
  constructor(page) {
    this.page = page;
    this.thankYouMsg = page.locator('.hero-primary');
    // Select the label inside a td with class 'em-spacer-1' and centered text
    this.orderIdElement = page.locator('td.em-spacer-1 label.ng-star-inserted');
  }

  /**
   * Asserts that the thank you message is displayed after order placement.
   * @returns {Promise<void>}
   * @purpose Verifies the order confirmation message.
   * @author Nannu
   */
  async assertThankYouMessage() {
    await expect(this.thankYouMsg).toHaveText('Thankyou for the order.');
  }

  /**
   * Extracts the order id from the confirmation page.
   * @returns {Promise<string>} The extracted order id.
   * @purpose Retrieves the order id for validation.
   * @author Nannu
   */
  async getOrderId() {
    // Wait for the order id label to be visible and extract the id
    await this.orderIdElement.waitFor({ state: 'visible', timeout: 10000 });
    const text = await this.orderIdElement.textContent();
    // Extract the order id from the text (e.g., '| 68e10669f669d6cb0afc5259 |')
    return text.replace(/\|/g, '').trim();
  }
}

module.exports = { ConfirmationPage };