<?php
/**
 * Authentication API endpoints
 */

require_once '../config/database.php';
require_once '../models/User.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!$data) {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid JSON data"));
            break;
        }
        
        // Determine action based on endpoint
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        switch($action) {
            case 'login':
                handleLogin($user, $data);
                break;
            case 'signup':
                handleSignup($user, $data);
                break;
            default:
                http_response_code(400);
                echo json_encode(array("message" => "Invalid action"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function handleLogin($user, $data) {
    if(!empty($data->email) && !empty($data->password)) {
        if($user->login($data->email, $data->password)) {
            http_response_code(200);
            echo json_encode(array(
                "message" => "Login successful",
                "user" => array(
                    "id" => $user->id,
                    "email" => $user->email,
                    "first_name" => $user->first_name,
                    "last_name" => $user->last_name,
                    "weight" => $user->weight,
                    "age" => $user->age,
                    "photo" => $user->photo,
                    "isAdmin" => $user->email === 'admin@admin.com'
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. Invalid credentials."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Email and password are required"));
    }
}

function handleSignup($user, $data) {
    if(!empty($data->email) && !empty($data->password) && 
       !empty($data->first_name) && !empty($data->last_name)) {
        
        // Check if email already exists
        $user->email = $data->email;
        if($user->emailExists()) {
            http_response_code(400);
            echo json_encode(array("message" => "Email already exists"));
            return;
        }
        
        // Set user properties
        $user->email = $data->email;
        $user->password = $data->password; // In production, hash this password
        $user->first_name = $data->first_name;
        $user->last_name = $data->last_name;
        $user->weight = isset($data->weight) ? $data->weight : null;
        $user->age = isset($data->age) ? $data->age : null;
        $user->photo = isset($data->photo) ? $data->photo : null;
        
        if($user->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "User created successfully",
                "user" => array(
                    "id" => $user->id,
                    "email" => $user->email,
                    "first_name" => $user->first_name,
                    "last_name" => $user->last_name,
                    "weight" => $user->weight,
                    "age" => $user->age,
                    "photo" => $user->photo,
                    "isAdmin" => false
                )
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to create user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: email, password, first_name, last_name"));
    }
}
?>
