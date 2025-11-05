const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#userEmail');
    this.passwordInput = page.locator('#userPassword');
    this.loginButton = page.locator('#login');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('https://rahulshettyacademy.com/client/');
  }


  /**
   * Enter email and password into login form
   * @param {string} email
   * @param {string} password
   */
  async enterCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Assert that the Home label in the sidebar is visible after login
   */
  async assertHomeLabel() {
    // Match the exact Home label in the sidebar
    await expect(this.page.locator('#sidebar p')).toHaveText('Home | Search');
  }
}

module.exports = { LoginPage };
