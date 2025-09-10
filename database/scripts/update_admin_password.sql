USE velora_db;
UPDATE admin_users SET password_hash = '$2a$12$JI61tHHZGx4FLZo4DFoOKug5Zdlh1lfGIiyRTUlpaTxbRXDHWg5O6' WHERE admin_id = 'superadmin';
SELECT 'Admin password updated successfully!' as status;
