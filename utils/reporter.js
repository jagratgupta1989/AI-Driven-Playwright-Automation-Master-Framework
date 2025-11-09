const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

/**
 * Generate cucumber HTML report from `reports/cucumber-report.json`.
 * Safe for both local and CI runs (prevents browser launch in CI).
 */
function generateCucumberReport() {
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
    launchReport: false, // ✅ ensures no auto-browser open
    metadata: {
      'App Version': '1.0.0',
      'Test Environment': envName.toString().toUpperCase(),
      'Browser': browserName,
      'Platform': process.platform,
      'Parallel': 'Scenarios',
      'Executed': process.env.CI ? 'CI/CD Pipeline' : 'Local',
    },
  };

  try {
    reporter.generate(options);
    console.log('✅ Cucumber HTML report generated successfully.');
  } catch (err) {
    console.error('❌ Failed to generate cucumber HTML report:', err.message || err);
  }
}

// Only generate immediately if explicitly invoked
if (require.main === module) {
  console.log('Generating Cucumber HTML report...');
  generateCucumberReport();
}

module.exports = { generateCucumberReport };