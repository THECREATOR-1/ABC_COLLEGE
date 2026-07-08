const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [gallery] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    const [result] = await pool.query(
      'INSERT INTO gallery (title, description, image_url, category) VALUES (?,?,?,?)',
      [title, description, imageUrl, category || 'General']
    );

    res.status(201).json({ success: true, message: 'Gallery item added', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
