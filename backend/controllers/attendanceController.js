const pool = require('../config/db');

exports.verifyQR = async (req, res) => {
  try {
    let qrData;
    try {
      qrData = typeof req.body.qrData === 'string' ? JSON.parse(req.body.qrData) : req.body.qrData;
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid QR code data' });
    }

    const [regs] = await pool.query(`
      SELECT r.*, p.student_name, p.register_number, p.department as student_department,
             p.email, p.phone, e.name as event_name, e.venue, e.event_date, e.event_time,
             d.name as dept_name, a.marked_at as attendance_time
      FROM registrations r
      JOIN participants p ON r.participant_id = p.id
      JOIN events e ON r.event_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendance a ON a.registration_id = r.id
      WHERE r.registration_id = ?
    `, [qrData.registrationId]);

    if (regs.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    const reg = regs[0];

    res.json({
      success: true,
      data: {
        studentName: reg.student_name,
        registerNumber: reg.register_number,
        department: reg.student_department,
        eventName: reg.event_name,
        venue: reg.venue,
        eventDate: reg.event_date,
        eventTime: reg.event_time,
        paymentStatus: reg.payment_status,
        attendanceStatus: reg.attendance_time ? 'Present' : 'Absent',
        attendanceTime: reg.attendance_time,
        registrationId: reg.registration_id,
        registrationDbId: reg.id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { registrationDbId } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE registration_id = ?',
      [registrationDbId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Attendance already marked' });
    }

    await pool.query(
      'INSERT INTO attendance (registration_id, marked_by) VALUES (?, ?)',
      [registrationDbId, req.admin?.id || null]
    );

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceList = async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT r.registration_id, p.student_name, p.register_number, e.name as event_name,
             a.marked_at, d.name as dept_name
      FROM attendance a
      JOIN registrations r ON a.registration_id = r.id
      JOIN participants p ON r.participant_id = p.id
      JOIN events e ON r.event_id = e.id
      JOIN departments d ON e.department_id = d.id
      ORDER BY a.marked_at DESC
    `);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
