USE velora_db;

UPDATE admin_users 
SET permissions = '["user_management", "system_settings", "analytics", "admin_management", "security", "database_access", "logs", "email_management", "backup_restore"]'
WHERE admin_id = 'superadmin';

SELECT 'Permissions fixed!' as status;
