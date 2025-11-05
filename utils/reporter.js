const reporter = require('cucumber-html-reporter');

const fs = require('fs');
const path = require('path');

/**
 * Generate cucumber HTML report from `reports/cucumber-report.json`.
 * This function is idempotent and safe to call multiple times.
 */
function generateCucumberReport() {
  // Prefer environment.properties (Allure) if present to keep reports consistent.
  let envName = (process.env.PW_ENV || 'staging').toString();
  let browserName = (process.env.BROWSER || 'Chromium').toString();
  try {
    const envFile = path.resolve(__dirname, '../allure-results/environment.properties');
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const key = line.substring(0, idx).trim();
          const val = line.substring(idx + 1).trim();
          if (key === 'Environment' && val) envName = val;
          if (key === 'Browser' && val) browserName = val;
        }
      });
    }
  } catch (e) {
    // ignore and use env vars
  }

  const options = {
    theme: 'bootstrap',
    jsonFile: './reports/cucumber-report.json',
    output: './reports/cucumber-report.html',
    reportSuiteAsScenarios: true,
    launchReport: false,
    metadata: {
      'App Version': '1.0.0',
      'Test Environment': envName.toString().toUpperCase(),
      'Browser': browserName,
      'Platform': process.platform,
      'Parallel': 'Scenarios',
      'Executed': 'Local'
    }
  };

  try {
    reporter.generate(options);
  } catch (err) {
    // If report generation fails, log and continue; callers may handle errors.
    // Avoid throwing to not break consumers that call this function post-run.
    console.error('Failed to generate cucumber HTML report:', err && err.message ? err.message : err);
  }
}

module.exports = { generateCucumberReport };

// If invoked directly (node utils/reporter.js), generate report immediately.
if (require.main === module) {
  generateCucumberReport();
}
