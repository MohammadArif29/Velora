USE velora_db;

-- Fix admin permissions with proper JSON format
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

SELECT 'Admin permissions fixed!' as status;
