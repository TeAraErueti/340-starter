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

const checkClassificationData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = res.locals.nav;
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
      .isURL({ protocols: ['http','https'], require_protocol: false })
      .withMessage("Enter a valid image path (URL)."),

    body("inv_thumbnail")
      .trim()
      .isURL({ protocols: ['http','https'], require_protocol: false })
      .withMessage("Enter a valid thumbnail path (URL)."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a number greater than or equal to 0."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative whole number."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required.")
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

module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData
};
