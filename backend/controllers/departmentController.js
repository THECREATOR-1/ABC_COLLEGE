const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT d.*, (SELECT COUNT(*) FROM events e WHERE e.department_id = d.id AND e.is_active = 1) as event_count FROM departments d ORDER BY d.name'
    );
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    if (departments.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const [events] = await pool.query(
      'SELECT * FROM events WHERE department_id = ? AND is_active = 1 ORDER BY event_date, event_time',
      [req.params.id]
    );

    res.json({ success: true, data: { ...departments[0], events } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, venue, description, image } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : image;

    const [result] = await pool.query(
      'INSERT INTO departments (name, code, venue, description, image) VALUES (?, ?, ?, ?, ?)',
      [name, code, venue, description, imagePath]
    );

    res.status(201).json({ success: true, message: 'Department created', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, code, venue, description, image } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : image;

    await pool.query(
      'UPDATE departments SET name=?, code=?, venue=?, description=?, image=COALESCE(?, image) WHERE id=?',
      [name, code, venue, description, imagePath, req.params.id]
    );

    res.json({ success: true, message: 'Department updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
