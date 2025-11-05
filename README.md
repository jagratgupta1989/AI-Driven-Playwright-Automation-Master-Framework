# Playwright + Cucumber Automation Framework

## Features
- UI, API, and Mobile automation support
- PageObject pattern for maintainable locators and actions
- Cucumber BDD with feature files and step definitions
- HTML reporting via cucumber-html-reporter

## Project Structure
- `features/` - Cucumber feature files
- `step-definitions/` - Step definitions for features
- `pageObjects/` - PageObject classes for UI automation
- `tests/` - Additional test scripts (API/Mobile)
- `reports/` - Test reports
- `utils/` - Utility scripts

## Example Test
- Login test for https://rahulshettyacademy.com/client/ in `features/login.feature`

## Running Tests
```sh
# Run with default browser (chrome)
npx cucumber-js --config cucumber.js

# Run with Firefox
BROWSER=firefox npx cucumber-js --config cucumber.js

# Run with Chromium
BROWSER=chromium npx cucumber-js --config cucumber.js

# Run with WebKit
BROWSER=webkit npx cucumber-js --config cucumber.js
```

## Reports
- After running tests, open `reports/cucumber-report.html` for the HTML report.

## Notes
- Update credentials in `login.steps.js` for a valid login.
- Extend PageObjects and step-definitions for more scenarios.

## Node.js version (important)

This project was developed and tested on Node.js 18/20 LTS. Recent versions of `@cucumber/cucumber` may print a notice when running on Node 22+ saying the Node version "has not been tested" — it's a compatibility notice rather than an error.

To avoid unexpected behavior, use Node 20 (recommended):

- If you use nvm, switch with:

```powershell
nvm install 20; nvm use 20
```

- Or use the provided `.nvmrc` (contains `20`) so tools like `nvm`/`nvm-windows` can auto-switch.

If you prefer to run on Node 22, you can still do so; the message is informational. If you see actual failures when running tests on Node 22, consider upgrading the `@cucumber/cucumber` dependency to a newer release that explicitly supports Node 22.
