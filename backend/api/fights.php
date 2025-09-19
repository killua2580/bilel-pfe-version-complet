<?php
/**
 * Fights API endpoints
 */

require_once '../config/database.php';
require_once '../models/Fight.php';
require_once '../models/Tournament.php';
require_once '../models/Notification.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize fight object
$fight = new Fight($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        handleGetFights($fight);
        break;
        
    case 'POST':
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        if($action === 'organize') {
            handleOrganizeFights($fight, $db);
        } else {
            handleCreateFight($fight);
        }
        break;
        
    case 'PUT':
        handleUpdateFight($fight);
        break;
        
    case 'DELETE':
        handleDeleteFight($fight);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function handleGetFights($fight) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $tournament_id = isset($_GET['tournament_id']) ? $_GET['tournament_id'] : null;
    
    if($id) {
        // Get single fight
        $fight->id = $id;
        if($fight->readOne()) {
            http_response_code(200);
            echo json_encode(array(
                "id" => $fight->id,
                "tournament_id" => $fight->tournament_id,
                "fighter1_id" => $fight->fighter1_id,
                "fighter2_id" => $fight->fighter2_id,
                "fight_date" => $fight->fight_date,
                "winner_id" => $fight->winner_id,
                "status" => $fight->status,
                "created_at" => $fight->created_at
            ));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Fight not found"));
        }
    } elseif($tournament_id) {
        // Get fights by tournament
        $stmt = $fight->readByTournament($tournament_id);
        $fights = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $fights[] = formatFightData($row);
        }
        
        http_response_code(200);
        echo json_encode($fights);
    } else {
        // Get all fights
        $stmt = $fight->read();
        $fights = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $fights[] = formatFightData($row);
        }
        
        http_response_code(200);
        echo json_encode($fights);
    }
}

function formatFightData($row) {
    return array(
        "id" => $row['id'],
        "tournament_id" => $row['tournament_id'],
        "fighter1_id" => $row['fighter1_id'],
        "fighter2_id" => $row['fighter2_id'],
        "fight_date" => $row['fight_date'],
        "winner_id" => $row['winner_id'],
        "status" => $row['status'],
        "created_at" => $row['created_at'],
        "tournament" => array(
            "name" => $row['tournament_name']
        ),
        "fighter1" => array(
            "first_name" => $row['fighter1_first_name'],
            "last_name" => $row['fighter1_last_name'],
            "weight" => $row['fighter1_weight'],
            "age" => $row['fighter1_age']
        ),
        "fighter2" => array(
            "first_name" => $row['fighter2_first_name'],
            "last_name" => $row['fighter2_last_name'],
            "weight" => $row['fighter2_weight'],
            "age" => $row['fighter2_age']
        ),
        "winner" => $row['winner_first_name'] ? array(
            "first_name" => $row['winner_first_name'],
            "last_name" => $row['winner_last_name']
        ) : null
    );
}

function handleCreateFight($fight) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    if(!empty($data->tournament_id) && !empty($data->fighter1_id) && 
       !empty($data->fighter2_id) && !empty($data->fight_date)) {
        
        // Set fight properties
        $fight->tournament_id = $data->tournament_id;
        $fight->fighter1_id = $data->fighter1_id;
        $fight->fighter2_id = $data->fighter2_id;
        $fight->fight_date = $data->fight_date;
        $fight->status = $data->status ?? 'scheduled';
        
        if($fight->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Fight created successfully",
                "id" => $fight->id
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to create fight"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: tournament_id, fighter1_id, fighter2_id, fight_date"));
    }
}

function handleOrganizeFights($fight, $db) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data || empty($data->tournament_id)) {
        http_response_code(400);
        echo json_encode(array("message" => "Tournament ID is required"));
        return;
    }
    
    try {
        // Get tournament participants
        $tournament = new Tournament($db);
        $tournament->id = $data->tournament_id;
        $stmt = $tournament->getParticipants();
        
        $participants = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $participants[] = $row;
        }
        
        if(count($participants) < 2) {
            http_response_code(400);
            echo json_encode(array(
                "message" => "Il faut au moins 2 participants pour organiser des combats"
            ));
            return;
        }
        
        // Find optimal matches using the algorithm
        $matching_result = Fight::findOptimalMatches($participants);
        
        // Prepare fights data
        $fights_data = array();
        $fight_date = date('Y-m-d H:i:s', strtotime('+1 week'));
        
        foreach($matching_result['matches'] as $match) {
            $fights_data[] = array(
                'tournament_id' => $data->tournament_id,
                'fighter1_id' => $match['fighter1']['id'],
                'fighter2_id' => $match['fighter2']['id'],
                'fight_date' => $fight_date,
                'status' => 'scheduled'
            );
        }
        
        if(count($fights_data) > 0) {
            // Create fights in bulk
            if($fight->createBulk($fights_data)) {
                // Send notifications for each fight
                foreach($matching_result['matches'] as $match) {
                    $fight_data = array(
                        'fighter1_id' => $match['fighter1']['id'],
                        'fighter2_id' => $match['fighter2']['id'],
                        'fighter1_first_name' => $match['fighter1']['first_name'],
                        'fighter1_last_name' => $match['fighter1']['last_name'],
                        'fighter1_weight' => $match['fighter1']['weight'],
                        'fighter1_age' => $match['fighter1']['age'],
                        'fighter2_first_name' => $match['fighter2']['first_name'],
                        'fighter2_last_name' => $match['fighter2']['last_name'],
                        'fighter2_weight' => $match['fighter2']['weight'],
                        'fighter2_age' => $match['fighter2']['age'],
                        'fight_date' => $fight_date
                    );
                    
                    Notification::sendFightNotifications($db, $fight_data);
                }
                
                $response = array(
                    "message" => count($fights_data) . " combats créés avec succès !",
                    "fights_created" => count($fights_data),
                    "unmatched_fighters" => count($matching_result['unmatchedFighters'])
                );
                
                if(count($matching_result['unmatchedFighters']) > 0) {
                    $unmatched_names = array();
                    foreach($matching_result['unmatchedFighters'] as $fighter) {
                        $unmatched_names[] = $fighter['first_name'] . ' ' . $fighter['last_name'] . 
                                           ' (' . $fighter['weight'] . 'kg, ' . $fighter['age'] . 'ans)';
                    }
                    $response['unmatched_details'] = $unmatched_names;
                    $response['message'] .= "\n\nNote: " . count($matching_result['unmatchedFighters']) . 
                                          " combattant(s) n'ont pas pu être appariés (critères de compatibilité non respectés).";
                }
                
                http_response_code(201);
                echo json_encode($response);
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Erreur lors de la création des combats"));
            }
        } else {
            $unmatched_names = array();
            foreach($matching_result['unmatchedFighters'] as $fighter) {
                $unmatched_names[] = $fighter['first_name'] . ' ' . $fighter['last_name'] . 
                                   ' (' . $fighter['weight'] . 'kg, ' . $fighter['age'] . 'ans)';
            }
            
            http_response_code(400);
            echo json_encode(array(
                "message" => "Aucun combat ne peut être organisé. Aucune paire de combattants compatible trouvée selon les critères:\n" .
                           "• Différence de poids maximum: 5kg\n" .
                           "• Différence d'âge maximum: 3 ans\n\n" .
                           "Combattants non appariés:\n" . implode("\n", $unmatched_names),
                "unmatched_fighters" => count($matching_result['unmatchedFighters']),
                "unmatched_details" => $unmatched_names
            ));
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Erreur lors de l'organisation des combats: " . $e->getMessage()));
    }
}

function handleUpdateFight($fight) {
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
        echo json_encode(array("message" => "Fight ID is required"));
        return;
    }
    
    // Set fight properties
    $fight->id = $id;
    $fight->fight_date = $data->fight_date ?? '';
    $fight->winner_id = $data->winner_id ?? null;
    $fight->status = $data->status ?? 'scheduled';
    
    if($fight->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "Fight updated successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to update fight"));
    }
}

function handleDeleteFight($fight) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "Fight ID is required"));
        return;
    }
    
    $fight->id = $id;
    
    if($fight->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Fight deleted successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to delete fight"));
    }
}
?>
