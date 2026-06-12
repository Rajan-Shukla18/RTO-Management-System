import sqlite3 from 'sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const dbPath = join(__dirname, '../db/rto.db');

// Connect to SQLite
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
    process.exit(1);
  }
});

// Connect to Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to read all rows from SQLite
const readTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const tablesToMigrate = [
  'owners',
  'vehicles',
  'registrations',
  'insurance',
  'driving_licenses',
  'rto_offices',
  'activities'
];

async function migrateData() {
  console.log('Starting Migration: SQLite -> Supabase PostgreSQL...\n');
  const report = [];

  for (const table of tablesToMigrate) {
    console.log(`Migrating table: ${table}...`);
    try {
      // 1. Read SQLite Data
      const rows = await readTable(table);
      const sqliteCount = rows.length;
      
      if (sqliteCount === 0) {
        console.log(`  - 0 rows found in SQLite. Skipping.`);
        report.push({ table, sqliteCount, supabaseCount: 0 });
        continue;
      }

      // Format some fields that might clash (like date fields from SQLite text to Postgres Date)
      const formattedRows = rows.map(row => {
        // SQLite dates are strings. If an empty string or invalid, convert to null for Postgres Date.
        const newRow = { ...row };
        for (const [key, value] of Object.entries(newRow)) {
          if (typeof value === 'string' && value.trim() === '') {
            newRow[key] = null;
          }
        }
        return newRow;
      });

      // 2. Insert into Supabase
      const { data, error } = await supabase
        .from(table)
        .upsert(formattedRows, { onConflict: table === 'owners' ? 'owner_id' : table === 'vehicles' ? 'vehicle_id' : table === 'registrations' ? 'registration_id' : table === 'insurance' ? 'insurance_id' : table === 'driving_licenses' ? 'license_id' : table === 'rto_offices' ? 'office_id' : 'activity_id' })
        .select();

      if (error) {
        console.error(`  - Supabase Insert Error for ${table}:`, error.message);
        throw error;
      }

      // 3. Verify count in Supabase
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error(`  - Supabase Count Error for ${table}:`, countError.message);
      }

      const supabaseCount = count || 0;
      console.log(`  - Success! SQLite: ${sqliteCount} | Supabase: ${supabaseCount}`);
      
      report.push({ table, sqliteCount, supabaseCount });
      
    } catch (err) {
      console.error(`FAILED migrating ${table}:`, err.message);
      process.exit(1);
    }
  }

  // Print Report
  console.log('\n================ MIGRATION REPORT ================');
  console.log('TABLE'.padEnd(20) + 'SQLITE COUNT'.padEnd(15) + 'SUPABASE COUNT');
  console.log('--------------------------------------------------');
  let success = true;
  for (const r of report) {
    console.log(r.table.padEnd(20) + r.sqliteCount.toString().padEnd(15) + r.supabaseCount.toString());
    if (r.sqliteCount !== r.supabaseCount) success = false;
  }
  console.log('==================================================');
  
  if (success) {
    console.log('SUCCESS: All records successfully migrated!');
  } else {
    console.error('WARNING: Mismatch in row counts detected. Please investigate.');
  }

  process.exit(0);
}

migrateData();
