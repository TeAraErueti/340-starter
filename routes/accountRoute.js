// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

/* ****************************************
*  Deliver login view
* *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build login view
router.get("/", utilities.handleErrors(accountController.buildLogin))

module.exports = router

