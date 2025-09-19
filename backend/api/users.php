<?php
/**
 * Users API endpoints
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
    case 'GET':
        handleGetUsers($user);
        break;
        
    case 'POST':
        handleCreateUser($user);
        break;
        
    case 'PUT':
        handleUpdateUser($user);
        break;
        
    case 'DELETE':
        handleDeleteUser($user);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function handleGetUsers($user) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if($id) {
        // Get single user
        $user->id = $id;
        if($user->readOne()) {
            http_response_code(200);
            echo json_encode(array(
                "id" => $user->id,
                "email" => $user->email,
                "first_name" => $user->first_name,
                "last_name" => $user->last_name,
                "weight" => $user->weight,
                "age" => $user->age,
                "photo" => $user->photo,
                "created_at" => $user->created_at
            ));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "User not found"));
        }
    } else {
        // Get all users
        $stmt = $user->read();
        $users = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = array(
                "id" => $row['id'],
                "email" => $row['email'],
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "weight" => $row['weight'],
                "age" => $row['age'],
                "photo" => $row['photo'],
                "created_at" => $row['created_at']
            );
        }
        
        http_response_code(200);
        echo json_encode($users);
    }
}

function handleCreateUser($user) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
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
        $user->password = $data->password;
        $user->first_name = $data->first_name;
        $user->last_name = $data->last_name;
        $user->weight = isset($data->weight) ? $data->weight : null;
        $user->age = isset($data->age) ? $data->age : null;
        $user->photo = isset($data->photo) ? $data->photo : null;
        
        if($user->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "User created successfully",
                "id" => $user->id
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

function handleUpdateUser($user) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "User ID is required"));
        return;
    }
    
    // Set user properties
    $user->id = $id;
    $user->first_name = $data->first_name ?? '';
    $user->last_name = $data->last_name ?? '';
    $user->weight = $data->weight ?? null;
    $user->age = $data->age ?? null;
    $user->photo = $data->photo ?? null;
    
    if($user->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "User updated successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to update user"));
    }
}

function handleDeleteUser($user) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "User ID is required"));
        return;
    }
    
    // First get user to check if it's admin
    $user->id = $id;
    if($user->readOne()) {
        if($user->email === 'admin@admin.com') {
            http_response_code(403);
            echo json_encode(array("message" => "Cannot delete admin user"));
            return;
        }
        
        if($user->delete()) {
            http_response_code(200);
            echo json_encode(array("message" => "User deleted successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to delete user"));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found"));
    }
}
?>
