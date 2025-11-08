// Declarative Jenkins pipeline for Playwright + Cucumber + Allure
// - Runs tests under QA environment
// - Generates cucumber JSON, cucumber HTML and Allure static report
// - Archives reports as build artifacts

pipeline {
  agent any

  environment {
    // run tests against QA environment
    PW_ENV = 'qa'
    // ensure node version in Jenkins agent matches repo engines (>=18 <22)
    // If you manage multiple node installations in Jenkins, configure a NodeJS tool and set NODE_HOME accordingly here.
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
            bat 'node .\utils\reporter.js'
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
