<?php
/**
 * API Configuration Settings
 */

define('API_VERSION', '1.0.0');
define('API_BASE_URL', 'http://localhost/gym-power/backend');

// Database settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'gym_power');
define('DB_USER', 'root');
define('DB_PASS', '');

// API settings
define('API_TIMEZONE', 'Europe/Paris');
define('API_DATE_FORMAT', 'Y-m-d H:i:s');

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', array('jpg', 'jpeg', 'png', 'gif'));
define('UPLOAD_PATH', '../uploads/');

// Security settings
define('PASSWORD_MIN_LENGTH', 6);
define('SESSION_TIMEOUT', 3600); // 1 hour

// Fight matching criteria
define('MAX_WEIGHT_DIFFERENCE', 5); // kg
define('MAX_AGE_DIFFERENCE', 3); // years

// Notification settings
define('NOTIFICATION_BATCH_SIZE', 100);

// Error logging
define('ENABLE_ERROR_LOGGING', true);
define('ERROR_LOG_PATH', '../logs/');

// Set timezone
date_default_timezone_set(API_TIMEZONE);

// Create necessary directories
if (!file_exists(UPLOAD_PATH)) {
    mkdir(UPLOAD_PATH, 0755, true);
}

if (!file_exists(ERROR_LOG_PATH)) {
    mkdir(ERROR_LOG_PATH, 0755, true);
}
?>
