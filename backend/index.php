<?php
/**
 * Gym Power API - Main Entry Point
 * Handles routing to different API endpoints
 */

// Include utilities
require_once 'utils/ApiUtils.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the requested endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove the base path and get the endpoint
$path_parts = explode('/', trim($path, '/'));
$endpoint = end($path_parts);

// Route to appropriate API file
switch($endpoint) {
    case 'auth':
        require_once 'api/auth.php';
        break;
        
    case 'users':
        require_once 'api/users.php';
        break;
        
    case 'tournaments':
        require_once 'api/tournaments.php';
        break;
        
    case 'fights':
        require_once 'api/fights.php';
        break;
        
    case 'notifications':
        require_once 'api/notifications.php';
        break;
        
    case 'status':
        // API status check
        Response::success("Gym Power API is running", array(
            "version" => "1.0.0",
            "timestamp" => date('Y-m-d H:i:s'),
            "endpoints" => array(
                "auth" => "/api/auth",
                "users" => "/api/users", 
                "tournaments" => "/api/tournaments",
                "fights" => "/api/fights",
                "notifications" => "/api/notifications"
            )
        ));
        break;
        
    default:
        Response::error("Endpoint not found", 404, array(
            "available_endpoints" => array(
                "auth", "users", "tournaments", "fights", "notifications", "status"
            )
        ));
}
?>
