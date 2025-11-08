// Declarative Jenkins pipeline for Playwright + Cucumber + Allure
// - Runs tests under QA environment
// - Generates cucumber JSON, cucumber HTML and Allure static report
// - Archives reports as build artifacts

pipeline {
  agent any

  parameters {
    choice(name: 'BROWSER', choices: ['chromium', 'chrome', 'firefox', 'webkit'], description: 'Browser to run tests')
    booleanParam(name: 'HEADLESS', defaultValue: true, description: 'Run tests headless?')
  }

  environment {
    // run tests against QA environment by default, can be overridden via job parameters
    PW_ENV = 'qa'
    // propagate selected browser and headless flag into the environment for test code to consume
    BROWSER = "${params.BROWSER}"
    HEADLESS = "true"
  }

  options {
    // keep build logs for troubleshooting
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        script {
          if (isUnix()) {
            sh 'npx playwright install --with-deps'
          } else {
            bat 'npx playwright install'
          }
        }
      }
    }

    stage('Run tests (Cucumber)') {
      steps {
        script {
          // Run cucumber-js and emit JSON for reporter. Use xvfb-run on Unix if available so the non-headless browser can run.
          if (isUnix()) {
            // prefer xvfb-run so Playwright can launch headed browsers when needed; fallback to direct run
            def cmd = ""
            try {
              sh 'which xvfb-run >/dev/null 2>&1'
              cmd = "xvfb-run -a npx cucumber-js --config cucumber.js --format json:reports/cucumber-report.json --format allure-cucumberjs/reporter"
            } catch (e) {
              cmd = "npx cucumber-js --config cucumber.js --format json:reports/cucumber-report.json --format allure-cucumberjs/reporter"
            }
            sh cmd
          } else {
            // Windows agent
            bat 'npx cucumber-js --config cucumber.js --format json:reports/cucumber-report.json --format allure-cucumberjs/reporter'
          }
        }
      }
    }

    stage('Generate Cucumber HTML') {
      steps {
        script {
          // Use our helper to create an up-to-date cucumber HTML
          if (isUnix()) {
            sh 'node ./utils/reporter.js'
          } else {
            bat 'node ./utils/reporter.js'
          }
        }
      }
    }

    stage('Generate Allure Report') {
      steps {
        script {
          // Try to generate a static Allure report. If allure CLI is not available, this step may fail — keep it non-fatal.
          if (isUnix()) {
            sh 'npx allure generate allure-results -o reports/allure-report --clean || true'
          } else {
            bat 'npx allure generate allure-results -o reports/allure-report --clean || exit 0'
          }
        }
      }
    }

    stage('Publish Allure Report') {
      when {
        expression { fileExists('allure-results') }
      }
      steps {
        script {
          echo 'Publishing Allure results to Jenkins Allure plugin...'
          // The `allure` step is provided by the Jenkins Allure Plugin. This step will publish results collected in allure-results.
          // If the plugin is not installed, this will fail — install the plugin or skip this stage.
          if (fileExists('allure-results')) {
            allure includeProperties: true, jdk: '', results: [[path: 'allure-results']]
          } else {
            echo 'No allure-results directory found; skipping Allure publish.'
          }
        }
      }
    }

  }

  post {
    always {
      script {
        // Archive the cucumber html and Allure report directory for download
        archiveArtifacts artifacts: 'reports/**', fingerprint: true
        // Also archive raw allure-results for deeper debugging
        archiveArtifacts artifacts: 'allure-results/**', fingerprint: true
      }
    }
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed — check logs and attached reports.'
    }
  }
}