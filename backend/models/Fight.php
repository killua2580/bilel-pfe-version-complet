<?php
/**
 * Fight Model for Gym Power Application
 */

class Fight {
    private $conn;
    private $table_name = "fights";
    
    // Fight properties
    public $id;
    public $tournament_id;
    public $fighter1_id;
    public $fighter2_id;
    public $fight_date;
    public $winner_id;
    public $status;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Create new fight
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET tournament_id=:tournament_id, fighter1_id=:fighter1_id, 
                      fighter2_id=:fighter2_id, fight_date=:fight_date, status=:status";
        
        $stmt = $this->conn->prepare($query);
        
        // Set default status if not provided
        $this->status = $this->status ?? 'scheduled';
        
        // Bind values
        $stmt->bindParam(":tournament_id", $this->tournament_id);
        $stmt->bindParam(":fighter1_id", $this->fighter1_id);
        $stmt->bindParam(":fighter2_id", $this->fighter2_id);
        $stmt->bindParam(":fight_date", $this->fight_date);
        $stmt->bindParam(":status", $this->status);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Read all fights with fighter and tournament details
     */
    public function read() {
        $query = "SELECT 
                    f.id, f.tournament_id, f.fighter1_id, f.fighter2_id, 
                    f.fight_date, f.winner_id, f.status, f.created_at,
                    t.name as tournament_name,
                    u1.first_name as fighter1_first_name, u1.last_name as fighter1_last_name, 
                    u1.weight as fighter1_weight, u1.age as fighter1_age,
                    u2.first_name as fighter2_first_name, u2.last_name as fighter2_last_name,
                    u2.weight as fighter2_weight, u2.age as fighter2_age,
                    w.first_name as winner_first_name, w.last_name as winner_last_name
                  FROM " . $this->table_name . " f
                  INNER JOIN tournaments t ON f.tournament_id = t.id
                  INNER JOIN users u1 ON f.fighter1_id = u1.id
                  INNER JOIN users u2 ON f.fighter2_id = u2.id
                  LEFT JOIN users w ON f.winner_id = w.id
                  ORDER BY f.fight_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Read fights by tournament
     */
    public function readByTournament($tournament_id) {
        $query = "SELECT 
                    f.id, f.tournament_id, f.fighter1_id, f.fighter2_id, 
                    f.fight_date, f.winner_id, f.status, f.created_at,
                    t.name as tournament_name,
                    u1.first_name as fighter1_first_name, u1.last_name as fighter1_last_name, 
                    u1.weight as fighter1_weight, u1.age as fighter1_age,
                    u2.first_name as fighter2_first_name, u2.last_name as fighter2_last_name,
                    u2.weight as fighter2_weight, u2.age as fighter2_age,
                    w.first_name as winner_first_name, w.last_name as winner_last_name
                  FROM " . $this->table_name . " f
                  INNER JOIN tournaments t ON f.tournament_id = t.id
                  INNER JOIN users u1 ON f.fighter1_id = u1.id
                  INNER JOIN users u2 ON f.fighter2_id = u2.id
                  LEFT JOIN users w ON f.winner_id = w.id
                  WHERE f.tournament_id = ?
                  ORDER BY f.fight_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $tournament_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Read single fight
     */
    public function readOne() {
        $query = "SELECT 
                    f.id, f.tournament_id, f.fighter1_id, f.fighter2_id, 
                    f.fight_date, f.winner_id, f.status, f.created_at,
                    t.name as tournament_name,
                    u1.first_name as fighter1_first_name, u1.last_name as fighter1_last_name, 
                    u1.weight as fighter1_weight, u1.age as fighter1_age,
                    u2.first_name as fighter2_first_name, u2.last_name as fighter2_last_name,
                    u2.weight as fighter2_weight, u2.age as fighter2_age,
                    w.first_name as winner_first_name, w.last_name as winner_last_name
                  FROM " . $this->table_name . " f
                  INNER JOIN tournaments t ON f.tournament_id = t.id
                  INNER JOIN users u1 ON f.fighter1_id = u1.id
                  INNER JOIN users u2 ON f.fighter2_id = u2.id
                  LEFT JOIN users w ON f.winner_id = w.id
                  WHERE f.id = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->tournament_id = $row['tournament_id'];
            $this->fighter1_id = $row['fighter1_id'];
            $this->fighter2_id = $row['fighter2_id'];
            $this->fight_date = $row['fight_date'];
            $this->winner_id = $row['winner_id'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Update fight
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET fight_date=:fight_date, winner_id=:winner_id, status=:status 
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":fight_date", $this->fight_date);
        $stmt->bindParam(":winner_id", $this->winner_id);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Delete fight
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Create multiple fights for tournament (bulk insert)
     */
    public function createBulk($fights_data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (tournament_id, fighter1_id, fighter2_id, fight_date, status) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->conn->beginTransaction();
        
        try {
            foreach($fights_data as $fight) {
                $stmt->execute([
                    $fight['tournament_id'],
                    $fight['fighter1_id'],
                    $fight['fighter2_id'],
                    $fight['fight_date'],
                    $fight['status'] ?? 'scheduled'
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
     * Check if fighters are compatible for a fight
     */
    public static function areFightersCompatible($fighter1, $fighter2) {
        // Check weight difference (maximum 5kg)
        $weightDiff = abs($fighter1['weight'] - $fighter2['weight']);
        if ($weightDiff > 5) {
            return false;
        }
        
        // Check age difference (maximum 3 years)
        $ageDiff = abs($fighter1['age'] - $fighter2['age']);
        if ($ageDiff > 3) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Find optimal matches for fighters
     */
    public static function findOptimalMatches($fighters) {
        $matches = [];
        $used = [];
        
        for ($i = 0; $i < count($fighters); $i++) {
            if (in_array($i, $used)) continue;
            
            $fighter1 = $fighters[$i];
            $bestMatch = null;
            $bestMatchIndex = -1;
            
            // Find the best compatible opponent
            for ($j = $i + 1; $j < count($fighters); $j++) {
                if (in_array($j, $used)) continue;
                
                $fighter2 = $fighters[$j];
                
                if (self::areFightersCompatible($fighter1, $fighter2)) {
                    $bestMatch = $fighter2;
                    $bestMatchIndex = $j;
                    break;
                }
            }
            
            // If we found a compatible match, create the pairing
            if ($bestMatch) {
                $matches[] = [
                    'fighter1' => $fighter1,
                    'fighter2' => $bestMatch
                ];
                $used[] = $i;
                $used[] = $bestMatchIndex;
            }
        }
        
        return [
            'matches' => $matches,
            'unmatchedFighters' => array_values(array_filter($fighters, function($fighter, $index) use ($used) {
                return !in_array($index, $used);
            }, ARRAY_FILTER_USE_BOTH))
        ];
    }
}
?>
