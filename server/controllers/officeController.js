import db from '../db/database.js';

// Get all RTO offices
export const getOffices = (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM rto_offices";
  let params = [];

  if (search) {
    query += " WHERE office_code LIKE ? OR office_name LIKE ? OR city LIKE ?";
    const searchParam = `%${search}%`;
    params = [searchParam, searchParam, searchParam];
  }

  query += " ORDER BY office_code ASC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new RTO office
export const createOffice = (req, res) => {
  const { office_code, office_name, city, address, contact_no, jurisdiction_area } = req.body;

  if (!office_code || !office_name || !city) {
    return res.status(400).json({ error: "Office Code, Name, and City are required." });
  }

  const query = `INSERT INTO rto_offices (office_code, office_name, city, address, contact_no, jurisdiction_area) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [office_code, office_name, city, address, contact_no, jurisdiction_area], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ office_id: this.lastID, ...req.body });
  });
};

// Update RTO office
export const updateOffice = (req, res) => {
  const { id } = req.params;
  const { office_code, office_name, city, address, contact_no, jurisdiction_area } = req.body;

  const query = `UPDATE rto_offices SET 
                 office_code = ?, office_name = ?, city = ?, 
                 address = ?, contact_no = ?, jurisdiction_area = ? 
                 WHERE office_id = ?`;

  db.run(query, [office_code, office_name, city, address, contact_no, jurisdiction_area, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Office updated successfully", ...req.body });
  });
};

// Delete RTO office
export const deleteOffice = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM rto_offices WHERE office_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Office deleted successfully" });
  });
};
