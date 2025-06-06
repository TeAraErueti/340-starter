const utilities = require("./index") // ✅ Correct path
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

// Login validation rules
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Please enter an email address.")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

//registration validation rules
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Please enter an email address.")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email already exists. Please log in or use different email")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

// Check login form data
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email,
    })
    return
  }
  next()
}


/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/register", {
      errors: errors.array(), // ✅ Important fix
      title: "Registration",
      nav,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
    return
  }
  next()
}

// Account Update Validation Rules
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Please enter an email address.")
      .isEmail()
      .withMessage("Valid email is required.")
      .normalizeEmail()
      .custom(async (email, { req }) => {
        const existing = await accountModel.getAccountByEmail(email)
        // Only throw error if the email exists and belongs to another account
        if (existing && existing.account_id != req.body.account_id) {
          throw new Error("Email already in use.")
        }
      }),
  ]
}

// Password Change Validation Rules
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."),
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account_id: req.body.account_id,
    })
    return
  }
  next()
}

// Check password change data
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
    })
    return
  }
  next()
}


module.exports = validate


