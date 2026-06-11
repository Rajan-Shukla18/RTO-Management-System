import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'rto.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database for seeding activities...');
  
  const activities = [
    { title: 'System Initialization', entity: 'Core System', by: 'System Admin', status: 'success' },
    { title: 'Database Synchronization', entity: 'Regional Cluster', by: 'System', status: 'success' },
    { title: 'New Vehicle Registration Pending', entity: 'Vehicle: MH-01-AB-1234', by: 'Rajan Shukla', status: 'warning' },
    { title: 'Insurance Policy Updated', entity: 'Policy: POL-998877', by: 'Rajan Shukla', status: 'success' },
    { title: 'Failed API Authentication', entity: 'Gateway Auth', by: 'Unknown User', status: 'error' },
    { title: 'Admin Login Successful', entity: 'Admin Portal', by: 'System Admin', status: 'success' },
    { title: 'License Renewal Request', entity: 'License: MH01 20230001', by: 'Rajan Shukla', status: 'info' },
    { title: 'RTO Office Network Check', entity: 'Office: MH-12', by: 'System', status: 'warning' },
    { title: 'Data Export Initiated', entity: 'Compliance Center', by: 'System Admin', status: 'success' },
    { title: 'High Latency Detected', entity: 'Database Node', by: 'Monitoring Agent', status: 'error' }
  ];

  db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO activities (title, related_entity, performed_by, status, timestamp) 
                             VALUES (?, ?, ?, ?, datetime('now', ?))`);
    
    activities.forEach((act, index) => {
      // stagger timestamps by minutes
      const timeOffset = `-${index * 15} minutes`;
      stmt.run(act.title, act.entity, act.by, act.status, timeOffset);
    });
    
    stmt.finalize();
    console.log('Successfully seeded 10 activity logs.');
  });
  
  db.close((err) => {
    if(err) console.error(err);
    else console.log('Database connection closed.');
  });
});
