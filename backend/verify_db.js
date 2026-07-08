require('dotenv').config({path: './backend/.env'});
const mysql = require('mysql2/promise');
async function run() {
  try {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'abc_symposium'
    });
    
    // Modify payment_status ENUM to add 'refunded' value
    try {
      await c.query("ALTER TABLE registrations MODIFY COLUMN payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending';");
      console.log("Modified payment_status ENUM to include 'refunded'");
    } catch(e) { console.log("payment_status error: " + e.message); }
    
    // Check current columns
    const [cols] = await c.query("DESCRIBE registrations;");
    console.log("Current registrations columns:");
    cols.forEach(col => console.log(`  ${col.Field}: ${col.Type} (${col.Null}) default=${col.Default}`));
    
    await c.end();
  } catch(err) {
    console.error(err);
  }
}
run();
