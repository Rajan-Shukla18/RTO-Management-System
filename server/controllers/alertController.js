import db from '../db/database.js';

export const getAlerts = (req, res) => {
  const alerts = [];
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];

  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  let insuranceQuery = `
    SELECT i.*, v.manufacturer, v.model_name 
    FROM insurance i
    JOIN vehicles v ON i.vehicle_id = v.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE i.expiry_date <= ?
  `;
  let insuranceParams = [today];

  if (role === 'user') {
    insuranceQuery += " AND o.user_id = ?";
    insuranceParams.push(userId);
  }

  db.all(insuranceQuery, insuranceParams, (err, expiredInsurance) => {
    if (err) return res.status(500).json({ error: err.message });

    expiredInsurance.forEach(item => {
      alerts.push({
        id: `ins-exp-${item.insurance_id}`,
        type: 'error',
        title: 'Insurance Expired',
        description: `Policy ${item.policy_number} for ${item.manufacturer} ${item.model_name} has expired on ${item.expiry_date}.`,
        category: 'Insurance'
      });
    });

    const finishAlerts = () => {
      let licenseQuery = `
        SELECT l.*, o.full_name 
        FROM driving_licenses l
        JOIN owners o ON l.owner_id = o.owner_id
        WHERE l.expiry_date <= ?
      `;
      let licenseParams = [nextMonth];

      if (role === 'user') {
        licenseQuery += " AND o.user_id = ?";
        licenseParams.push(userId);
      }

      db.all(licenseQuery, licenseParams, (err, licenses) => {
        if (err) return res.status(500).json({ error: err.message });

        licenses.forEach(lic => {
          const isExpired = new Date(lic.expiry_date) <= new Date(today);
          alerts.push({
            id: `lic-${lic.license_id}`,
            type: isExpired ? 'error' : 'warning',
            title: isExpired ? 'License Expired' : 'License Renewal Due',
            description: `${lic.full_name}'s license (${lic.license_number}) ${isExpired ? 'expired' : 'expires'} on ${lic.expiry_date}.`,
            category: 'License'
          });
        });

        res.json(alerts);
      });
    };

    // 2. Check for Pending Registrations (Admin Only)
    if (role === 'admin') {
      const regQuery = "SELECT COUNT(*) as count FROM registrations WHERE status = 'Pending'";
      db.get(regQuery, [], (err, pending) => {
        if (err) return res.status(500).json({ error: err.message });

        if (pending.count > 0) {
          alerts.push({
            id: 'reg-pending',
            type: 'warning',
            title: 'Pending Approvals',
            description: `There are ${pending.count} registration applications awaiting review.`,
            category: 'Registration'
          });
        }
        finishAlerts();
      });
    } else {
      finishAlerts();
    }
  });
};
