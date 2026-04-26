import db from '../db/database.js';

// Get all licenses with owner info
export const getLicenses = (req, res) => {
  const { search } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let query = `
    SELECT l.*, o.full_name as owner_name, o.aadhar_no 
    FROM driving_licenses l
    JOIN owners o ON l.owner_id = o.owner_id
    WHERE 1=1
  `;
  let params = [];

  if (role === 'user') {
    query += " AND o.user_id = ?";
    params.push(userId);
  }

  if (search) {
    query += " AND (l.license_number LIKE ? OR o.full_name LIKE ? OR l.license_type LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY l.expiry_date ASC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new driving license
export const createLicense = (req, res) => {
  const { owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto } = req.body;

  if (!owner_id || !license_number || !license_type) {
    return res.status(400).json({ error: "Owner, License Number, and Type are required." });
  }

  const query = `INSERT INTO driving_licenses (owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ license_id: this.lastID, ...req.body });
  });
};

// Update driving license
export const updateLicense = (req, res) => {
  const { id } = req.params;
  const { license_number, license_type, issue_date, expiry_date, issuing_rto } = req.body;

  const query = `UPDATE driving_licenses SET 
                 license_number = ?, license_type = ?, issue_date = ?, 
                 expiry_date = ?, issuing_rto = ? 
                 WHERE license_id = ?`;

  db.run(query, [license_number, license_type, issue_date, expiry_date, issuing_rto, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "License updated successfully", ...req.body });
  });
};

// Delete driving license
export const deleteLicense = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM driving_licenses WHERE license_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "License record deleted" });
  });
};
