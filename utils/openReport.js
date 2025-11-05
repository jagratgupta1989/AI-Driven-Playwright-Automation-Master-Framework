// utils/openReport.js
// Author: Nannu
// Purpose: Open Allure or Cucumber HTML report automatically in Chrome after test execution

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function openInChrome(filePath) {
  return new Promise((resolve, reject) => {
    exec(`start chrome "${filePath}"`, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function openReport() {
  const cwd = path.resolve(__dirname, '..');
  const allureIndex = path.resolve(cwd, 'reports', 'allure-report', 'index.html');
  const cucumberHtml = path.resolve(cwd, 'reports', 'cucumber-report.html');

  // If a pre-generated Allure static report exists, prefer that
  if (fs.existsSync(allureIndex)) {
    await openInChrome(allureIndex);
    return;
  }

  // If allure-results exist, try to generate a static Allure report and open it
  const allureResults = path.resolve(cwd, 'allure-results');
  if (fs.existsSync(allureResults) && fs.readdirSync(allureResults).length > 0) {
    try {
      // Generate static report into reports/allure-report synchronously so we open the latest report
      try {
        execSync('allure generate allure-results -o reports/allure-report --clean', { cwd, stdio: 'ignore' });
      } catch (err) {
        console.error('Allure generate failed, falling back to cucumber HTML:', err && err.message ? err.message : err);
        // regenerate cucumber HTML and open it
        try {
          const reporter = require('./reporter');
          reporter.generateCucumberReport && reporter.generateCucumberReport();
        } catch (e) {}
        if (fs.existsSync(cucumberHtml)) await openInChrome(cucumberHtml);
        return;
      }
      // On success, open generated report
      if (fs.existsSync(allureIndex)) {
        await openInChrome(allureIndex);
      }
      return;
    } catch (e) {
      // ignore and fallback to cucumber
    }
  }

  // Fallback: regenerate cucumber HTML and open
  try {
    const reporter = require('./reporter');
    if (reporter.generateCucumberReport) reporter.generateCucumberReport();
  } catch (e) {
    // ignore
  }
  if (fs.existsSync(cucumberHtml)) {
    await openInChrome(cucumberHtml);
    return;
  }

  console.error('No report found to open. Generated reports expected under reports/ or allure-results/');
}

openReport().catch((e) => {
  console.error('Failed to open report:', e && e.message ? e.message : e);
  process.exit(1);
});
