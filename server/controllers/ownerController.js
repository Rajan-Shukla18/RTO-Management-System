import supabase from '../db/supabase.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all owners with search functionality
export const getOwners = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    let query = supabase.from('owners').select('*');

    if (role === 'user') {
      query = query.eq('user_id', userId);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile_no.ilike.%${search}%,aadhar_no.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new owner
export const createOwner = async (req, res) => {
  const { full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address } = req.body;

  if (!full_name || !mobile_no || !aadhar_no) {
    return res.status(400).json({ error: "Full name, Mobile number, and Aadhaar number are required." });
  }

  try {
    const { data, error } = await supabase
      .from('owners')
      .insert([{ full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Owner Added', `Name: ${full_name}`, 'success');
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating owner:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update owner
export const updateOwner = async (req, res) => {
  const { id } = req.params;
  const { full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address } = req.body;

  try {
    const { data, error, count } = await supabase
      .from('owners')
      .update({ full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address })
      .eq('owner_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }
    logActivity(req, 'Owner Updated', `Name: ${full_name}`, 'info');
    res.json({ message: "Owner updated successfully", ...req.body });
  } catch (err) {
    console.error('Error updating owner:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete owner
export const deleteOwner = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('owners')
      .delete()
      .eq('owner_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }
    logActivity(req, 'Owner Deleted', `Owner ID: ${id}`, 'error');
    res.json({ message: "Owner deleted successfully" });
  } catch (err) {
    console.error('Error deleting owner:', err);
    res.status(500).json({ error: err.message });
  }
};
