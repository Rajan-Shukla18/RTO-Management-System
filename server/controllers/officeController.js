import supabase from '../db/supabase.js';

// Get all RTO offices
export const getOffices = async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('rto_offices').select('*');

    if (search) {
      query = query.or(`office_code.ilike.%${search}%,office_name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    query = query.order('office_code', { ascending: true });

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Error fetching offices:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new RTO office
export const createOffice = async (req, res) => {
  const { office_code, office_name, city, address, contact_no, jurisdiction_area } = req.body;

  if (!office_code || !office_name || !city) {
    return res.status(400).json({ error: "Office Code, Name, and City are required." });
  }

  try {
    const { data, error } = await supabase
      .from('rto_offices')
      .insert([{ office_code, office_name, city, address, contact_no, jurisdiction_area }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating office:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update RTO office
export const updateOffice = async (req, res) => {
  const { id } = req.params;
  const { office_code, office_name, city, address, contact_no, jurisdiction_area } = req.body;

  try {
    const { data, error } = await supabase
      .from('rto_offices')
      .update({ office_code, office_name, city, address, contact_no, jurisdiction_area })
      .eq('office_id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Office updated successfully", ...req.body });
  } catch (err) {
    console.error('Error updating office:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete RTO office
export const deleteOffice = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('rto_offices')
      .delete()
      .eq('office_id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Office deleted successfully" });
  } catch (err) {
    console.error('Error deleting office:', err);
    res.status(500).json({ error: err.message });
  }
};
