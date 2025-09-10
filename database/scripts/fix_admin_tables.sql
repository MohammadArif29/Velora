USE velora_db;

-- Drop and recreate admin_activity_logs table with proper structure
DROP TABLE IF EXISTS admin_activity_logs;

CREATE TABLE admin_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) DEFAULT NULL,
    target_id INT DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_logs(created_at);

-- Fix admin_users table permissions column to be proper JSON
ALTER TABLE admin_users MODIFY COLUMN permissions JSON;

-- Update the superadmin permissions with proper JSON format
UPDATE admin_users SET permissions = JSON_ARRAY(
    'user_management',
    'system_settings', 
    'analytics',
    'admin_management',
    'security',
    'database_access',
    'logs',
    'email_management',
    'backup_restore'
) WHERE admin_id = 'superadmin';

SELECT 'Admin tables fixed successfully!' as status;
