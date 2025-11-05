Feature: API Intercept - Orders 404
  As a test engineer I want to simulate the orders API returning 404 so the UI shows the "no orders" message

  Scenario: Force orders API to return 404 and validate UI message
    Given I open the application
    When I login with alias "qalearningrepository"
    And I intercept the orders API to return 404
    And I click the Orders link
    Then I should see the no-orders message "You have No Orders to show at this time. Please Visit Back Us"
