var LoginPage = function() {
    
    //Constants - could be taken from a test DB for multilevel access test
    const URL = "http://localhost/login";
    const USERNAME = "roger";
    const PASSWORD = "1234";
    const LOGIN_OK = "Login Successful";

    //Attributes - WebElements of the page
    this.usernameElement = element(by.name("field_name_here"));
    this.passwordElement = element(by.id("field_id_here"));
    this.submitElement = element(by.id("field_id_here"));
    this.messageLabel = element(by.id("label_id_here"));

    //Methods - Actions performed at the page using the WebElements
    this.getLoginPage = function() {
        browser.get(URL);
    };
    this.login = function() {
        this.usernameElement.sendKeys(USERNAME).
        then(this.passwordElement.sendKeys(PASSWORD).
            then(this.submitElement.click()
            )
        );
    };
};

//This will export the module to Node.js runtime environment
module.exports = LoginPage;