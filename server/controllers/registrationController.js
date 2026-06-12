import supabase from '../db/supabase.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all registrations with vehicle and owner info
export const getRegistrations = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    let query = supabase
      .from('registrations')
      .select(`
        *,
        vehicles (
          manufacturer, model_name, owner_id,
          owners ( full_name, user_id )
        )
      `)
      .order('registration_date', { ascending: false });

    if (search) {
      query = query.or(`registration_no.ilike.%${search}%,status.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Flatten to match old SQLite JOIN format
    const formatted = (data || [])
      .filter(r => {
        if (role === 'user') {
          return r.vehicles?.owners?.user_id?.toString() === userId.toString();
        }
        return true;
      })
      .map(r => ({
        ...r,
        manufacturer: r.vehicles?.manufacturer || null,
        model_name: r.vehicles?.model_name || null,
        owner_name: r.vehicles?.owners?.full_name || null,
        vehicles: undefined
      }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new registration request
export const createRegistration = async (req, res) => {
  const { vehicle_id, registration_date, registration_expiry } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ error: "Vehicle ID is required." });
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([{ vehicle_id, registration_date, registration_expiry, status: 'Pending' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Registration Requested', `Vehicle ID: ${vehicle_id}`, 'info');
    res.status(201).json({ registration_id: data.registration_id, status: 'Pending' });
  } catch (err) {
    console.error('Error creating registration:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update registration status (Approve/Reject)
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    if (status === 'Approved') {
      const plateNo = `MH ${Math.floor(Math.random() * 50).toString().padStart(2, '0')} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
      
      const { error } = await supabase
        .from('registrations')
        .update({ status, registration_no: plateNo })
        .eq('registration_id', id);

      if (error) return res.status(500).json({ error: error.message });
      logActivity(req, 'Registration Approved', `Registration No: ${plateNo}`, 'success');
      res.json({ message: "Registration approved", registration_no: plateNo });
    } else {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('registration_id', id);

      if (error) return res.status(500).json({ error: error.message });
      logActivity(req, `Registration ${status}`, `Registration ID: ${id}`, status === 'Rejected' ? 'error' : 'info');
      res.json({ message: `Registration ${status.toLowerCase()}` });
    }
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete registration
export const deleteRegistration = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('registration_id', id);

    if (error) return res.status(500).json({ error: error.message });
    logActivity(req, 'Registration Deleted', `Registration ID: ${id}`, 'error');
    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error('Error deleting registration:', err);
    res.status(500).json({ error: err.message });
  }
};
