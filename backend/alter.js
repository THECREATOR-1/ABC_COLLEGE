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
      await c.query("ALTER TABLE registrations ADD COLUMN registration_type ENUM('Individual','Group') DEFAULT 'Individual';");
      console.log("Added registration_type");
    } catch(e) { console.log(e.message); }
    
    try {
      await c.query("ALTER TABLE registrations ADD COLUMN group_members JSON DEFAULT NULL;");
      console.log("Added group_members");
    } catch(e) { console.log(e.message); }
    
    await c.end();
  } catch(err) {
    console.error(err);
  }
}
run();
