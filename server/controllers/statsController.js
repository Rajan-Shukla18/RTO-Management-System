import supabase from '../db/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    const role = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || '1';

    // Helper to get count from Supabase
    const getCount = async (table, filterUser = false, extraFilters = null) => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (filterUser && role === 'user') {
        if (table === 'owners') {
          query = query.eq('user_id', userId);
        } else if (table === 'vehicles') {
          query = query.eq('owners.user_id', userId).not('owners', 'is', null);
          query.select('*, owners!inner(user_id)', { count: 'exact', head: true });
        } else if (table === 'registrations' || table === 'insurance') {
          query = query.eq('vehicles.owners.user_id', userId).not('vehicles', 'is', null);
          query.select('*, vehicles!inner(owners!inner(user_id))', { count: 'exact', head: true });
        } else if (table === 'driving_licenses') {
          query = query.eq('owners.user_id', userId).not('owners', 'is', null);
          query.select('*, owners!inner(user_id)', { count: 'exact', head: true });
        }
      }

      if (extraFilters) {
        Object.entries(extraFilters).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    };

    // Run all counts in parallel
    const [owners, vehicles, registrations, pending, licenses] = await Promise.all([
      getCount('owners', true),
      getCount('vehicles', true),
      getCount('registrations', true),
      getCount('registrations', true, { status: 'Pending' }),
      getCount('driving_licenses', true)
    ]);

    // Get recent registrations
    let recentQuery = supabase
      .from('registrations')
      .select(`
        *,
        vehicles (
          manufacturer, model_name,
          owners ( full_name, user_id )
        )
      `)
      .order('registration_date', { ascending: false })
      .limit(5);

    const { data: recentData, error: recentError } = await recentQuery;
    if (recentError) throw recentError;

    // Flatten recent registrations format to match SQLite JOIN format exactly
    const recentRegistrations = (recentData || [])
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

    res.json({
      counts: {
        owners,
        vehicles,
        registrations,
        pending,
        licenses
      },
      recentRegistrations
    });

  } catch (err) {
    console.error('Error fetching dashboard counts:', err);
    res.status(500).json({ error: err.message });
  }
};
