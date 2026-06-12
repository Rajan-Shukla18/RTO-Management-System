import supabase from '../db/supabase.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all vehicles with owner information
export const getVehicles = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    // Get vehicles with owner name via foreign key relationship
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        owners ( full_name, user_id ),
        registrations ( registration_no )
      `)
      .order('vehicle_id', { ascending: false });

    if (search) {
      query = query.or(`chassis_number.ilike.%${search}%,engine_number.ilike.%${search}%,manufacturer.ilike.%${search}%,model_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Flatten the response to match old SQLite format exactly
    const formatted = (data || [])
      .filter(v => {
        if (role === 'user') {
          return v.owners?.user_id?.toString() === userId.toString();
        }
        return true;
      })
      .map(v => ({
        ...v,
        owner_name: v.owners?.full_name || null,
        registration_no: v.registrations?.[0]?.registration_no || null,
        owners: undefined,
        registrations: undefined
      }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new vehicle
export const createVehicle = async (req, res) => {
  const { 
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year 
  } = req.body;

  if (!owner_id || !chassis_number || !manufacturer || !model_name) {
    return res.status(400).json({ error: "Owner, Chassis, Manufacturer, and Model are required." });
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{ owner_id, chassis_number, engine_number, manufacturer, model_name, vehicle_type, fuel_type, color, manufacturing_year }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Vehicle Added', `Chassis: ${chassis_number}`, 'success');
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating vehicle:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { 
    owner_id, chassis_number, engine_number, manufacturer, 
    model_name, vehicle_type, fuel_type, color, manufacturing_year 
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ owner_id, chassis_number, engine_number, manufacturer, model_name, vehicle_type, fuel_type, color, manufacturing_year })
      .eq('vehicle_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    logActivity(req, 'Vehicle Updated', `Chassis: ${chassis_number}`, 'info');
    res.json({ message: "Vehicle updated successfully", ...req.body });
  } catch (err) {
    console.error('Error updating vehicle:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .delete()
      .eq('vehicle_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    logActivity(req, 'Vehicle Deleted', `Vehicle ID: ${id}`, 'error');
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    res.status(500).json({ error: err.message });
  }
};
