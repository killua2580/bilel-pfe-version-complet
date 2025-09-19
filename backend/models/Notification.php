<?php
/**
 * Notification Model for Gym Power Application
 */

class Notification {
    private $conn;
    private $table_name = "notifications";
    
    // Notification properties
    public $id;
    public $user_id;
    public $title;
    public $message;
    public $is_read;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Create new notification
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id=:user_id, title=:title, message=:message, is_read=:is_read";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->is_read = $this->is_read ?? false;
        
        // Bind values
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":is_read", $this->is_read, PDO::PARAM_BOOL);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Read notifications for a user
     */
    public function readByUser($user_id) {
        $query = "SELECT id, user_id, title, message, is_read, created_at 
                  FROM " . $this->table_name . " 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Read all notifications
     */
    public function read() {
        $query = "SELECT n.id, n.user_id, n.title, n.message, n.is_read, n.created_at,
                         u.first_name, u.last_name, u.email
                  FROM " . $this->table_name . " n
                  INNER JOIN users u ON n.user_id = u.id
                  ORDER BY n.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead() {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_read = true 
                  WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead($user_id) {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_read = true 
                  WHERE user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        
        return $stmt->execute();
    }
    
    /**
     * Delete notification
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Get unread notification count for user
     */
    public function getUnreadCount($user_id) {
        $query = "SELECT COUNT(*) as count 
                  FROM " . $this->table_name . " 
                  WHERE user_id = ? AND is_read = false";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'];
    }
    
    /**
     * Create bulk notifications
     */
    public function createBulk($notifications_data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (user_id, title, message, is_read) 
                  VALUES (?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->conn->beginTransaction();
        
        try {
            foreach($notifications_data as $notification) {
                $stmt->execute([
                    $notification['user_id'],
                    htmlspecialchars(strip_tags($notification['title'])),
                    htmlspecialchars(strip_tags($notification['message'])),
                    $notification['is_read'] ?? false
                ]);
            }
            
            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }
    
    /**
     * Send fight notification to both fighters
     */
    public static function sendFightNotifications($db, $fight_data) {
        $notification = new self($db);
        
        $fighter1_name = $fight_data['fighter2_first_name'] . ' ' . $fight_data['fighter2_last_name'];
        $fighter2_name = $fight_data['fighter1_first_name'] . ' ' . $fight_data['fighter1_last_name'];
        
        $fight_date = new DateTime($fight_data['fight_date']);
        $date_str = $fight_date->format('d/m/Y');
        $time_str = $fight_date->format('H:i');
        
        $weight_diff = abs($fight_data['fighter1_weight'] - $fight_data['fighter2_weight']);
        
        $notifications = [
            [
                'user_id' => $fight_data['fighter1_id'],
                'title' => '🥊 Nouveau combat programmé !',
                'message' => "Combat confirmé contre {$fighter1_name}\n" .
                           "📊 Profil adversaire: {$fight_data['fighter2_weight']}kg, {$fight_data['fighter2_age']} ans\n" .
                           "⚖️ Différence de poids: {$weight_diff}kg\n" .
                           "📅 Date: {$date_str}\n" .
                           "🕐 Heure: {$time_str}\n" .
                           "Bonne chance pour votre combat !",
                'is_read' => false
            ],
            [
                'user_id' => $fight_data['fighter2_id'],
                'title' => '🥊 Nouveau combat programmé !',
                'message' => "Combat confirmé contre {$fighter2_name}\n" .
                           "📊 Profil adversaire: {$fight_data['fighter1_weight']}kg, {$fight_data['fighter1_age']} ans\n" .
                           "⚖️ Différence de poids: {$weight_diff}kg\n" .
                           "📅 Date: {$date_str}\n" .
                           "🕐 Heure: {$time_str}\n" .
                           "Bonne chance pour votre combat !",
                'is_read' => false
            ]
        ];
        
        return $notification->createBulk($notifications);
    }
}
?>
