<?php
/**
 * Tournament Model for Gym Power Application
 */

class Tournament {
    private $conn;
    private $table_name = "tournaments";
    
    // Tournament properties
    public $id;
    public $name;
    public $description;
    public $date;
    public $image;
    public $status;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Create new tournament
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, description=:description, date=:date, 
                      image=:image, status=:status";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->status = $this->status ?? 'upcoming';
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":status", $this->status);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Read all tournaments with participant count
     */
    public function read() {
        $query = "SELECT 
                    t.id, t.name, t.description, t.date, t.image, t.status, t.created_at,
                    COUNT(p.user_id) as participant_count,
                    CASE 
                        WHEN t.date < NOW() THEN 'past'
                        WHEN t.date > NOW() THEN 'upcoming'
                        ELSE 'current'
                    END as time_status
                  FROM " . $this->table_name . " t
                  LEFT JOIN participants p ON t.id = p.tournament_id
                  GROUP BY t.id, t.name, t.description, t.date, t.image, t.status, t.created_at
                  ORDER BY t.date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Read single tournament
     */
    public function readOne() {
        $query = "SELECT 
                    t.id, t.name, t.description, t.date, t.image, t.status, t.created_at,
                    COUNT(p.user_id) as participant_count
                  FROM " . $this->table_name . " t
                  LEFT JOIN participants p ON t.id = p.tournament_id
                  WHERE t.id = ? 
                  GROUP BY t.id, t.name, t.description, t.date, t.image, t.status, t.created_at
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->date = $row['date'];
            $this->image = $row['image'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Update tournament
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, description=:description, date=:date, 
                      image=:image, status=:status 
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->image = htmlspecialchars(strip_tags($this->image));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Delete tournament
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Get tournament participants
     */
    public function getParticipants() {
        $query = "SELECT u.id, u.first_name, u.last_name, u.weight, u.age, u.photo
                  FROM users u
                  INNER JOIN participants p ON u.id = p.user_id
                  WHERE p.tournament_id = ?
                  ORDER BY u.first_name, u.last_name";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Add participant to tournament
     */
    public function addParticipant($user_id) {
        $query = "INSERT INTO participants (tournament_id, user_id) VALUES (?, ?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $user_id);
        
        return $stmt->execute();
    }
    
    /**
     * Remove participant from tournament
     */
    public function removeParticipant($user_id) {
        $query = "DELETE FROM participants WHERE tournament_id = ? AND user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $user_id);
        
        return $stmt->execute();
    }
    
    /**
     * Check if user is already participant
     */
    public function isParticipant($user_id) {
        $query = "SELECT COUNT(*) as count FROM participants 
                  WHERE tournament_id = ? AND user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $user_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }
}
?>
