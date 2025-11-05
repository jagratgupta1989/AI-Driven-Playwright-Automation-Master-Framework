const { BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { exec } = require('child_process');
const path = require('path');

// Path to the generated Cucumber HTML report (adjusted for new location)
const reportPath = path.resolve(__dirname, '../../reports/cucumber-report.html');

function openReportInChrome() {
  const platform = process.platform;
  let cmd;

  if (platform === 'win32') {
    // Use start to open in Chrome on Windows
    cmd = `start chrome "${reportPath}"`;
  } else if (platform === 'darwin') {
    // macOS: open with Google Chrome
    cmd = `open -a "Google Chrome" "${reportPath}"`;
  } else {
    // Linux: try common chrome/chromium commands, fallback to xdg-open
    cmd = `google-chrome "${reportPath}" || chromium-browser "${reportPath}" || xdg-open "${reportPath}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      // Best-effort: log a warning but don't fail the test run
      console.warn('Could not automatically open report in Chrome:', err.message || err);
    }
  });
}

// Before the test run starts, clear any old Allure result files so the generated Allure report
// only contains data from the current run (prevents duplicate test cases caused by stale files).
BeforeAll(async function () {
  try {
    const fs = require('fs');
    const allureResultsDir = path.resolve(__dirname, '../../allure-results');
    if (fs.existsSync(allureResultsDir)) {
      // Remove directory and recreate it to ensure a clean slate
      fs.rmSync(allureResultsDir, { recursive: true, force: true });
      fs.mkdirSync(allureResultsDir, { recursive: true });
    }
    // Create an Allure environment.properties file so the generated Allure report shows environment info
    try {
      const baseConfig = require('../../playwright.config');
      const envName = process.env.PW_ENV || 'prod';
      const project = (baseConfig.projects || []).find(p => p.name === envName) || baseConfig.projects[0] || {};
      const browserName = (process.env.BROWSER) || (project.use && project.use.browserName) || (baseConfig.use && baseConfig.use.browserName) || 'chromium';
      const baseUrl = (project.use && project.use.baseURL) || baseConfig.baseURL || '';
      const nodeVersion = process.version || '';
      const platform = process.platform || '';

      const envProps = [
        `Environment=${envName}`,
        `Browser=${browserName}`,
        `BaseURL=${baseUrl}`,
        `Platform=${platform}`,
        `Node=${nodeVersion}`,
      ].join('\n');

      const envFilePath = path.join(allureResultsDir, 'environment.properties');
      fs.writeFileSync(envFilePath, envProps, { encoding: 'utf8' });
    } catch (e) {
      // Non-fatal: log and continue
      console.warn('Could not write environment.properties for Allure:', e && e.message ? e.message : e);
    }
  } catch (e) {
    // Non-fatal: log and continue
    console.warn('Could not clear allure-results directory before run:', e && e.message ? e.message : e);
  }
});

// After all scenarios finish, attempt to open the report. Wait for Allure result files if present,
// generate the Allure report reliably and then open it in Chrome (best-effort).
AfterAll(async function () {
  // Open the Cucumber HTML report first (best-effort)
  try {
    openReportInChrome();
  } catch (e) {
    console.warn('Failed to open Cucumber HTML report:', e && e.message ? e.message : e);
  }

  const fs = require('fs');
  const allureResultsDir = path.resolve(__dirname, '../../allure-results');
  const allureReportOut = path.resolve(__dirname, '../../reports/allure-report');

  // If there is no allure-results directory, nothing to do
  if (!fs.existsSync(allureResultsDir)) {
    return;
  }

  // Wait for Allure result JSON files to appear (in case report hook triggers before files are flushed).
  const waitForFiles = (dir, timeoutMs = 15000, intervalMs = 300) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        try {
          const items = fs.readdirSync(dir);
          const hasResultJson = items.some((n) => /-result\.json$/.test(n) || /test-cases/.test(n));
          if (hasResultJson) return resolve(true);
        } catch (e) {
          // ignore and retry
        }
        if (Date.now() - start > timeoutMs) return resolve(false);
        setTimeout(check, intervalMs);
      };
      check();
    });
  };

  const ready = await waitForFiles(allureResultsDir, 20000, 300);
  if (!ready) {
    console.warn('No Allure result files detected in', allureResultsDir);
    return;
  }

  // Generate Allure HTML report using local Allure CLI (npx). This is synchronous-looking but runs as a child process.
  const genCmd = `npx allure generate "${allureResultsDir}" -o "${allureReportOut}" --clean`;
  exec(genCmd, (genErr, genStdout, genStderr) => {
    if (genErr) {
      console.warn('Allure report generation failed (this is non-fatal):', genErr.message || genErr);
      return;
    }
      // After successful generation, try to open the report in a reliable way.
      // Primary: use `npx allure open` which serves the report and opens the browser.
      // Fallback: attempt to open index.html directly in Chrome / default browser.
      const indexPath = path.join(allureReportOut, 'index.html');
      const logPath = path.join(allureReportOut, 'auto-open.log');

      // Helper to write a small log for debugging auto-open problems
      const writeLog = (msg) => {
        try {
          fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`);
        } catch (e) {
          // ignore logging errors
        }
      };

      // First try using the Allure CLI open command (this is the most consistent across platforms)
      const { spawn } = require('child_process');

      // Spawn `npx allure open` as detached so it doesn't block the test process.
      try {
        const child = spawn(`npx`, ["allure", "open", `${allureReportOut}`], {
          shell: true,
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        writeLog('Spawned `npx allure open` as detached process.');
        return;
      } catch (e) {
        writeLog(`Failed to spawn npx allure open: ${e && e.message ? e.message : e}`);
      }

      // Fallback: try to open index.html directly (detached)
      const platform = process.platform;
      let fallbackCmdArr;
      if (platform === 'win32') {
        // Use start with shell; spawn shell command
        fallbackCmdArr = [`start`, `""`, `${indexPath}`];
      } else if (platform === 'darwin') {
        fallbackCmdArr = [`open`, `-a`, `Google Chrome`, `${indexPath}`];
      } else {
        // on Linux try chrome or xdg-open
        fallbackCmdArr = [`sh`, `-c`, `google-chrome "${indexPath}" || chromium-browser "${indexPath}" || xdg-open "${indexPath}"`];
      }

      try {
        const fb = spawn(fallbackCmdArr[0], fallbackCmdArr.slice(1), { shell: false, detached: true, stdio: 'ignore' });
        fb.unref();
        writeLog('Spawned fallback open command as detached process.');
      } catch (fbErr) {
        writeLog(`Fallback spawn failed: ${fbErr && fbErr.message ? fbErr.message : fbErr}`);
        console.warn('Could not automatically open Allure report. See reports/allure-report/auto-open.log for details.');
      }
  });
});
