const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,  // ✅ This prevents "errors is not defined"
    account_email: null  // optional, for input value
  })
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // Example login logic
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Email not found.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: null // ✅ This prevents "errors is not defined"
    })
  }

  const match = await bcrypt.compare(account_password, accountData.account_password)

if (!match) {
  req.flash("notice", "Incorrect password.")
  return res.status(400).render("account/login", {
    title: "Login",
    nav,
    account_email,
    errors: null
  })
}
  // Successful login
  req.flash("notice", `Welcome back, ${accountData.account_firstname}`)
  res.redirect("/") // Or your preferred dashboard route
} // ✅ Now it's properly closed


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)

  } catch (error) {
  req.flash("notice", 'Sorry, there was an error processing the registration.')
  return res.status(500).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  })
}


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult?.rows?.length > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: null
    })

  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
