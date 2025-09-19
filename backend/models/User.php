<?php
/**
 * User Model for Gym Power Application
 */

class User {
    private $conn;
    private $table_name = "users";
    
    // User properties
    public $id;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $weight;
    public $age;
    public $photo;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Create new user
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET email=:email, password=:password, first_name=:first_name, 
                      last_name=:last_name, weight=:weight, age=:age, photo=:photo";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->weight = htmlspecialchars(strip_tags($this->weight));
        $this->age = htmlspecialchars(strip_tags($this->age));
        $this->photo = htmlspecialchars(strip_tags($this->photo));
        
        // Bind values
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":age", $this->age);
        $stmt->bindParam(":photo", $this->photo);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Read all users
     */
    public function read() {
        $query = "SELECT id, email, first_name, last_name, weight, age, photo, created_at 
                  FROM " . $this->table_name . " 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Read single user
     */
    public function readOne() {
        $query = "SELECT id, email, first_name, last_name, weight, age, photo, created_at 
                  FROM " . $this->table_name . " 
                  WHERE id = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->weight = $row['weight'];
            $this->age = $row['age'];
            $this->photo = $row['photo'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Update user
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET first_name=:first_name, last_name=:last_name, 
                      weight=:weight, age=:age, photo=:photo 
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->weight = htmlspecialchars(strip_tags($this->weight));
        $this->age = htmlspecialchars(strip_tags($this->age));
        $this->photo = htmlspecialchars(strip_tags($this->photo));
        
        // Bind values
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":age", $this->age);
        $stmt->bindParam(":photo", $this->photo);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Delete user
     */
    public function delete() {
        // Don't allow deletion of admin user
        if($this->email === 'admin@admin.com') {
            return false;
        }
        
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Login user
     */
    public function login($email, $password) {
        $query = "SELECT id, email, password, first_name, last_name, weight, age, photo 
                  FROM " . $this->table_name . " 
                  WHERE email = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row && $row['password'] === $password) {
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->weight = $row['weight'];
            $this->age = $row['age'];
            $this->photo = $row['photo'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if email exists
     */
    public function emailExists() {
        $query = "SELECT id, email FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            return true;
        }
        
        return false;
    }
}
?>
