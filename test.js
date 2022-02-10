var LoginPage = require("../pageobjects/LoginPage");
var loginPage = new LoginPage();

//The test suite and specs (it)
describe('Sanity Test Suite', function() {
    describe('Login test', function() {
        it('Should login and verify success', function() {
            loginPage.login().then(function() {
                loginPage.messageLabel.getText().then(function(text) {
                    expect(text).toBe(loginPage.LOGIN_OK);
                })
            });
        }, 10000);
    });
});