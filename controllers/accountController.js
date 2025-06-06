const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")

require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,  
    account_email: null  
  })
}

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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 Deliver account management view after login
 *************************************** */

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("message"),
    accountData,
  })
}

/* ****************************************
*  Build update account view  
* *************************************** */
async function buildUpdateAccount(req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const loggedInAccountId = res.locals.accountData?.account_id

  // Debug log
  console.log("account_id in URL:", account_id)
  console.log("Logged in account ID:", loggedInAccountId)

  if (loggedInAccountId != account_id) {
    req.flash("notice", "You are not authorized to edit this account.")
    return res.redirect("/account")
  }

  const result = await accountModel.getAccountById(account_id)

    if (!result || !result.rows || result.rows.length === 0) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account")
  }

const account = result.rows[0]

  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData: res.locals.accountData,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email,
    errors: null,
    message: req.flash("message")
  })
}


// Update account info
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      errors: errors.array()
    })
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult.rowCount === 1) {
    
    const updatedAccountData = updateResult.rows[0]
    delete updatedAccountData.account_password

    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000
    })

    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("message", "Account information updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("message", "Account update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      errors: null,
    })
  }
}

// Update password
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  let { account_id, account_password } = req.body
  account_id = parseInt(account_id, 10)


  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account_id,
      errors: errors.array(),
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(hashedPassword, account_id)

    if (result.rowCount === 1) {
      req.flash("message", "Password updated successfully.")
    } else {
      req.flash("message", "Password update failed.")
    }

    res.redirect("/account/")
  } catch (error) {
    req.flash("message", "An error occurred.")
    res.redirect("/account/")
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword }
