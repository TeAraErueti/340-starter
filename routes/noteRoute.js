const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const utilities = require("../utilities/");
const checkLogin = require("../utilities/checkLogin");
const { body } = require("express-validator");

// Build notes view for a vehicle
router.get("/:inv_id", checkLogin, noteController.buildNotesView);

// Add a note with validation on note_content
router.post(
  "/:inv_id/add",
  checkLogin,
  body("note_content")
    .trim()
    .notEmpty()
    .withMessage("Note content cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Note cannot exceed 500 characters."),
  noteController.addNote
);

// Delete a note
router.post("/:inv_id/delete/:note_id", checkLogin, noteController.deleteNote);

module.exports = router;
