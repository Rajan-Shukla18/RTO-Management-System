import supabase from '../db/supabase.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${q}%`;
    let results = [];

    // Run searches in parallel
    const [ownersRes, vehiclesRes, insuranceRes, licensesRes] = await Promise.all([
      // 1. Search Owners
      supabase
        .from('owners')
        .select('owner_id, full_name, aadhar_no, mobile_no, user_id')
        .or(`full_name.ilike.${searchTerm},aadhar_no.ilike.${searchTerm},mobile_no.ilike.${searchTerm}`),
      
      // 2. Search Vehicles
      supabase
        .from('vehicles')
        .select(`
          vehicle_id, manufacturer, model_name, chassis_number,
          owners!inner ( user_id ),
          registrations ( registration_no )
        `)
        .or(`chassis_number.ilike.${searchTerm},engine_number.ilike.${searchTerm},registrations.registration_no.ilike.${searchTerm}`),

      // 3. Search Insurance
      supabase
        .from('insurance')
        .select(`
          insurance_id, policy_number, provider_name,
          vehicles!inner (
            owners!inner ( user_id ),
            registrations ( registration_no )
          )
        `)
        .ilike('policy_number', searchTerm),

      // 4. Search Licenses
      supabase
        .from('driving_licenses')
        .select(`
          license_id, license_number,
          owners!inner ( full_name, user_id )
        `)
        .ilike('license_number', searchTerm)
    ]);

    // Process Owners
    if (!ownersRes.error && ownersRes.data) {
      ownersRes.data.forEach(r => {
        if (role === 'user' && r.user_id?.toString() !== userId.toString()) return;
        results.push({
          id: `o-${r.owner_id}`,
          type: 'Owner',
          module: 'owners',
          title: r.full_name,
          subtitle: `Aadhar: ${r.aadhar_no} | Mobile: ${r.mobile_no}`
        });
      });
    }

    // Process Vehicles
    if (!vehiclesRes.error && vehiclesRes.data) {
      vehiclesRes.data.forEach(r => {
        if (role === 'user' && r.owners?.user_id?.toString() !== userId.toString()) return;
        const regNo = r.registrations?.[0]?.registration_no;
        results.push({
          id: `v-${r.vehicle_id}`,
          type: 'Vehicle',
          module: 'vehicles',
          title: regNo || `${r.manufacturer} ${r.model_name}`,
          subtitle: `Chassis: ${r.chassis_number}`
        });
      });
    }

    // Process Insurance
    if (!insuranceRes.error && insuranceRes.data) {
      insuranceRes.data.forEach(r => {
        if (role === 'user' && r.vehicles?.owners?.user_id?.toString() !== userId.toString()) return;
        const regNo = r.vehicles?.registrations?.[0]?.registration_no;
        results.push({
          id: `i-${r.insurance_id}`,
          type: 'Insurance',
          module: 'insurance',
          title: `Policy: ${r.policy_number}`,
          subtitle: `${r.provider_name} | Vehicle: ${regNo || 'Unregistered'}`
        });
      });
    }

    // Process Licenses
    if (!licensesRes.error && licensesRes.data) {
      licensesRes.data.forEach(r => {
        if (role === 'user' && r.owners?.user_id?.toString() !== userId.toString()) return;
        results.push({
          id: `l-${r.license_id}`,
          type: 'License',
          module: 'licenses',
          title: `License: ${r.license_number}`,
          subtitle: `Owner: ${r.owners?.full_name}`
        });
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error during global search:', err);
    res.status(500).json({ error: err.message });
  }
};
