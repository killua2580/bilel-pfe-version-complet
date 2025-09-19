<?php
/**
 * Notifications API endpoints
 */

require_once '../config/database.php';
require_once '../models/Notification.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize notification object
$notification = new Notification($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        handleGetNotifications($notification);
        break;
        
    case 'POST':
        handleCreateNotification($notification);
        break;
        
    case 'PUT':
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        if($action === 'mark-read') {
            handleMarkAsRead($notification);
        } elseif($action === 'mark-all-read') {
            handleMarkAllAsRead($notification);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid action"));
        }
        break;
        
    case 'DELETE':
        handleDeleteNotification($notification);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function handleGetNotifications($notification) {
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $action = isset($_GET['action']) ? $_GET['action'] : null;
    
    if($user_id && $action === 'unread-count') {
        // Get unread count for user
        $count = $notification->getUnreadCount($user_id);
        http_response_code(200);
        echo json_encode(array("unread_count" => $count));
        
    } elseif($user_id) {
        // Get notifications for specific user
        $stmt = $notification->readByUser($user_id);
        $notifications = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $notifications[] = array(
                "id" => $row['id'],
                "user_id" => $row['user_id'],
                "title" => $row['title'],
                "message" => $row['message'],
                "is_read" => (bool)$row['is_read'],
                "created_at" => $row['created_at']
            );
        }
        
        http_response_code(200);
        echo json_encode($notifications);
    } else {
        // Get all notifications (admin view)
        $stmt = $notification->read();
        $notifications = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $notifications[] = array(
                "id" => $row['id'],
                "user_id" => $row['user_id'],
                "title" => $row['title'],
                "message" => $row['message'],
                "is_read" => (bool)$row['is_read'],
                "created_at" => $row['created_at'],
                "user" => array(
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name'],
                    "email" => $row['email']
                )
            );
        }
        
        http_response_code(200);
        echo json_encode($notifications);
    }
}

function handleCreateNotification($notification) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    if(!empty($data->user_id) && !empty($data->title) && !empty($data->message)) {
        // Set notification properties
        $notification->user_id = $data->user_id;
        $notification->title = $data->title;
        $notification->message = $data->message;
        $notification->is_read = $data->is_read ?? false;
        
        if($notification->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Notification created successfully",
                "id" => $notification->id
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to create notification"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: user_id, title, message"));
    }
}

function handleMarkAsRead($notification) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "Notification ID is required"));
        return;
    }
    
    $notification->id = $id;
    
    if($notification->markAsRead()) {
        http_response_code(200);
        echo json_encode(array("message" => "Notification marked as read"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to mark notification as read"));
    }
}

function handleMarkAllAsRead($notification) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data || empty($data->user_id)) {
        http_response_code(400);
        echo json_encode(array("message" => "User ID is required"));
        return;
    }
    
    if($notification->markAllAsRead($data->user_id)) {
        http_response_code(200);
        echo json_encode(array("message" => "All notifications marked as read"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to mark all notifications as read"));
    }
}

function handleDeleteNotification($notification) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "Notification ID is required"));
        return;
    }
    
    $notification->id = $id;
    
    if($notification->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Notification deleted successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to delete notification"));
    }
}
?>
