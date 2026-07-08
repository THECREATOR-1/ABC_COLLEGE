# ABC Engineering College – Symposium & Event Management Portal

A production-ready full-stack web application for managing college symposium events, registrations, payments, QR verification, and admin operations.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Payments | Razorpay (Test Mode) |
| Other | QR Code, PDF Receipt, Multer, Nodemailer |

## Features

- **Public Portal**: Home, Events, Departments, Gallery, About, Contact
- **Event Registration**: Form validation, Razorpay payment, QR code generation, PDF receipt
- **Admin Dashboard**: Statistics, charts, CRUD for events & departments
- **QR Scanner**: Verify registrations and mark attendance
- **Export**: CSV and Excel export of registrations
- **Responsive**: Mobile-first design with animations

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+

## Quick Start

### 1. Clone and install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` in both `backend/` and `frontend/` folders and update values:

**backend/.env**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=abc_symposium
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY=your_razorpay_test_key
```

### 3. Setup database

```bash
cd backend
npm run seed
```

This creates the database, tables, admin user, 6 departments, 36 events, and sample gallery data.

### 4. Start servers

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

### Admin Login

- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
Project/
├── backend/
│   ├── config/          # Database & seed
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, validation
│   ├── routes/          # API routes
│   ├── utils/           # QR, PDF, Email, Razorpay
│   ├── uploads/         # Uploaded files
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
└── database/
    └── schema.sql
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/departments | List departments |
| GET | /api/events | List events (with search/filter) |
| POST | /api/registrations | Register for event |
| POST | /api/registrations/verify-payment | Verify payment |
| POST | /api/attendance/verify | Verify QR code |
| POST | /api/attendance/mark | Mark attendance |
| GET | /api/registrations/export | Export CSV/Excel |

## Payment (Razorpay Test Mode)

1. Create a Razorpay test account at https://razorpay.com
2. Get test API keys from Dashboard → Settings → API Keys
3. Add keys to `backend/.env` and `frontend/.env`
4. If keys are not configured, the app uses **mock payment** for development

## Database Tables

- `admins` – Admin users
- `departments` – Symposium departments
- `events` – Event details
- `participants` – Student information
- `registrations` – Event registrations
- `payments` – Payment records
- `attendance` – Attendance tracking
- `gallery` – Gallery images
- `contact_messages` – Contact form submissions

## License

MIT – For educational purposes (College Project)
