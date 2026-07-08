const pool = require('../config/db');
const { generateRegistrationId, generateQRCode, generateQRCodeDataURL } = require('../utils/qrGenerator');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const { sendRegistrationEmail } = require('../utils/emailService');
const { createOrder, verifyPayment } = require('../utils/razorpayService');

// ─── POST /api/registrations ───────────────────────────────────────────
exports.register = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      student_name, register_number, department, year, college_name,
      email, phone, gender, event_id,
      registration_type = 'Individual', group_members = []
    } = req.body;

    // Validate event
    const [events] = await conn.query(
      'SELECT e.*, d.name as dept_name FROM events e JOIN departments d ON e.department_id=d.id WHERE e.id=? AND e.is_active=1',
      [event_id]
    );
    if (!events.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Event not found or inactive' });
    }
    const event = events[0];

    if (event.available_seats <= 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'No seats available' });
    }

    // Check duplicate
    const [existing] = await conn.query(
      `SELECT r.id FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       WHERE p.register_number=? AND r.event_id=? AND r.payment_status!='failed'`,
      [register_number, event_id]
    );
    if (existing.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    // Upsert participant
    const [pRows] = await conn.query('SELECT id FROM participants WHERE register_number=?', [register_number]);
    let participantId;
    if (pRows.length) {
      participantId = pRows[0].id;
      await conn.query(
        'UPDATE participants SET student_name=?,department=?,year=?,college_name=?,email=?,phone=?,gender=? WHERE id=?',
        [student_name, department, year, college_name, email, phone, gender, participantId]
      );
    } else {
      const [pRes] = await conn.query(
        'INSERT INTO participants (student_name,register_number,department,year,college_name,email,phone,gender) VALUES (?,?,?,?,?,?,?,?)',
        [student_name, register_number, department, year, college_name, email, phone, gender]
      );
      participantId = pRes.insertId;
    }

    // Create registration
    const registrationId = generateRegistrationId();
    const [regRes] = await conn.query(
      "INSERT INTO registrations (registration_id,participant_id,event_id,status,payment_status,registration_type,group_members) VALUES (?,?,?,'pending','pending',?,?)",
      [registrationId, participantId, event_id, registration_type, JSON.stringify(group_members)]
    );
    const regDbId = regRes.insertId;

    const memberCount = registration_type === 'Group' ? (1 + group_members.length) : 1;
    const total_amount = event.registration_fee * memberCount;

    // Create order (mock or real Razorpay)
    const order = await createOrder(total_amount, registrationId);

    await conn.query(
      'INSERT INTO payments (registration_id,razorpay_order_id,amount,status) VALUES (?,?,?,?)',
      [regDbId, order.id || order.orderId, total_amount, 'created']
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Complete payment to confirm.',
      data: {
        registrationDbId: regDbId,
        registrationId,
        orderId: order.id || order.orderId,
        amount: total_amount,
        currency: 'INR',
        eventName: event.name,
        venue: event.venue,
        mockPayment: !!order.mock,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// ─── POST /api/registrations/verify-payment ────────────────────────────
exports.verifyPayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { registrationDbId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment (allow mock)
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    const isMock  = razorpay_payment_id === 'pay_mock_success';
    if (!isValid && !isMock) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Get full registration details
    const [regs] = await conn.query(
      `SELECT r.*, p.student_name, p.register_number, p.department as student_department,
              p.college_name, p.email, p.phone, p.gender, p.year,
              e.name as event_name, e.venue, e.event_date, e.event_time,
              e.registration_fee, d.name as dept_name
       FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       JOIN events e ON r.event_id=e.id
       JOIN departments d ON e.department_id=d.id
       WHERE r.id=?`,
      [registrationDbId]
    );
    if (!regs.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    const reg = regs[0];

    // Generate QR code
    const qrPayload = {
      registrationId: reg.registration_id,
      studentName: reg.student_name,
      registerNumber: reg.register_number,
      eventName: reg.event_name,
      department: reg.dept_name,
      venue: reg.venue,
      date: reg.event_date ? new Date(reg.event_date).toLocaleDateString() : 'TBA',
      paymentStatus: 'paid',
      registrationType: reg.registration_type,
    };
    if (reg.registration_type === 'Group') {
      let members = [];
      try { members = typeof reg.group_members === 'string' ? JSON.parse(reg.group_members) : (reg.group_members || []); } catch (e) {}
      qrPayload.groupMembersCount = members.length + 1;
    }

    let qrImagePath = null, qrDataUrl = null;
    try {
      const qrResult = await generateQRCode(qrPayload);
      qrImagePath = qrResult.qrImagePath;
      const qrDU = await generateQRCodeDataURL(qrPayload);
      qrDataUrl = qrDU.dataUrl;
    } catch (qrErr) {
      console.warn('QR generation warning:', qrErr.message);
    }

    // Update registration
    await conn.query(
      "UPDATE registrations SET payment_status='paid',status='approved',qr_code_data=?,qr_code_image=? WHERE id=?",
      [JSON.stringify(qrPayload), qrImagePath, registrationDbId]
    );

    // Update payment record
    await conn.query(
      "UPDATE payments SET razorpay_payment_id=?,razorpay_signature=?,status='paid' WHERE registration_id=?",
      [razorpay_payment_id, razorpay_signature || 'mock', registrationDbId]
    );

    // Reduce available seats
    await conn.query(
      'UPDATE events SET available_seats=GREATEST(available_seats-1,0) WHERE id=?',
      [reg.event_id]
    );

    // Generate receipt PDF
    let receiptPath = null;
    try {
      receiptPath = await generateReceiptPDF(reg);
    } catch (pdfErr) {
      console.warn('PDF generation warning:', pdfErr.message);
    }

    await conn.commit();

    // Send email in background (non-blocking)
    sendRegistrationEmail(reg).catch(() => {});

    res.json({
      success: true,
      message: 'Payment verified! Registration confirmed.',
      data: {
        registrationId: reg.registration_id,
        studentName: reg.student_name,
        registerNumber: reg.register_number,
        eventName: reg.event_name,
        venue: reg.venue,
        eventDate: reg.event_date,
        eventTime: reg.event_time,
        department: reg.dept_name,
        college: reg.college_name,
        email: reg.email,
        phone: reg.phone,
        gender: reg.gender,
        year: reg.year,
        amount: reg.registration_fee,
        paymentId: razorpay_payment_id,
        qrCodeImage: qrImagePath,
        qrCodeDataUrl: qrDataUrl,
        qrPayload: JSON.stringify(qrPayload),
        receiptPath,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// ─── GET /api/registrations ────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { search, department, event, status, payment, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (p.student_name LIKE ? OR p.register_number LIKE ? OR p.email LIKE ? OR r.registration_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (department) { where += ' AND p.department=?'; params.push(department); }
    if (event)      { where += ' AND r.event_id=?';   params.push(event); }
    if (status)     { where += ' AND r.status=?';     params.push(status); }
    if (payment)    { where += ' AND r.payment_status=?'; params.push(payment); }

    const baseQ = `
      FROM registrations r
      JOIN participants p ON r.participant_id=p.id
      JOIN events e ON r.event_id=e.id
      JOIN departments d ON e.department_id=d.id
      LEFT JOIN attendance a ON a.registration_id=r.id
      LEFT JOIN payments pay ON pay.registration_id=r.id
      ${where}
    `;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total ${baseQ}`, params);

    const [rows] = await pool.query(
      `SELECT r.id, r.registration_id, r.status, r.payment_status, r.qr_code_image,
              r.created_at, r.registration_type, r.group_members,
              r.refund_status, r.rejected_at, r.rejection_reason,
              p.student_name, p.register_number, p.department as student_department,
              p.email, p.phone, p.year, p.college_name, p.gender,
              e.name as event_name, e.venue, e.event_date, e.event_time,
              e.registration_fee,
              d.name as dept_name, d.code as dept_code,
              a.marked_at as attendance_time,
              pay.amount as paid_amount
       ${baseQ}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true, data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── GET /api/registrations/stats ─────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [[{ totalParticipants }]] = await pool.query("SELECT COUNT(*) as totalParticipants FROM registrations WHERE payment_status='paid'");
    const [[{ todayRegistrations }]] = await pool.query("SELECT COUNT(*) as todayRegistrations FROM registrations WHERE DATE(created_at)=CURDATE()");
    const [[{ totalRevenue }]]       = await pool.query("SELECT COALESCE(SUM(amount),0) as totalRevenue FROM payments WHERE status='paid'");
    const [[{ totalEvents }]]        = await pool.query("SELECT COUNT(*) as totalEvents FROM events WHERE is_active=1");
    const [[{ totalDepartments }]]   = await pool.query("SELECT COUNT(*) as totalDepartments FROM departments");
    const [[{ pendingPayments }]]    = await pool.query("SELECT COUNT(*) as pendingPayments FROM registrations WHERE payment_status='pending'");
    const [[{ totalAttendance }]]    = await pool.query("SELECT COUNT(*) as totalAttendance FROM attendance");

    res.json({
      success: true,
      data: { totalParticipants, todayRegistrations, totalRevenue, totalEvents, totalDepartments, pendingPayments, totalAttendance },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── GET /api/registrations/lookup/:regId (public) ────────────────────
exports.getByRegistrationId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.student_name, p.register_number, p.department as student_department,
              p.email, p.phone, p.year, p.college_name, p.gender,
              e.name as event_name, e.venue, e.event_date, e.event_time, e.registration_fee,
              d.name as dept_name,
              a.marked_at as attendance_time,
              pay.amount as paid_amount
        FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       JOIN events e ON r.event_id=e.id
       JOIN departments d ON e.department_id=d.id
       LEFT JOIN attendance a ON a.registration_id=r.id
       LEFT JOIN payments pay ON pay.registration_id=r.id
       WHERE r.registration_id=?`,
      [req.params.regId]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── GET /api/registrations/:id (admin, by DB id) ─────────────────────
exports.getByDbId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.student_name, p.register_number, p.department as student_department,
              p.email, p.phone, p.year, p.college_name, p.gender,
              e.name as event_name, e.venue, e.event_date, e.event_time, e.registration_fee,
              d.name as dept_name,
              a.marked_at as attendance_time,
              pay.amount as paid_amount
       FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       JOIN events e ON r.event_id=e.id
       JOIN departments d ON e.department_id=d.id
       LEFT JOIN attendance a ON a.registration_id=r.id
       LEFT JOIN payments pay ON pay.registration_id=r.id
       WHERE r.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── PATCH /api/registrations/:id/status ──────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    
    if (status === 'rejected') {
      await pool.query(
        `UPDATE registrations 
         SET status=?, payment_status='refunded', refund_status='Completed', 
             rejected_at=CURRENT_TIMESTAMP, rejection_reason=? 
         WHERE id=?`, 
        [status, rejection_reason || null, req.params.id]
      );
    } else {
      await pool.query('UPDATE registrations SET status=? WHERE id=?', [status, req.params.id]);
    }
    
    res.json({ success: true, message: 'Status updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── DELETE /api/registrations/:id ────────────────────────────────────
exports.deleteRegistration = async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Registration deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── GET /api/registrations/export ────────────────────────────────────
exports.exportData = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const [data] = await pool.query(
      `SELECT r.registration_id, p.student_name, p.register_number, p.department as student_dept,
              p.year, p.college_name, p.email, p.phone, p.gender,
              e.name as event_name, e.venue, e.event_date, e.registration_fee,
              r.payment_status, pay.amount as paid_amount, r.status, r.created_at,
              IF(a.id IS NOT NULL,'Present','Absent') as attendance
       FROM registrations r
       JOIN participants p ON r.participant_id=p.id
       JOIN events e ON r.event_id=e.id
       LEFT JOIN attendance a ON a.registration_id=r.id
       LEFT JOIN payments pay ON pay.registration_id=r.id
       ORDER BY r.created_at DESC`
    );

    if (format === 'json') return res.json({ success: true, data });

    if (format === 'xlsx') {
      try {
        const XLSX = require('xlsx');
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');
        return res.send(buf);
      } catch {
        // fallback to CSV if xlsx not available
      }
    }

    // CSV fallback
    if (!data.length) return res.send('No data');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send([headers, ...rows].join('\n'));
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── GET /api/registrations/charts ────────────────────────────────────
exports.getChartData = async (req, res) => {
  try {
    const [deptPie] = await pool.query(
      `SELECT d.name, COUNT(r.id) as count
       FROM departments d
       LEFT JOIN events e ON e.department_id=d.id
       LEFT JOIN registrations r ON r.event_id=e.id AND r.payment_status='paid'
       GROUP BY d.id, d.name`
    );

    const [eventBar] = await pool.query(
      `SELECT e.name, COUNT(r.id) as registrations, e.registration_fee * COUNT(r.id) as revenue
       FROM events e
       LEFT JOIN registrations r ON r.event_id=e.id AND r.payment_status='paid'
       WHERE e.is_active=1
       GROUP BY e.id, e.name, e.registration_fee
       ORDER BY registrations DESC LIMIT 10`
    );

    const [dailyLine] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM registrations
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );

    const [typeSplit] = await pool.query(
      `SELECT e.event_type as type, COUNT(r.id) as count
       FROM events e
       LEFT JOIN registrations r ON r.event_id=e.id AND r.payment_status='paid'
       GROUP BY e.event_type`
    );

    res.json({ success: true, data: { departmentPie: deptPie, eventBar, dailyLine, typeSplit } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
