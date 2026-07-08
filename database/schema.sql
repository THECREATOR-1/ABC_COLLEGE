-- =====================================================
-- ABC Engineering College Symposium Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS abc_symposium
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE abc_symposium;

-- =====================================================
-- ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  email       VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  venue       VARCHAR(200),
  description TEXT,
  image       VARCHAR(500),
  color_theme VARCHAR(10)  DEFAULT '#6C63FF',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VENUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS venues (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  building      VARCHAR(100),
  floor         VARCHAR(50),
  room_number   VARCHAR(50),
  capacity      INT DEFAULT 100,
  facilities    TEXT,
  map_url       VARCHAR(500),
  directions    TEXT,
  department_id INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(200) NOT NULL,
  department_id       INT,
  venue               VARCHAR(200),
  event_date          DATE,
  event_time          TIME,
  description         TEXT,
  rules               TEXT,
  coordinator_name    VARCHAR(150),
  coordinator_phone   VARCHAR(15),
  faculty_coordinator VARCHAR(150),
  student_coordinator VARCHAR(150),
  max_participants    INT  DEFAULT 50,
  registration_fee    DECIMAL(10,2) DEFAULT 0.00,
  available_seats     INT  DEFAULT 50,
  prize_details       TEXT,
  event_type          ENUM('Technical','Non Technical') DEFAULT 'Technical',
  eligibility         TEXT,
  image               VARCHAR(500),
  is_active           TINYINT(1) DEFAULT 1,
  status              ENUM('Open','Closed','Completed') DEFAULT 'Open',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- =====================================================
-- PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS participants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_name    VARCHAR(150) NOT NULL,
  register_number VARCHAR(50)  NOT NULL UNIQUE,
  department      VARCHAR(100),
  year            VARCHAR(10),
  college_name    VARCHAR(200),
  email           VARCHAR(100),
  phone           VARCHAR(15),
  gender          ENUM('Male','Female','Other'),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS registrations (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  registration_id   VARCHAR(50) NOT NULL UNIQUE,
  participant_id    INT,
  event_id          INT,
  status            ENUM('pending','approved','rejected') DEFAULT 'pending',
  payment_status    ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  registration_type ENUM('Individual','Group') DEFAULT 'Individual',
  group_members     JSON DEFAULT NULL,
  refund_status     ENUM('Pending','Completed') DEFAULT NULL,
  rejected_at       TIMESTAMP NULL DEFAULT NULL,
  rejection_reason  TEXT DEFAULT NULL,
  qr_code_data      TEXT,
  qr_code_image     VARCHAR(500),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  registration_id       INT NOT NULL,
  razorpay_order_id     VARCHAR(100),
  razorpay_payment_id   VARCHAR(100),
  razorpay_signature    VARCHAR(500),
  amount                DECIMAL(10,2) DEFAULT 0.00,
  status                ENUM('created','paid','failed') DEFAULT 'created',
  payment_method        VARCHAR(50),
  transaction_ref       VARCHAR(100),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- =====================================================
-- ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  marked_by       INT,
  marked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- =====================================================
-- GALLERY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200),
  description TEXT,
  image_url   VARCHAR(500) NOT NULL,
  category    VARCHAR(100) DEFAULT 'General',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SPONSORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  logo_url    VARCHAR(500),
  website     VARCHAR(500),
  tier        ENUM('Platinum','Gold','Silver','Bronze') DEFAULT 'Silver',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FAQ TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS faq (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  category      VARCHAR(100),
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL,
  phone       VARCHAR(15),
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
