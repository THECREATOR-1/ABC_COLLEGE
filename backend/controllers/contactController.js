const pool = require('../config/db');

exports.submit = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)',
      [name, email, phone, subject, message]
    );

    res.status(201).json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
