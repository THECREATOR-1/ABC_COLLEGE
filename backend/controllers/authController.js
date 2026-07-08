const pool = require('../config/db');
const { comparePassword, generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const admin = admins[0];
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(admin);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};
