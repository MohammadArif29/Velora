-- Add KYC Documents Table for Velora
-- This script adds the missing KYC documents table

USE velora_db;

-- KYC Documents table for storing uploaded documents
CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    step INT NOT NULL,
    data JSON DEFAULT NULL,
    document_path VARCHAR(500) DEFAULT NULL,
    document_name VARCHAR(255) DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_step (user_id, step)
);

-- Add indexes for better performance
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_step ON kyc_documents(step);
CREATE INDEX idx_kyc_documents_submitted ON kyc_documents(submitted_at);

-- Update captain_details table to include more KYC fields
ALTER TABLE captain_details 
ADD COLUMN IF NOT EXISTS license_type VARCHAR(20) DEFAULT NULL AFTER license_number,
ADD COLUMN IF NOT EXISTS vehicle_insurance VARCHAR(100) DEFAULT NULL AFTER vehicle_rc,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE DEFAULT NULL AFTER vehicle_insurance;

SELECT 'KYC Tables Added Successfully!' as status;
