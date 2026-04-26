import db from '../db/database.js';

export const getDashboardStats = (req, res) => {
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let countsQuery;
  let countsParams = [];

  if (role === 'user') {
    countsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM owners WHERE user_id = ?) as total_owners,
        (SELECT COUNT(*) FROM vehicles v JOIN owners o ON v.owner_id = o.owner_id WHERE o.user_id = ?) as total_vehicles,
        (SELECT COUNT(*) FROM registrations r JOIN vehicles v ON r.vehicle_id = v.vehicle_id JOIN owners o ON v.owner_id = o.owner_id WHERE o.user_id = ?) as total_registrations,
        (SELECT COUNT(*) FROM registrations r JOIN vehicles v ON r.vehicle_id = v.vehicle_id JOIN owners o ON v.owner_id = o.owner_id WHERE o.user_id = ? AND r.status = 'Pending') as pending_registrations,
        (SELECT COUNT(*) FROM driving_licenses l JOIN owners o ON l.owner_id = o.owner_id WHERE o.user_id = ?) as total_licenses
    `;
    countsParams = [userId, userId, userId, userId, userId];
  } else {
    countsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM owners) as total_owners,
        (SELECT COUNT(*) FROM vehicles) as total_vehicles,
        (SELECT COUNT(*) FROM registrations) as total_registrations,
        (SELECT COUNT(*) FROM registrations WHERE status = 'Pending') as pending_registrations,
        (SELECT COUNT(*) FROM driving_licenses) as total_licenses
    `;
  }

  db.get(countsQuery, countsParams, (err, counts) => {
    if (err) {
      console.error('Error fetching dashboard counts:', err);
      return res.status(500).json({ error: err.message });
    }

    // Get recent registrations
    let recentQuery = `
      SELECT r.*, v.manufacturer, v.model_name, o.full_name as owner_name 
      FROM registrations r
      JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      JOIN owners o ON v.owner_id = o.owner_id
    `;
    let recentParams = [];

    if (role === 'user') {
      recentQuery += " WHERE o.user_id = ?";
      recentParams.push(userId);
    }

    recentQuery += " ORDER BY r.registration_date DESC LIMIT 5";

    db.all(recentQuery, recentParams, (err, recent) => {
      if (err) {
        console.error('Error fetching recent registrations:', err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        counts: {
          owners: counts?.total_owners || 0,
          vehicles: counts?.total_vehicles || 0,
          registrations: counts?.total_registrations || 0,
          pending: counts?.pending_registrations || 0,
          licenses: counts?.total_licenses || 0
        },
        recentRegistrations: recent || []
      });
    });
  });
};
