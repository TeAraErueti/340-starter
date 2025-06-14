const invModel = require("../models/inventory-model");
const noteModel = require("../models/note-model");
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
    const notesData = await noteModel.getNotesByVehicle(inv_id); 

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
      vehicle: vehicleData,
      inv_id, 
      notes: notesData.rows, 
      loggedin: res.locals.loggedin || false ,
      message: req.flash("notice"),
      errors:[]
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
    const classificationSelect = await utilities.buildClassificationList(); 

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, 
      errors: null,
      message: req.flash("notice")
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
    message: req.flash("notice")
  });
};

/* ***************************
 *  Handle add classification form
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const nav = await utilities.getNav();

  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash("notice", `The ${classification_name} classification was added successfully.`);
    res.redirect("/inv");
  } else {
    req.flash("notice", `Failed to add ${classification_name} classification.`);
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      message: req.flash("notice"),
    });
  }
};


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
    message: req.flash("notice"),
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
    req.flash("notice", `The '${make}' '${model}' was successfully added.`);
    res.redirect("/inv");
  } else {
    req.flash("notice", `Failed to add '${make}' '${model}' to inventory.`);
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
      data: req.body
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)

    // SAFETY CHECK
    if (!itemData) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, we appear to have lost that page.",
      })
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
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
    })
  }
}

/* ****************************************
 * Deliver the delete confirmation view
 **************************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    // SAFETY CHECK
    if (!itemData) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, we appear to have lost that page.",
        nav,
      });
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      message: req.flash("notice"),
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Process the delete of an inventory item
 **************************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);

    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult) {
      req.flash("notice", "Inventory item deleted successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to delete inventory item.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};


module.exports = invCont;
