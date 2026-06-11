import db from '../db/database.js';

export const logActivity = (req, title, relatedEntity, status = 'info') => {
  const role = req.headers['x-user-role'] || 'admin';
  let performedBy = role === 'admin' ? 'Admin' : 'User';
  
  if (role === 'user' && req.headers['x-user-id']) {
    performedBy = `User ID: ${req.headers['x-user-id']}`;
  }

  const query = `
    INSERT INTO activities (title, related_entity, performed_by, status)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [title, relatedEntity, performedBy, status], (err) => {
    if (err) {
      console.error("Failed to log activity:", err.message);
    }
  });
};
