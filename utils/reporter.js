const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

/**
 * Generate cucumber HTML report safely for both local and CI environments.
 */
function generateCucumberReport() {
  let envName = (process.env.PW_ENV || 'staging').toString();
  let browserName = (process.env.BROWSER || 'Chromium').toString();

  // Try reading Allure environment details if present
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
    // ignore
  }

  const options = {
    theme: 'bootstrap',
    jsonFile: './reports/cucumber-report.json',
    output: './reports/cucumber-report.html',
    reportSuiteAsScenarios: true,
    launchReport: !process.env.CI, // 🚀 only launch locally
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
    // 🔥 Prevent auto-open in CI by monkey-patching reporter internals
    if (process.env.CI) {
      const open = require('open');
      const originalOpen = open;
      require('open') = () => Promise.resolve(); // disable auto open
      reporter.generate(options);
      require('open') = originalOpen; // restore
    } else {
      reporter.generate(options);
    }

    console.log('✅ Cucumber HTML report generated successfully.');
  } catch (err) {
    console.error('❌ Failed to generate cucumber HTML report:', err.message || err);
  }
}

if (require.main === module) {
  console.log('Generating Cucumber HTML report...');
  generateCucumberReport();
}

module.exports = { generateCucumberReport };