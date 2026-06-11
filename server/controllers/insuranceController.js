import db from '../db/database.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all insurance records with vehicle and owner info
export const getInsurance = (req, res) => {
  const { search } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let query = `
    SELECT i.*, v.manufacturer, v.model_name, r.registration_no, o.full_name as owner_name 
    FROM insurance i
    JOIN vehicles v ON i.vehicle_id = v.vehicle_id
    LEFT JOIN registrations r ON v.vehicle_id = r.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE 1=1
  `;
  let params = [];

  if (role === 'user') {
    query += " AND o.user_id = ?";
    params.push(userId);
  }

  if (search) {
    query += " AND (i.policy_number LIKE ? OR i.provider_name LIKE ? OR r.registration_no LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += " ORDER BY i.expiry_date ASC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new insurance policy
export const createInsurance = (req, res) => {
  const { vehicle_id, provider_name, policy_number, start_date, expiry_date, premium_amount } = req.body;

  if (!vehicle_id || !policy_number || !provider_name) {
    return res.status(400).json({ error: "Vehicle, Policy Number, and Provider are required." });
  }

  const query = `INSERT INTO insurance (vehicle_id, provider_name, policy_number, start_date, expiry_date, premium_amount) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [vehicle_id, provider_name, policy_number, start_date, expiry_date, premium_amount], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    logActivity(req, 'Insurance Added', `Policy: ${policy_number}`, 'success');
    res.status(201).json({ insurance_id: this.lastID, ...req.body });
  });
};

// Update insurance policy
export const updateInsurance = (req, res) => {
  const { id } = req.params;
  const { provider_name, policy_number, start_date, expiry_date, premium_amount } = req.body;

  const query = `UPDATE insurance SET 
                 provider_name = ?, policy_number = ?, start_date = ?, 
                 expiry_date = ?, premium_amount = ? 
                 WHERE insurance_id = ?`;

  db.run(query, [provider_name, policy_number, start_date, expiry_date, premium_amount, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    logActivity(req, 'Insurance Updated', `Policy: ${policy_number}`, 'info');
    res.json({ message: "Insurance updated successfully", ...req.body });
  });
};

// Delete insurance record
export const deleteInsurance = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM insurance WHERE insurance_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    logActivity(req, 'Insurance Deleted', `Insurance ID: ${id}`, 'error');
    res.json({ message: "Insurance record deleted" });
  });
};
