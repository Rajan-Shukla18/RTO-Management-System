import db from '../db/database.js';

// Get all registrations with vehicle and owner info
export const getRegistrations = (req, res) => {
  const { search } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let query = `
    SELECT r.*, v.manufacturer, v.model_name, o.full_name as owner_name 
    FROM registrations r
    JOIN vehicles v ON r.vehicle_id = v.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE 1=1
  `;
  let params = [];

  if (role === 'user') {
    query += " AND o.user_id = ?";
    params.push(userId);
  }

  if (search) {
    query += " AND (r.registration_no LIKE ? OR r.status LIKE ? OR o.full_name LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY r.registration_date DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new registration request
export const createRegistration = (req, res) => {
  const { vehicle_id, registration_date, registration_expiry } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ error: "Vehicle ID is required." });
  }

  const query = `INSERT INTO registrations (vehicle_id, registration_date, registration_expiry, status) 
                 VALUES (?, ?, ?, 'Pending')`;
  
  db.run(query, [vehicle_id, registration_date, registration_expiry], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ registration_id: this.lastID, status: 'Pending' });
  });
};

// Update registration status (Approve/Reject)
export const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  // If approved and no plate number, generate one
  if (status === 'Approved') {
    const plateNo = `MH ${Math.floor(Math.random() * 50).toString().padStart(2, '0')} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    
    db.run("UPDATE registrations SET status = ?, registration_no = ? WHERE registration_id = ?", [status, plateNo, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Registration approved", registration_no: plateNo });
    });
  } else {
    db.run("UPDATE registrations SET status = ? WHERE registration_id = ?", [status, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Registration ${status.toLowerCase()}` });
    });
  }
};

// Delete registration
export const deleteRegistration = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM registrations WHERE registration_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Registration deleted" });
  });
};
