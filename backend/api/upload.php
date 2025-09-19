<?php
/**
 * File Upload Handler for Gym Power Application
 */

require_once '../config/config.php';
require_once '../utils/ApiUtils.php';

class FileUpload {
    
    private $upload_path;
    private $allowed_types;
    private $max_size;
    
    public function __construct() {
        $this->upload_path = UPLOAD_PATH;
        $this->allowed_types = ALLOWED_IMAGE_TYPES;
        $this->max_size = MAX_FILE_SIZE;
    }
    
    /**
     * Upload image file
     */
    public function uploadImage($file, $folder = 'general') {
        try {
            // Check if file was uploaded
            if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
                throw new Exception("No file uploaded");
            }
            
            // Validate file size
            if ($file['size'] > $this->max_size) {
                throw new Exception("File size exceeds maximum allowed size");
            }
            
            // Get file extension
            $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            // Validate file type
            if (!in_array($file_extension, $this->allowed_types)) {
                throw new Exception("Invalid file type. Allowed types: " . implode(', ', $this->allowed_types));
            }
            
            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $file_extension;
            
            // Create folder if it doesn't exist
            $folder_path = $this->upload_path . $folder . '/';
            if (!file_exists($folder_path)) {
                mkdir($folder_path, 0755, true);
            }
            
            // Full file path
            $file_path = $folder_path . $filename;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $file_path)) {
                return array(
                    'success' => true,
                    'filename' => $filename,
                    'path' => $file_path,
                    'url' => $this->getFileUrl($folder, $filename),
                    'size' => $file['size']
                );
            } else {
                throw new Exception("Failed to move uploaded file");
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }
    
    /**
     * Delete uploaded file
     */
    public function deleteFile($filename, $folder = 'general') {
        $file_path = $this->upload_path . $folder . '/' . $filename;
        
        if (file_exists($file_path)) {
            return unlink($file_path);
        }
        
        return false;
    }
    
    /**
     * Get file URL
     */
    private function getFileUrl($folder, $filename) {
        return API_BASE_URL . '/uploads/' . $folder . '/' . $filename;
    }
    
    /**
     * Get file info
     */
    public function getFileInfo($filename, $folder = 'general') {
        $file_path = $this->upload_path . $folder . '/' . $filename;
        
        if (file_exists($file_path)) {
            return array(
                'exists' => true,
                'size' => filesize($file_path),
                'url' => $this->getFileUrl($folder, $filename),
                'modified' => filemtime($file_path)
            );
        }
        
        return array('exists' => false);
    }
}

// Handle file upload requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $upload_handler = new FileUpload();
    
    // Get upload type
    $type = isset($_POST['type']) ? $_POST['type'] : 'general';
    $folder = $type === 'profile' ? 'profiles' : ($type === 'tournament' ? 'tournaments' : 'general');
    
    if (isset($_FILES['file'])) {
        $result = $upload_handler->uploadImage($_FILES['file'], $folder);
        
        if ($result['success']) {
            Response::success("File uploaded successfully", $result, 201);
        } else {
            Response::error($result['error'], 400);
        }
    } else {
        Response::error("No file provided", 400);
    }
} else {
    Response::error("Method not allowed", 405);
}
?>
