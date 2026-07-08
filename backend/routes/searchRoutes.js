const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { events: [], departments: [], venues: [] } });
    }
    const s = `%${q}%`;

    const [events] = await pool.query(
      `SELECT e.id, e.name, e.event_type, e.venue, e.event_date, d.name as department_name
       FROM events e JOIN departments d ON e.department_id = d.id
       WHERE e.is_active = 1 AND (e.name LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)
       LIMIT 8`,
      [s, s, s]
    );

    const [departments] = await pool.query(
      `SELECT id, name, code, description FROM departments WHERE name LIKE ? OR code LIKE ? LIMIT 5`,
      [s, s]
    );

    const [venues] = await pool.query(
      `SELECT v.id, v.name, v.building, v.capacity, d.name as department_name
       FROM venues v LEFT JOIN departments d ON v.department_id = d.id
       WHERE v.name LIKE ? OR v.building LIKE ? LIMIT 5`,
      [s, s]
    );

    res.json({ success: true, data: { events, departments, venues } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
