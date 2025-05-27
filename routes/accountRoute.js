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
*  Process login attempt
* *************************************** */
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount) // ✅ Wrap it!
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

module.exports = router


