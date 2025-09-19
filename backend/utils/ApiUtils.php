<?php
/**
 * API Utilities and Helper Functions
 */

class ApiUtils {
    
    /**
     * Validate required fields
     */
    public static function validateRequiredFields($data, $required_fields) {
        $missing_fields = array();
        
        foreach($required_fields as $field) {
            if(!isset($data->$field) || empty($data->$field)) {
                $missing_fields[] = $field;
            }
        }
        
        return $missing_fields;
    }
    
    /**
     * Generate UUID (simple version for MySQL compatibility)
     */
    public static function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    /**
     * Send JSON response
     */
    public static function sendResponse($status_code, $message, $data = null) {
        http_response_code($status_code);
        
        $response = array("message" => $message);
        
        if($data !== null) {
            if(is_array($data)) {
                $response = array_merge($response, $data);
            } else {
                $response["data"] = $data;
            }
        }
        
        echo json_encode($response);
    }
    
    /**
     * Send error response
     */
    public static function sendError($status_code, $message) {
        http_response_code($status_code);
        echo json_encode(array(
            "error" => true,
            "message" => $message
        ));
    }
    
    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    /**
     * Sanitize input data
     */
    public static function sanitizeInput($data) {
        if(is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        } else {
            return htmlspecialchars(strip_tags($data));
        }
    }
    
    /**
     * Check if user is admin
     */
    public static function isAdmin($user_email) {
        return $user_email === 'admin@admin.com';
    }
    
    /**
     * Format date for display
     */
    public static function formatDate($date, $format = 'Y-m-d H:i:s') {
        $datetime = new DateTime($date);
        return $datetime->format($format);
    }
    
    /**
     * Calculate time difference
     */
    public static function getTimeDifference($date1, $date2 = null) {
        if($date2 === null) {
            $date2 = new DateTime();
        } else {
            $date2 = new DateTime($date2);
        }
        
        $date1 = new DateTime($date1);
        $diff = $date1->diff($date2);
        
        return $diff;
    }
    
    /**
     * Log error to file
     */
    public static function logError($message, $context = array()) {
        $log_message = date('Y-m-d H:i:s') . " - " . $message;
        
        if(!empty($context)) {
            $log_message .= " | Context: " . json_encode($context);
        }
        
        $log_message .= PHP_EOL;
        
        error_log($log_message, 3, '../logs/error.log');
    }
    
    /**
     * Validate request method
     */
    public static function validateMethod($allowed_methods) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if(!in_array($method, $allowed_methods)) {
            http_response_code(405);
            echo json_encode(array("message" => "Method not allowed"));
            exit();
        }
        
        return $method;
    }
    
    /**
     * Get request data
     */
    public static function getRequestData() {
        $data = json_decode(file_get_contents("php://input"));
        
        if(json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid JSON data"));
            exit();
        }
        
        return $data;
    }
    
    /**
     * Check database connection
     */
    public static function checkDatabaseConnection($db) {
        if(!$db) {
            http_response_code(500);
            echo json_encode(array("message" => "Database connection failed"));
            exit();
        }
    }
}

/**
 * Response helper class
 */
class Response {
    
    public static function success($message, $data = null, $status_code = 200) {
        http_response_code($status_code);
        
        $response = array(
            "success" => true,
            "message" => $message
        );
        
        if($data !== null) {
            $response["data"] = $data;
        }
        
        echo json_encode($response);
    }
    
    public static function error($message, $status_code = 400, $details = null) {
        http_response_code($status_code);
        
        $response = array(
            "success" => false,
            "error" => true,
            "message" => $message
        );
        
        if($details !== null) {
            $response["details"] = $details;
        }
        
        echo json_encode($response);
    }
    
    public static function notFound($message = "Resource not found") {
        self::error($message, 404);
    }
    
    public static function unauthorized($message = "Unauthorized access") {
        self::error($message, 401);
    }
    
    public static function forbidden($message = "Access forbidden") {
        self::error($message, 403);
    }
    
    public static function serverError($message = "Internal server error") {
        self::error($message, 500);
    }
}
?>
