const express = require("express")
const router = express.Router()
const noteController = require("../controllers/noteController")
const utilities = require("../utilities/")
const checkLogin = require("../utilities/checkLogin")
const { body } = require("express-validator")


router.get("/:inv_id", utilities.checkLogin, noteController.buildNotesView)
router.post(
  "/:inv_id/add",
  utilities.checkLogin,
  body("note_content")
    .trim()
    .isLength({ min: 1 }).withMessage("Note content cannot be empty.")
    .isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters."),
  noteController.addNote
)

router.post("/:inv_id/delete/:note_id", utilities.checkLogin, noteController.deleteNote)

module.exports = router
