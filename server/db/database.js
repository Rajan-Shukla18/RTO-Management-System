import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'rto.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run("PRAGMA foreign_keys = ON");
    createTables();
  }
});

const createTables = () => {
  db.serialize(() => {
    // Owners table
    db.run(`CREATE TABLE IF NOT EXISTS owners (
      owner_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      full_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      mobile_no TEXT UNIQUE,
      email TEXT UNIQUE,
      aadhar_no TEXT UNIQUE,
      permanent_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure user_id exists if table was already created
    db.run(`ALTER TABLE owners ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
      if (err) {
        // Column might already exist, ignore error
      }
    });

    // Vehicles table
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      chassis_number TEXT UNIQUE,
      engine_number TEXT UNIQUE,
      manufacturer TEXT,
      model_name TEXT,
      vehicle_type TEXT,
      fuel_type TEXT,
      color TEXT,
      manufacturing_year INTEGER,
      FOREIGN KEY (owner_id) REFERENCES owners (owner_id) ON DELETE CASCADE
    )`);

    // Registrations table
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
      registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      registration_no TEXT UNIQUE,
      registration_date TEXT,
      registration_expiry TEXT,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE CASCADE
    )`);

    // Insurance table
    db.run(`CREATE TABLE IF NOT EXISTS insurance (
      insurance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      policy_number TEXT UNIQUE,
      provider_name TEXT,
      insurance_type TEXT,
      start_date TEXT,
      expiry_date TEXT,
      premium_amount TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE CASCADE
    )`);

    // Driving Licenses table
    db.run(`CREATE TABLE IF NOT EXISTS driving_licenses (
      license_id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      license_number TEXT UNIQUE,
      license_type TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      issuing_rto TEXT,
      FOREIGN KEY (owner_id) REFERENCES owners (owner_id) ON DELETE CASCADE
    )`);

    // RTO Offices table
    db.run(`CREATE TABLE IF NOT EXISTS rto_offices (
      office_id INTEGER PRIMARY KEY AUTOINCREMENT,
      office_code TEXT UNIQUE,
      office_name TEXT,
      city TEXT,
      address TEXT,
      contact_no TEXT,
      jurisdiction_area TEXT
    )`);

    console.log("Database schema synchronized.");
    seedData();
  });
};

const seedData = () => {
  db.get("SELECT COUNT(*) as count FROM owners", [], (err, row) => {
    if (row && row.count === 0) {
      console.log("Seeding initial data...");
      
      // Sample Owner
      db.run(`INSERT INTO owners (full_name, date_of_birth, gender, mobile_no, email, aadhar_no, permanent_address) 
              VALUES ('Rajan Shukla', '1995-05-15', 'Male', '9876543210', 'rajan@example.com', '1234-5678-9012', '123, Green Park, Mumbai')`, function() {
        const ownerId = this.lastID;
        
        // Sample Vehicle
        db.run(`INSERT INTO vehicles (owner_id, chassis_number, engine_number, manufacturer, model_name, vehicle_type, fuel_type, color, manufacturing_year) 
                VALUES (?, 'VHN-123456789', 'ENG-987654', 'Tata', 'Nexon EV', 'Four Wheeler', 'Electric', 'Teal Blue', 2023)`, [ownerId], function() {
          const vehicleId = this.lastID;
          
          // Sample Registration
          db.run(`INSERT INTO registrations (vehicle_id, registration_no, registration_date, registration_expiry, status) 
                  VALUES (?, 'MH 01 AB 1234', '2023-10-10', '2038-10-10', 'Approved')`, [vehicleId]);
          
          // Sample Insurance
          db.run(`INSERT INTO insurance (vehicle_id, policy_number, provider_name, insurance_type, start_date, expiry_date, premium_amount) 
                  VALUES (?, 'POL-998877', 'HDFC ERGO', 'Comprehensive', '2023-10-10', '2024-10-10', '15000')`, [vehicleId]);
        });

        // Sample License
        db.run(`INSERT INTO driving_licenses (owner_id, license_number, license_type, issue_date, expiry_date, issuing_rto) 
                VALUES (?, 'MH01 20230001', 'MCWG/LMV', '2023-01-01', '2043-01-01', 'MH-01')`, [ownerId]);
      });

      // Sample RTO Offices
      db.run(`INSERT INTO rto_offices (office_code, office_name, city, address, contact_no, jurisdiction_area) 
              VALUES ('MH-01', 'Tardeo RTO', 'Mumbai', 'Old Bodyguard Lane, Tardeo', '022-235323', 'South Mumbai')`);
      db.run(`INSERT INTO rto_offices (office_code, office_name, city, address, contact_no, jurisdiction_area) 
              VALUES ('MH-12', 'Pune Central RTO', 'Pune', 'Near Sangam Bridge, Shivajinagar', '020-260580', 'Pune City')`);
      
      console.log("Seeding completed successfully.");
    }
  });
};

export default db;
