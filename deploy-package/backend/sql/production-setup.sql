-- Production Database Setup for one.com
-- Database: c9mzng9ga_bookingdb
-- Run this script via one.com's phpMyAdmin

-- Create tables
CREATE TABLE IF NOT EXISTS associations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_credentials (
  id INT PRIMARY KEY DEFAULT 1,
  password_hash VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_single_admin CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Insert rooms
INSERT INTO rooms (name, capacity) VALUES
('Wilmer 1', 20),
('Wilmer 2', 20)
ON DUPLICATE KEY UPDATE name = name;

-- Insert admin credentials
-- Password: admin123
INSERT INTO admin_credentials (id, password_hash)
VALUES (1, '$2y$10$MqPPDp/AHHK5nF/idbPbIeSWNtst1nijfPuPYJ0onaSWtLZuoq/z2')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Insert 8 associations
-- Password for all: petertestar
INSERT INTO associations (name, code_hash) VALUES
('Förening A', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening B', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening C', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening D', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening E', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening F', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening G', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq'),
('Förening H', '$2y$10$hSaa.h2L5Z2tXE0A.68NYuGuoWDpszh0HoK9VWBu9F3KFqCq6zCyq')
ON DUPLICATE KEY UPDATE name = VALUES(name);
