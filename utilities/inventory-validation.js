const { body, validationResult } = require("express-validator");

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Provide a correct classification name.")

  ];
};

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = res.locals.nav;
    if (!nav) {
      const util = require("../utilities");
      nav = await util.getNav();
    }

    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      message: null
    });
    return;
  }

  next();
};



const inventoryRules = () => {
  return [
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required."),

    body("inv_year")
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .custom((value) => {
        if (
          value.startsWith("http") || 
          value.startsWith("/images/vehicles/")
        ) {
          return true;
        }
        throw new Error("Enter a valid image path (URL or default path).");
      }),

    body("inv_thumbnail")
      .trim()
      .custom((value) => {
        if (
          value.startsWith("http") || 
          value.startsWith("/images/vehicles/")
        ) {
          return true;
        }
        throw new Error("Enter a valid thumbnail path (URL or default path).");
      }),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a number greater than or equal to 0."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative whole number."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The vehicle's color is required.")
  ];
};

const checkInventoryData = async (req, res, next) => {
  const { classification_id } = req.body;
  const errors = validationResult(req);
  const nav = await require("../utilities").getNav();
  const classificationSelect = await require("../utilities").buildClassificationList(classification_id);

  if (!errors.isEmpty()) {
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: errors.array(),
      message: null,
      data: req.body
    });
    return;
  }
  next();
};

// Middleware for checking updated inventory data (redirects to edit view if errors)
const checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);
  const nav = await require("../utilities").getNav();
  const classificationSelect = await require("../utilities").buildClassificationList(classification_id);

  if (!errors.isEmpty()) {
    res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      errors: errors.array(),
      message: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
    return;
  }

  next();
};


module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkUpdateData
};
