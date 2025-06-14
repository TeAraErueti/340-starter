const express = require("express")
const router = express.Router()
const noteController = require("../controllers/noteController")
const utilities = require("../utilities/")
const checkLogin = require("../utilities/checkLogin")


router.get("/:inv_id", utilities.checkLogin, noteController.buildNotesView)
router.post("/:inv_id/add", utilities.checkLogin, noteController.addNote)
router.post("/:inv_id/delete/:note_id", utilities.checkLogin, noteController.deleteNote)



module.exports = router
