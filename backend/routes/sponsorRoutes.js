const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sponsors ORDER BY FIELD(tier,"Platinum","Gold","Silver","Bronze")');
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, logo_url, website_url, tier } = req.body;
    const [r] = await pool.query(
      'INSERT INTO sponsors (name, logo_url, website_url, tier) VALUES (?,?,?,?)',
      [name, logo_url, website_url, tier || 'Bronze']
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, logo_url, website_url, tier } = req.body;
    await pool.query(
      'UPDATE sponsors SET name=?, logo_url=?, website_url=?, tier=? WHERE id=?',
      [name, logo_url, website_url, tier, req.params.id]
    );
    res.json({ success: true, message: 'Sponsor updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM sponsors WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Sponsor deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
