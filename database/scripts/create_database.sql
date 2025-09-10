-- Velora Database Creation Script
-- This script creates the main database and user management tables

-- Create database
CREATE DATABASE IF NOT EXISTS velora_db;
USE velora_db;

-- Users table for both students and captains
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'captain') NOT NULL,
    student_id VARCHAR(20) NULL, -- Only for students (e.g., 22102A041057)
    full_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    kyc_status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User sessions table for login management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User profiles table for additional information
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    emergency_contact VARCHAR(15) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Captain specific information (for KYC later)
CREATE TABLE IF NOT EXISTS captain_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    vehicle_type ENUM('auto', 'car', 'bike') DEFAULT NULL,
    vehicle_number VARCHAR(20) DEFAULT NULL,
    license_number VARCHAR(30) DEFAULT NULL,
    license_expiry DATE DEFAULT NULL,
    vehicle_rc VARCHAR(50) DEFAULT NULL,
    aadhar_number VARCHAR(12) DEFAULT NULL,
    pan_number VARCHAR(10) DEFAULT NULL,
    bank_account VARCHAR(20) DEFAULT NULL,
    ifsc_code VARCHAR(11) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_reset_tokens_expires ON password_reset_tokens(expires_at);

SELECT 'Velora Database and Tables Created Successfully!' as status;
