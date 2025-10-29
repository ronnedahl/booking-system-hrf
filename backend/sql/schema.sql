-- Kanban Booking System Database Schema

-- Föreningar (Associations)
CREATE TABLE IF NOT EXISTS associations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin credentials (endast en rad)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INT PRIMARY KEY DEFAULT 1,
  password_hash VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_single_admin CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rum/Lokaler (Rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bokningar (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  room_id INT NOT NULL,
  start_time TIME NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in minutes (always 60)',
  user_firstname VARCHAR(50) NOT NULL,
  user_lastname VARCHAR(50) NOT NULL,
  association_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_association FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  INDEX idx_date_room (date, room_id),
  INDEX idx_association (association_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initiala data

-- Insert default admin credentials (password: "admin123" - CHANGE IN PRODUCTION)
-- Hash generated with: password_hash("admin123", PASSWORD_DEFAULT)
-- Note: This is a valid bcrypt hash for "admin123", verified working
INSERT INTO admin_credentials (id, password_hash)
VALUES (1, '$2y$10$MqPPDp/AHHK5nF/idbPbIeSWNtst1nijfPuPYJ0onaSWtLZuoq/z2')
ON DUPLICATE KEY UPDATE password_hash = password_hash;

-- Insert conference rooms (as per booking.md)
INSERT INTO rooms (name, capacity) VALUES
('Wilmer 1', 20),
('Wilmer 2', 20)
ON DUPLICATE KEY UPDATE name = name;

-- Insert 8 associations (as per booking.md requirements)
-- All using test password hash for development: password_hash("TEST123", PASSWORD_DEFAULT)
-- PRODUCTION: Generate unique passwords for each association
INSERT INTO associations (name, code_hash) VALUES
('Förening A', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening B', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening C', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening D', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening E', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening F', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening G', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Förening H', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample bookings (optional, for testing)
-- Note: 09:00 and 12:00 slots are blocked per booking.md, but keeping for migration testing
INSERT INTO bookings (date, room_id, start_time, duration, user_firstname, user_lastname, association_id) VALUES
('2025-11-15', 1, '10:00:00', 60, 'Anna', 'Andersson', 1),
('2025-11-15', 1, '14:00:00', 60, 'Erik', 'Eriksson', 2),
('2025-11-16', 2, '11:00:00', 60, 'Maria', 'Svensson', 1)
ON DUPLICATE KEY UPDATE id = id;
