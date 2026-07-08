const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faq ORDER BY display_order ASC');
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, answer, category, display_order } = req.body;
    const [r] = await pool.query(
      'INSERT INTO faq (question, answer, category, display_order) VALUES (?,?,?,?)',
      [question, answer, category || 'General', display_order || 0]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { question, answer, category, display_order } = req.body;
    await pool.query(
      'UPDATE faq SET question=?, answer=?, category=?, display_order=? WHERE id=?',
      [question, answer, category, display_order, req.params.id]
    );
    res.json({ success: true, message: 'FAQ updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM faq WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
