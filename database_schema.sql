-- Database schema for video conferencing application
-- Run this on your MySQL server to create the required tables

CREATE DATABASE IF NOT EXISTS pramuka1_meet;
USE pramuka1_meet;

-- Rooms table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) UNIQUE NOT NULL,
    room_name VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    joined_room VARCHAR(255),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (joined_room) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Messages table for chat functionality
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Insert example data (optional)
-- INSERT INTO rooms (room_id, room_name, created_by) VALUES 
-- ('demo_room_1', 'Demo Room', 'system'),
-- ('meeting_room', 'Main Meeting Room', 'admin');