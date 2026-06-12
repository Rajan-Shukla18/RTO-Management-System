import supabase from '../db/supabase.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all licenses with owner info
export const getLicenses = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    let query = supabase
      .from('driving_licenses')
      .select(`
        *,
        owners ( full_name, aadhar_no, user_id )
      `)
      .order('expiry_date', { ascending: true });

    if (search) {
      query = query.or(`license_number.ilike.%${search}%,license_type.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Flatten to match old SQLite JOIN format
    const formatted = (data || [])
      .filter(l => {
        if (role === 'user') {
          return l.owners?.user_id?.toString() === userId.toString();
        }
        return true;
      })
      .map(l => ({
        ...l,
        owner_name: l.owners?.full_name || null,
        aadhar_no: l.owners?.aadhar_no || null,
        owners: undefined
      }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching licenses:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new driving license
export const createLicense = async (req, res) => {
  const { owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto } = req.body;

  if (!owner_id || !license_number || !license_type) {
    return res.status(400).json({ error: "Owner, License Number, and Type are required." });
  }

  try {
    const { data, error } = await supabase
      .from('driving_licenses')
      .insert([{ owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'License Added', `License: ${license_number}`, 'success');
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating license:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update driving license
export const updateLicense = async (req, res) => {
  const { id } = req.params;
  const { license_number, license_type, issue_date, expiry_date, issuing_rto } = req.body;

  try {
    const { data, error } = await supabase
      .from('driving_licenses')
      .update({ license_number, license_type, issue_date, expiry_date, issuing_rto })
      .eq('license_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'License Updated', `License: ${license_number}`, 'info');
    res.json({ message: "License updated successfully", ...req.body });
  } catch (err) {
    console.error('Error updating license:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete driving license
export const deleteLicense = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('driving_licenses')
      .delete()
      .eq('license_id', id);

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'License Deleted', `License ID: ${id}`, 'error');
    res.json({ message: "License record deleted" });
  } catch (err) {
    console.error('Error deleting license:', err);
    res.status(500).json({ error: err.message });
  }
};
