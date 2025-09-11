-- Simplified KYC System for Velora
-- Only 4 steps: Personal Info, Identity Verification, Driving License, Final Review

USE velora_db;

-- Drop existing KYC tables if they exist
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS captain_details;

-- Create simplified captain_details table
CREATE TABLE captain_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    -- Personal Information (Step 1)
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(15) NOT NULL,
    
    -- Identity Verification (Step 2)
    aadhar_number VARCHAR(12) NOT NULL,
    pan_number VARCHAR(10) NOT NULL,
    id_document_path VARCHAR(500) NOT NULL,
    id_document_name VARCHAR(255) NOT NULL,
    
    -- Driving License (Step 3)
    license_number VARCHAR(30) NOT NULL,
    license_type ENUM('LMV', 'MCWG', 'MCWOG', 'HMV') NOT NULL,
    license_expiry DATE NOT NULL,
    license_document_path VARCHAR(500) NOT NULL,
    license_document_name VARCHAR(255) NOT NULL,
    
    -- KYC Status
    kyc_status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_captain_details_user_id ON captain_details(user_id);
CREATE INDEX idx_captain_details_kyc_status ON captain_details(kyc_status);
CREATE INDEX idx_captain_details_submitted ON captain_details(submitted_at);

-- Update users table to remove kyc_status (now in captain_details)
ALTER TABLE users DROP COLUMN IF EXISTS kyc_status;

SELECT 'Simplified KYC System Created Successfully!' as status;
