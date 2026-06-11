import db from '../db/database.js';

export const getActivities = (req, res) => {
  const query = "SELECT * FROM activities ORDER BY timestamp DESC LIMIT 50";
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};
