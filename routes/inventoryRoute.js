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

// Route to get inventory by classification ID (used by client-side JS)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));


// ========================
// Add Classification Routes
// ========================
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
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

// ========================
// Edit Inventory Item Route
// ========================
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

// ========================
// Update Inventory Item Route
// ========================
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// ========================
// Delete Inventory Item Routes
// ========================

// Deliver delete confirmation view
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteInventoryView)
);

// Process delete inventory item
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router

