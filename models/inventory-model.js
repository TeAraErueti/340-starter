const pool = require("../database/")

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
    throw new Error("Database error while retrieving classifications");
  }
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
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
    console.error("getVehicleById error " + error)
    throw new Error("Database error while retrieving vehicle");
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
};


