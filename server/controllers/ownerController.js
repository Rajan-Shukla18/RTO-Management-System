import db from '../db/database.js';

// Get all owners with search functionality
export const getOwners = (req, res) => {
  const { search } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let query = "SELECT * FROM owners WHERE 1=1";
  let params = [];

  if (role === 'user') {
    query += " AND user_id = ?";
    params.push(userId);
  }

  if (search) {
    query += " AND (full_name LIKE ? OR mobile_no LIKE ? OR aadhar_no LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new owner
export const createOwner = (req, res) => {
  const { full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address } = req.body;

  if (!full_name || !mobile_no || !aadhar_no) {
    return res.status(400).json({ error: "Full name, Mobile number, and Aadhaar number are required." });
  }

  const query = `INSERT INTO owners (full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ owner_id: this.lastID, ...req.body });
  });
};

// Update owner
export const updateOwner = (req, res) => {
  const { id } = req.params;
  const { full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address } = req.body;

  const query = `UPDATE owners SET 
                 full_name = ?, date_of_birth = ?, gender = ?, mobile_no = ?, 
                 email = ?, aadhar_no = ?, permanent_address = ? 
                 WHERE owner_id = ?`;

  db.run(query, [full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }
    res.json({ message: "Owner updated successfully", ...req.body });
  });
};

// Delete owner
export const deleteOwner = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM owners WHERE owner_id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }
    res.json({ message: "Owner deleted successfully" });
  });
};
