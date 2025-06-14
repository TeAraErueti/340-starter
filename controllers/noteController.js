const noteModel = require("../models/note-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")

/* ================================
 * 1. Build Notes View (if separate)
 * ================================ */
async function buildNotesView(req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const nav = await utilities.getNav()
    const notes = await noteModel.getNotesByVehicle(inv_id)

    res.render("notes/notes", {
      title: "Vehicle Notes",
      nav,
      notes: notes.rows,
      inv_id,
      errors: null,
    })
  } catch (error) {
    console.error("Error building notes view:", error)
    next(error)
  }
}

/* ================================
 * 2. Add a Note
 * ================================ */
async function addNote(req, res, next) {
  const errors = validationResult(req)
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()

  if (!errors.isEmpty()) {
    const notes = await noteModel.getNotesByVehicle(inv_id)
    return res.render("notes/notes", {
      title: "Vehicle Notes",
      nav,
      inv_id,
      notes: notes.rows,
      errors: errors.array(),
    })
  }

  try {
    const { note_content } = req.body
    const account_id = res.locals.accountData.account_id

    await noteModel.addNote(note_content, account_id, inv_id)
    req.flash("notice", "Note added successfully.")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error("Error adding note:", error)
    req.flash("notice", "There was an error adding the note.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ================================
 * 3. Delete a Note
 * ================================ */
async function deleteNote(req, res) {
  try {
    const note_id = parseInt(req.params.note_id)
    const inv_id = parseInt(req.params.inv_id) // Use same style as addNote
    const account_id = res.locals.accountData.account_id

    const deleted = await noteModel.deleteNote(note_id, account_id)

    if (deleted) {
      req.flash("notice", "Note deleted successfully.")
    } else {
      req.flash("notice", "Note could not be deleted.")
    }

    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error("Error deleting note:", error)
    req.flash("notice", "An error occurred while deleting the note.")
    res.redirect(`/inv/detail/${req.params.inv_id}`)
  }
}

module.exports = { buildNotesView, addNote, deleteNote }
