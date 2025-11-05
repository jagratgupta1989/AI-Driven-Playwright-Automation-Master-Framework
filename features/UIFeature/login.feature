Feature: Login Functionality
  As a user
  I want to login to the client portal
  So that I can access my account

  Scenario Outline: Successful login with valid credentials
    Given I am on the login page
    When I enter username "<alias>" and password "unused"
    And I click on the login button
    Then I should be redirected to the dashboard

    Examples:
      | alias                | unused |
      | qalearningrepository | dummy  |
