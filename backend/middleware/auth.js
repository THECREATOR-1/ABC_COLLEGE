const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [admins] = await pool.query('SELECT id, username, email FROM admins WHERE id = ?', [decoded.id]);
    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { authMiddleware, generateToken, hashPassword, comparePassword };
