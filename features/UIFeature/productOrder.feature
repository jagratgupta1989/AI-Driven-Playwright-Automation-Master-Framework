Feature: Product Order
  As a user
  I want to order a product and complete the purchase
  So that I can validate the order flow

  Scenario Outline: Order <product> and validate order completion
    Given I am on the login page
    When I enter username "<alias>" and password "unused"
    And I click on the login button
    And I add product "<product>" to the cart
    And I go to the cart
    Then I should see product "<product>" in the cart
    When I click on the checkout button
    And I select country as "<country>"
    And I place the order
    Then I should see the message "<message>"
    When I pick the order id
    When I go to the Orders History page
    Then I should see the order in history

    Examples:
      | alias                | unused | product         | country | message                   |
      | qalearningrepository | dummy  | ADIDAS ORIGINAL | India   | Thankyou for the order.   |
