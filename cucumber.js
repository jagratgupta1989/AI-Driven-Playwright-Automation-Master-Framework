module.exports = {
  // Emit JSON to `reports/cucumber-report.json` and use Allure reporter for Allure results.
  // We generate the HTML report from the JSON in a single step (utils/reporter.js) to avoid
  // producing multiple HTML outputs that can lead to duplicate entries in the final report.
  default: `--require ./step-definitions/**/*.js --format json:./reports/cucumber-report.json --format allure-cucumberjs/reporter`
};
