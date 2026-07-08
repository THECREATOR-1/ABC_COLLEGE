require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler, notFound } = require('./middleware/validate');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Ensure upload directories exist ───────────────────────────────────
['uploads', 'uploads/qrcodes', 'uploads/receipts'].forEach((dir) => {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// ── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ABC Symposium API running', time: new Date() });
});

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/departments',  require('./routes/departmentRoutes'));
app.use('/api/events',       require('./routes/eventRoutes'));
app.use('/api/registrations',require('./routes/registrationRoutes'));
app.use('/api/attendance',   require('./routes/attendanceRoutes'));
app.use('/api/gallery',      require('./routes/galleryRoutes'));
app.use('/api/contact',      require('./routes/contactRoutes'));
app.use('/api/venues',       require('./routes/venueRoutes'));
app.use('/api/sponsors',     require('./routes/sponsorRoutes'));
app.use('/api/faq',          require('./routes/faqRoutes'));
app.use('/api/search',       require('./routes/searchRoutes'));

// ── 404 + error handler ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 ABC Symposium Backend → http://localhost:${PORT}`);
  console.log(`📡 Health check  → http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
