# MySQL Database Setup

The symposium portal requires MySQL 8.0 or later.

## Option A: XAMPP (Easiest on Windows)

1. Download from https://www.apachefriends.org/
2. Install and open **XAMPP Control Panel**
3. Click **Start** next to MySQL
4. Default credentials: user=`root`, password=`` (empty) — matches `backend/.env`

## Option B: MySQL Server

1. Download from https://dev.mysql.com/downloads/installer/
2. Install MySQL Server only
3. Set root password and update `backend/.env`
4. Start the service:
   ```powershell
   net start MySQL84
   ```

## Configure Environment

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=abc_symposium
DB_PORT=3306
```

## Seed Database

```bash
cd backend
npm run seed
```

This creates the database, all tables, admin user (`admin` / `admin123`), 6 departments, 36 events, and gallery samples.

## Manual Import

```bash
mysql -u root -p < database/schema.sql
cd backend && npm run seed
```

## Verify

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/departments
```
