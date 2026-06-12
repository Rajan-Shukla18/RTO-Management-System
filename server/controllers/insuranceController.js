import supabase from '../db/supabase.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all insurance records with vehicle and owner info
export const getInsurance = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    let query = supabase
      .from('insurance')
      .select(`
        *,
        vehicles (
          manufacturer, model_name, owner_id,
          owners ( full_name, user_id ),
          registrations ( registration_no )
        )
      `)
      .order('expiry_date', { ascending: true });

    if (search) {
      query = query.or(`policy_number.ilike.%${search}%,provider_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Flatten to match old SQLite JOIN format
    const formatted = (data || [])
      .filter(i => {
        if (role === 'user') {
          return i.vehicles?.owners?.user_id?.toString() === userId.toString();
        }
        return true;
      })
      .map(i => ({
        ...i,
        manufacturer: i.vehicles?.manufacturer || null,
        model_name: i.vehicles?.model_name || null,
        registration_no: i.vehicles?.registrations?.[0]?.registration_no || null,
        owner_name: i.vehicles?.owners?.full_name || null,
        vehicles: undefined
      }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching insurance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new insurance policy
export const createInsurance = async (req, res) => {
  const { vehicle_id, provider_name, policy_number, start_date, expiry_date, premium_amount } = req.body;

  if (!vehicle_id || !policy_number || !provider_name) {
    return res.status(400).json({ error: "Vehicle, Policy Number, and Provider are required." });
  }

  try {
    const { data, error } = await supabase
      .from('insurance')
      .insert([{ vehicle_id, provider_name, policy_number, start_date, expiry_date, premium_amount }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Insurance Added', `Policy: ${policy_number}`, 'success');
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating insurance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update insurance policy
export const updateInsurance = async (req, res) => {
  const { id } = req.params;
  const { provider_name, policy_number, start_date, expiry_date, premium_amount } = req.body;

  try {
    const { data, error } = await supabase
      .from('insurance')
      .update({ provider_name, policy_number, start_date, expiry_date, premium_amount })
      .eq('insurance_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Insurance Updated', `Policy: ${policy_number}`, 'info');
    res.json({ message: "Insurance updated successfully", ...req.body });
  } catch (err) {
    console.error('Error updating insurance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete insurance record
export const deleteInsurance = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('insurance')
      .delete()
      .eq('insurance_id', id);

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Insurance Deleted', `Insurance ID: ${id}`, 'error');
    res.json({ message: "Insurance record deleted" });
  } catch (err) {
    console.error('Error deleting insurance:', err);
    res.status(500).json({ error: err.message });
  }
};
