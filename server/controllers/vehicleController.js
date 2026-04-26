import db from '../db/database.js';

// Get all vehicles with owner information
export const getVehicles = (req, res) => {
  const { search } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let query = `
    SELECT v.*, o.full_name as owner_name, r.registration_no 
    FROM vehicles v 
    LEFT JOIN owners o ON v.owner_id = o.owner_id
    LEFT JOIN registrations r ON v.vehicle_id = r.vehicle_id
    WHERE 1=1
  `;
  let params = [];

  if (role === 'user') {
    query += " AND o.user_id = ?";
    params.push(userId);
  }

  if (search) {
    query += " AND (v.chassis_number LIKE ? OR v.engine_number LIKE ? OR v.manufacturer LIKE ? OR v.model_name LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  query += " ORDER BY v.vehicle_id DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Add new vehicle
export const createVehicle = (req, res) => {
  const { 
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year 
  } = req.body;

  if (!owner_id || !chassis_number || !manufacturer || !model_name) {
    return res.status(400).json({ error: "Owner, Chassis, Manufacturer, and Model are required." });
  }

  const query = `INSERT INTO vehicles (
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ vehicle_id: this.lastID, ...req.body });
  });
};

// Update vehicle
export const updateVehicle = (req, res) => {
  const { id } = req.params;
  const { 
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year 
  } = req.body;

  const query = `UPDATE vehicles SET 
                 owner_id = ?, chassis_number = ?, engine_number = ?, 
                 manufacturer = ?, model_name = ?, vehicle_type = ?, 
                 fuel_type = ?, color = ?, manufacturing_year = ? 
                 WHERE vehicle_id = ?`;

  db.run(query, [
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: "Vehicle updated successfully", ...req.body });
  });
};

// Delete vehicle
export const deleteVehicle = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM vehicles WHERE vehicle_id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted successfully" });
  });
};
