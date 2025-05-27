const pool = require("../database/");

/* ***************************
 * Get all classification data
 * ************************* */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result.rows;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw new Error("Database error while retrieving classifications");
  }
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw new Error("Database error while retrieving inventory by classification ID");
  }
}

/* ***************************
 * Get vehicle detail by inventory ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw new Error("Database error while retrieving vehicle");
  }
}

/* ***************************
 * Add new classification to database
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING classification_id";
    const trimmedName = classification_name.trim();
    const data = await pool.query(sql, [trimmedName]);
    return data.rows[0].classification_id;
  } catch (error) {
    console.error("addClassification error:", error);
    return null;
  }
}

/* ***************************
 * Add new inventory item to database
 * ************************** */
async function addInventory(data) {
  const {
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  } = data;

  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const result = await pool.query(sql, [
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    ]);
    return result.rowCount;
  } catch (error) {
    console.error("addInventory error:", error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory 
};
