require('dotenv').config();
const pool = require('./config/db');

async function debugQuery() {
  try {
    // First check what columns exist
    const [cols] = await pool.query('DESCRIBE registrations');
    console.log('Columns:', cols.map(c => c.Field).join(', '));
    
    // Check raw row
    const [raw] = await pool.query('SELECT * FROM registrations LIMIT 1');
    if (raw.length > 0) {
      console.log('\nRaw row keys:', Object.keys(raw[0]).join(', '));
      console.log('registration_type:', raw[0].registration_type);
      console.log('refund_status:', raw[0].refund_status);
    }
    
    // Run the getAll query
    const [rows] = await pool.query(`
      SELECT r.id, r.registration_id, r.status, r.payment_status, r.qr_code_image,
              r.created_at, r.registration_type, r.group_members,
              r.refund_status, r.rejected_at, r.rejection_reason,
              p.student_name, p.register_number, p.department as student_department,
              p.email, p.phone, p.year, p.college_name, p.gender,
              e.name as event_name, e.venue, e.event_date, e.event_time,
              e.registration_fee,
              d.name as dept_name, d.code as dept_code,
              a.marked_at as attendance_time,
              pay.amount as paid_amount
       FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       JOIN events e ON r.event_id=e.id
       JOIN departments d ON e.department_id=d.id
       LEFT JOIN attendance a ON a.registration_id=r.id
       LEFT JOIN payments pay ON pay.registration_id=r.id
       ORDER BY r.created_at DESC
       LIMIT 2
    `);
    
    console.log('\ngetAll query results:');
    rows.forEach((row, i) => {
      console.log(`\nRow ${i+1}:`);
      console.log('  registration_type:', row.registration_type);
      console.log('  group_members:', row.group_members);
      console.log('  refund_status:', row.refund_status);
      console.log('  rejected_at:', row.rejected_at);
      console.log('  rejection_reason:', row.rejection_reason);
      console.log('  paid_amount:', row.paid_amount);
      console.log('  Keys:', Object.keys(row).join(', '));
    });
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

debugQuery();
