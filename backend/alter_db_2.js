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
    
    try {
      await c.query("ALTER TABLE registrations ADD COLUMN refund_status ENUM('Pending','Completed') DEFAULT NULL;");
      console.log("Added refund_status");
    } catch(e) { console.log("refund_status error: " + e.message); }
    
    try {
      await c.query("ALTER TABLE registrations ADD COLUMN rejected_at TIMESTAMP NULL DEFAULT NULL;");
      console.log("Added rejected_at");
    } catch(e) { console.log("rejected_at error: " + e.message); }

    try {
      await c.query("ALTER TABLE registrations ADD COLUMN rejection_reason TEXT DEFAULT NULL;");
      console.log("Added rejection_reason");
    } catch(e) { console.log("rejection_reason error: " + e.message); }
    
    await c.end();
  } catch(err) {
    console.error(err);
  }
}
run();
