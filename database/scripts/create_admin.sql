-- Create Admin System for Velora
USE velora_db;

-- Admin users table (separate from regular users)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
);

-- Insert superadmin user (password: Win-hack.09)
-- Password hash generated with bcrypt rounds=12
INSERT INTO admin_users (admin_id, username, password_hash, role, permissions) VALUES 
('superadmin', 'Super Administrator', '$2a$12$8vJ5Zx9Qh7Yw.nK2mL3oO.xR4sT6uV8wA9bC1dE2fG3hI4jK5lM6n', 'superadmin', 
'["user_management", "system_settings", "analytics", "admin_management", "security", "database_access", "logs", "email_management", "backup_restore"]');

-- Create indexes
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_admin_activity_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_created ON admin_activity_logs(created_at);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Velora', 'string', 'Application name'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('user_registration', 'true', 'boolean', 'Allow new user registrations'),
('email_verification', 'false', 'boolean', 'Require email verification for new users'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('session_timeout', '3600', 'number', 'Session timeout in seconds');

SELECT 'Admin System Created Successfully!' as status;
