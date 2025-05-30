// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to view vehicle detail
router.get("/detail/:inv_id", invController.buildVehicleDetailView)

// Route to inventory management view
router.get("/", invController.buildManagement)

// ========================
// Add Classification Routes
// ========================
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

// ========================
// Add Inventory Routes
// ========================
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router

