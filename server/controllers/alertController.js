import db from '../db/database.js';

export const getAlerts = (req, res) => {
  const alerts = [];
  const today = new Date().toISOString().split('T')[0];
  const nextMonthDate = new Date(new Date().setDate(new Date().getDate() + 30));
  const nextMonth = nextMonthDate.toISOString().split('T')[0];

  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  const calculateDaysRemaining = (expiryStr) => {
    return Math.ceil((new Date(expiryStr) - new Date(today)) / (1000 * 60 * 60 * 24));
  };

  let insuranceQuery = `
    SELECT i.*, v.manufacturer, v.model_name 
    FROM insurance i
    JOIN vehicles v ON i.vehicle_id = v.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE i.expiry_date <= ?
  `;
  let insuranceParams = [nextMonth];

  if (role === 'user') {
    insuranceQuery += " AND o.user_id = ?";
    insuranceParams.push(userId);
  }

  db.all(insuranceQuery, insuranceParams, (err, insuranceRecords) => {
    if (err) return res.status(500).json({ error: err.message });

    insuranceRecords.forEach(item => {
      const daysRemaining = calculateDaysRemaining(item.expiry_date);
      const isExpired = daysRemaining < 0;
      
      alerts.push({
        id: `ins-exp-${item.insurance_id}`,
        type: isExpired ? 'error' : 'warning',
        priority: isExpired ? 'High' : 'Medium',
        title: isExpired ? 'Insurance Expired' : 'Insurance Expiring Soon',
        description: `Policy ${item.policy_number} for ${item.manufacturer} ${item.model_name} ${isExpired ? 'expired' : 'expires'} on ${item.expiry_date}.`,
        category: 'Insurance',
        alertType: 'Insurance',
        daysRemaining: daysRemaining,
        action: 'Renew Insurance immediately'
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
          const daysRemaining = calculateDaysRemaining(lic.expiry_date);
          const isExpired = daysRemaining < 0;
          
          alerts.push({
            id: `lic-${lic.license_id}`,
            type: isExpired ? 'error' : 'warning',
            priority: isExpired ? 'High' : 'Medium',
            title: isExpired ? 'License Expired' : 'License Renewal Due',
            description: `${lic.full_name}'s license (${lic.license_number}) ${isExpired ? 'expired' : 'expires'} on ${lic.expiry_date}.`,
            category: 'License',
            alertType: 'License',
            daysRemaining: daysRemaining,
            action: 'Apply for License Renewal'
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
            priority: 'Medium',
            title: 'Pending Approvals',
            description: `There are ${pending.count} registration applications awaiting review.`,
            category: 'Registration',
            alertType: 'Registration',
            daysRemaining: 0,
            action: 'Review pending applications'
          });
        }
        finishAlerts();
      });
    } else {
      finishAlerts();
    }
  });
};
