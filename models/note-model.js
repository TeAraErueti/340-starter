const pool = require("../database")

async function getNotesByVehicle(inv_id) {
  const sql = `
    SELECT 
      vn.note_id, 
      vn.note_content, 
      vn.note_created, 
      a.account_id, 
      a.account_firstname
    FROM vehicle_notes vn
    JOIN account a ON vn.account_id = a.account_id
    WHERE vn.inv_id = $1
    ORDER BY vn.note_created DESC `
  return pool.query(sql, [inv_id])
}

async function addNote(note_content, account_id, inv_id) {
  const sql = `
    INSERT INTO vehicle_notes (note_content, account_id, inv_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `
  return pool.query(sql, [note_content, account_id, inv_id])
}

async function deleteNote(note_id, account_id) {
  try {
    const sql = `DELETE FROM vehicle_notes WHERE note_id = $1 AND account_id = $2`
    const data = await pool.query(sql, [note_id, account_id])
    return data.rowCount > 0
  } catch (error) {
    throw error
  }
}

module.exports = { getNotesByVehicle, addNote, deleteNote }

