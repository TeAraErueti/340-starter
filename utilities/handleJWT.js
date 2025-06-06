const jwt = require("jsonwebtoken")
require("dotenv").config()

function handleJWT(req, res, next) {
  const token = req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.accountData = decoded
      res.locals.loggedin = true
    } catch (err) {
      res.locals.accountData = null
      res.locals.loggedin = false
    }
  } else {
    res.locals.accountData = null
    res.locals.loggedin = false
  }
  next()
}


module.exports = handleJWT
