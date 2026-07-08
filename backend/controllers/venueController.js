const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [venues] = await pool.query(
      `SELECT v.*, d.name as department_name, d.code as department_code,
              (SELECT COUNT(*) FROM events e WHERE e.venue = v.name AND e.is_active = 1) as event_count
       FROM venues v
       LEFT JOIN departments d ON v.department_id = d.id
       ORDER BY v.name`
    );
    res.json({ success: true, data: venues });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const [venues] = await pool.query(
      `SELECT v.*, d.name as department_name, d.code as department_code
       FROM venues v LEFT JOIN departments d ON v.department_id = d.id
       WHERE v.id = ?`,
      [req.params.id]
    );
    if (!venues.length) return res.status(404).json({ success: false, message: 'Venue not found' });

    const [events] = await pool.query(
      `SELECT e.*, d.name as department_name FROM events e
       JOIN departments d ON e.department_id = d.id
       WHERE e.venue = ? AND e.is_active = 1 ORDER BY e.event_date, e.event_time`,
      [venues[0].name]
    );

    res.json({ success: true, data: { ...venues[0], events } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, building, floor, room_number, capacity, facilities, directions, department_id } = req.body;
    const [r] = await pool.query(
      'INSERT INTO venues (name, building, floor, room_number, capacity, facilities, directions, department_id) VALUES (?,?,?,?,?,?,?,?)',
      [name, building, floor, room_number, capacity, facilities, directions, department_id]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, building, floor, room_number, capacity, facilities, directions, department_id } = req.body;
    await pool.query(
      'UPDATE venues SET name=?,building=?,floor=?,room_number=?,capacity=?,facilities=?,directions=?,department_id=? WHERE id=?',
      [name, building, floor, room_number, capacity, facilities, directions, department_id, req.params.id]
    );
    res.json({ success: true, message: 'Venue updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM venues WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Venue deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
