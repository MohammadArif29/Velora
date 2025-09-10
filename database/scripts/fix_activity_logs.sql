USE velora_db;

-- Update admin_activity_logs table to allow NULL admin_id for failed login attempts
ALTER TABLE admin_activity_logs MODIFY COLUMN admin_id INT NULL;

-- Add an index for better performance
CREATE INDEX idx_admin_activity_admin_id_null ON admin_activity_logs(admin_id);

SELECT 'Activity logs table updated!' as status;
