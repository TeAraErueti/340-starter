// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// ========================
// Public Routes (NO login required)
// ========================

// View inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId)

// View vehicle detail
router.get("/detail/:inv_id", invController.buildVehicleDetailView)

// Get inventory JSON (used by AJAX)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));


// ========================
// Protected Routes (Login + Admin/Employee ONLY)
// ========================

// Inventory management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))

// Add Classification
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Edit Inventory
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

// Update Inventory
router.post(
  "/update",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventoryView))
router.post("/delete", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory))

module.exports = router


