const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");


const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);

    let nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildVehicleDetailView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "The requested vehicle could not be found.",
      });
    }

    const vehicleHTML = utilities.buildVehicleDetail(vehicleData);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      message: req.flash("message")
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    message: req.flash("message")
  });
};

/* ***************************
 *  Handle add classification form
 * ************************** */
invCont.addClassification = [
  // Validation rules
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Field is required.")
    .isAlpha().withMessage("Classification name must contain only letters."),

  // Handler function
  async (req, res) => {
    const errors = validationResult(req);
    const { classification_name } = req.body;
    const nav = await utilities.getNav();

    if (!errors.isEmpty()) {
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
        message: null,
        classification_name, // to retain input after error
      });
    }

    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("message", "Classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("message", "Failed to add classification.");
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        message: req.flash("message"),
      });
    }
  }
];


/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
    message: req.flash("message"),
    data: req.body
  });
};

/* ***************************
 *  Handle add inventory form
 * ************************** */
invCont.addInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

  const result = await invModel.addInventory(req.body);

  if (result) {
    req.flash("message", "Inventory item added successfully.");
    res.redirect("/inv");
  } else {
    req.flash("message", "Failed to add inventory item.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      message: req.flash("message"),
      data: req.body
    });
  }
};

module.exports = invCont;
