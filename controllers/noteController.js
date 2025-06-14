const noteModel = require("../models/note-model");
const vehicleModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

/* ================================
 * 1. Build Notes View
 * ================================ */
async function buildNotesView(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const nav = await utilities.getNav();
    const notes = await noteModel.getNotesByVehicle(inv_id);

    res.render("notes/notes", {
      title: "Vehicle Notes",
      nav,
      notes: notes.rows,
      inv_id,
      errors: null,
    });
  } catch (error) {
    console.error("Error building notes view:", error);
    next(error);
  }
}

/* ================================
 * 2. Add a Note with validation
 * ================================ */
async function addNote(req, res, next) {
  const errors = validationResult(req);
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const notes = await noteModel.getNotesByVehicle(inv_id);

  if (!errors.isEmpty()) {
    // Get full vehicle info for the detail view
    const vehicle = await vehicleModel.getVehicleById(inv_id);

    if (!vehicle) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "The requested vehicle could not be found.",
        nav,
      });
    }

    return res.status(400).render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML: utilities.buildVehicleDetail(vehicle),
      loggedin: !!res.locals.accountData,
      notes: notes.rows,
      accountData: res.locals.accountData,
      inv_id,
      errors: errors.array(),
      message: null,
    });
  }

  try {
    const { note_content } = req.body;
    const account_id = res.locals.accountData.account_id;

    await noteModel.addNote(note_content, account_id, inv_id);
    req.flash("notice", "Note added successfully.");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error adding note:", error);
    req.flash("notice", "There was an error adding the note.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
}

/* ================================
 * 3. Delete a Note
 * ================================ */
async function deleteNote(req, res) {
  try {
    const note_id = parseInt(req.params.note_id);
    const inv_id = parseInt(req.params.inv_id);
    const account_id = res.locals.accountData.account_id;

    const deleted = await noteModel.deleteNote(note_id, account_id);

    if (deleted) {
      req.flash("notice", "Note deleted successfully.");
    } else {
      req.flash("notice", "Note could not be deleted.");
    }

    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error deleting note:", error);
    req.flash("notice", "An error occurred while deleting the note.");
    res.redirect(`/inv/detail/${req.params.inv_id}`);
  }
}

module.exports = { buildNotesView, addNote, deleteNote };
