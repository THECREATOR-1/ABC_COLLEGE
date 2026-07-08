const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { department, type, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let query = `
      SELECT e.*, d.name as department_name, d.code as department_code
      FROM events e
      JOIN departments d ON e.department_id = d.id
      WHERE e.is_active = 1
    `;
    const params = [];

    if (department) {
      query += ' AND e.department_id = ?';
      params.push(department);
    }
    if (type) {
      query += ' AND e.event_type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (e.name LIKE ? OR e.description LIKE ? OR d.name LIKE ? OR e.venue LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const countQuery = query.replace('SELECT e.*, d.name as department_name, d.code as department_code', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);

    query += ' ORDER BY e.event_date ASC, e.event_time ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      data: events,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, d.name as department_name
      FROM events e
      JOIN departments d ON e.department_id = d.id
      WHERE e.is_active = 1 AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC LIMIT 10
    `);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, d.name as department_name, d.code as department_code
      FROM events e
      JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: events[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      name, department_id, venue, event_date, event_time, description, rules,
      coordinator_name, coordinator_phone, max_participants, registration_fee,
      available_seats, prize_details, event_type, eligibility, image,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : image;

    const [result] = await pool.query(
      `INSERT INTO events (name, department_id, venue, event_date, event_time, description, rules,
        coordinator_name, coordinator_phone, max_participants, registration_fee, available_seats,
        prize_details, event_type, eligibility, image) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, department_id, venue, event_date, event_time, description, rules,
        coordinator_name, coordinator_phone, max_participants, registration_fee, available_seats,
        prize_details, event_type, eligibility, imagePath]
    );

    res.status(201).json({ success: true, message: 'Event created', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      name, department_id, venue, event_date, event_time, description, rules,
      coordinator_name, coordinator_phone, max_participants, registration_fee,
      available_seats, prize_details, event_type, eligibility, image, is_active,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : image;

    await pool.query(
      `UPDATE events SET name=?, department_id=?, venue=?, event_date=?, event_time=?, description=?,
        rules=?, coordinator_name=?, coordinator_phone=?, max_participants=?, registration_fee=?,
        available_seats=?, prize_details=?, event_type=?, eligibility=?, image=COALESCE(?, image),
        is_active=COALESCE(?, is_active) WHERE id=?`,
      [name, department_id, venue, event_date, event_time, description, rules,
        coordinator_name, coordinator_phone, max_participants, registration_fee,
        available_seats, prize_details, event_type, eligibility, imagePath, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Event updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('UPDATE events SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[eventCount]] = await pool.query('SELECT COUNT(*) as count FROM events WHERE is_active = 1');
    const [[deptCount]] = await pool.query('SELECT COUNT(*) as count FROM departments');
    const [[participantCount]] = await pool.query('SELECT COUNT(*) as count FROM registrations WHERE payment_status = "paid"');
    const [[todayReg]] = await pool.query('SELECT COUNT(*) as count FROM registrations WHERE DATE(created_at) = CURDATE()');
    const [[revenue]] = await pool.query(`
      SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p WHERE p.status = 'paid'
    `);

    res.json({
      success: true,
      data: {
        totalEvents: eventCount.count,
        totalDepartments: deptCount.count,
        totalParticipants: participantCount.count,
        todayRegistrations: todayReg.count,
        revenue: revenue.total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
