import db from '../db/database.js';

export const globalSearch = (req, res) => {
  const { q } = req.query;
  const role = req.headers['x-user-role'] || 'admin';
  const userId = req.headers['x-user-id'] || '1';

  if (!q || q.length < 2) {
    return res.json([]);
  }

  const searchTerm = `%${q}%`;
  
  let results = [];
  let pendingQueries = 4;
  
  const checkDone = () => {
    pendingQueries--;
    if (pendingQueries === 0) {
      res.json(results);
    }
  };

  // 1. Search Owners
  let ownerQuery = `SELECT owner_id, full_name, aadhar_no, mobile_no FROM owners WHERE (full_name LIKE ? OR aadhar_no LIKE ? OR mobile_no LIKE ?)`;
  let ownerParams = [searchTerm, searchTerm, searchTerm];
  if (role === 'user') {
    ownerQuery += " AND user_id = ?";
    ownerParams.push(userId);
  }
  
  db.all(ownerQuery, ownerParams, (err, rows) => {
    if (!err && rows) {
      rows.forEach(r => results.push({
        id: `o-${r.owner_id}`,
        type: 'Owner',
        module: 'owners',
        title: r.full_name,
        subtitle: `Aadhar: ${r.aadhar_no} | Mobile: ${r.mobile_no}`
      }));
    }
    checkDone();
  });

  // 2. Search Vehicles
  let vehicleQuery = `
    SELECT v.vehicle_id, v.manufacturer, v.model_name, v.chassis_number, r.registration_no 
    FROM vehicles v
    LEFT JOIN registrations r ON v.vehicle_id = r.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE (v.chassis_number LIKE ? OR v.engine_number LIKE ? OR r.registration_no LIKE ?)
  `;
  let vehicleParams = [searchTerm, searchTerm, searchTerm];
  if (role === 'user') {
    vehicleQuery += " AND o.user_id = ?";
    vehicleParams.push(userId);
  }

  db.all(vehicleQuery, vehicleParams, (err, rows) => {
    if (!err && rows) {
      rows.forEach(r => results.push({
        id: `v-${r.vehicle_id}`,
        type: 'Vehicle',
        module: 'vehicles',
        title: r.registration_no || `${r.manufacturer} ${r.model_name}`,
        subtitle: `Chassis: ${r.chassis_number}`
      }));
    }
    checkDone();
  });

  // 3. Search Insurance
  let insuranceQuery = `
    SELECT i.insurance_id, i.policy_number, i.provider_name, r.registration_no
    FROM insurance i
    JOIN vehicles v ON i.vehicle_id = v.vehicle_id
    LEFT JOIN registrations r ON v.vehicle_id = r.vehicle_id
    JOIN owners o ON v.owner_id = o.owner_id
    WHERE i.policy_number LIKE ?
  `;
  let insuranceParams = [searchTerm];
  if (role === 'user') {
    insuranceQuery += " AND o.user_id = ?";
    insuranceParams.push(userId);
  }

  db.all(insuranceQuery, insuranceParams, (err, rows) => {
    if (!err && rows) {
      rows.forEach(r => results.push({
        id: `i-${r.insurance_id}`,
        type: 'Insurance',
        module: 'insurance',
        title: `Policy: ${r.policy_number}`,
        subtitle: `${r.provider_name} | Vehicle: ${r.registration_no || 'Unregistered'}`
      }));
    }
    checkDone();
  });

  // 4. Search Licenses
  let licenseQuery = `
    SELECT l.license_id, l.license_number, o.full_name
    FROM driving_licenses l
    JOIN owners o ON l.owner_id = o.owner_id
    WHERE l.license_number LIKE ?
  `;
  let licenseParams = [searchTerm];
  if (role === 'user') {
    licenseQuery += " AND o.user_id = ?";
    licenseParams.push(userId);
  }

  db.all(licenseQuery, licenseParams, (err, rows) => {
    if (!err && rows) {
      rows.forEach(r => results.push({
        id: `l-${r.license_id}`,
        type: 'License',
        module: 'licenses',
        title: `License: ${r.license_number}`,
        subtitle: `Owner: ${r.full_name}`
      }));
    }
    checkDone();
  });
};
