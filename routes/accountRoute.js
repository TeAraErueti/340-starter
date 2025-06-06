// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const validate = require('../utilities/account-validation')

/* ****************************************
*  Deliver login view
* *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************************
*  Deliver register view
* *************************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* ****************************************
*  Deliver account management view (after login)
* *************************************** */
router.get(
  "/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ****************************************
* Build update account view
* *************************************** */
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)


/* ****************************************
*  Process login attempt
* *************************************** */
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
*  Process registration
* *************************************** */
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Handle account info update
router.post(
  "/update",
  validate.updateAccountRules(),
  validate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Handle password update
router.post(
  "/update-password",
  validate.passwordRules(), 
  validate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("message", "You have been logged out.")
  res.redirect("/")
})

module.exports = router




