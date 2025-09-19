<?php
/**
 * Tournaments API endpoints
 */

require_once '../config/database.php';
require_once '../models/Tournament.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize tournament object
$tournament = new Tournament($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        handleGetTournaments($tournament);
        break;
        
    case 'POST':
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        if($action === 'participate') {
            handleParticipate($tournament);
        } else {
            handleCreateTournament($tournament);
        }
        break;
        
    case 'PUT':
        handleUpdateTournament($tournament);
        break;
        
    case 'DELETE':
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        if($action === 'leave') {
            handleLeaveTournament($tournament);
        } else {
            handleDeleteTournament($tournament);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function handleGetTournaments($tournament) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $action = isset($_GET['action']) ? $_GET['action'] : null;
    
    if($id && $action === 'participants') {
        // Get tournament participants
        $tournament->id = $id;
        $stmt = $tournament->getParticipants();
        $participants = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $participants[] = array(
                "id" => $row['id'],
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "weight" => $row['weight'],
                "age" => $row['age'],
                "photo" => $row['photo']
            );
        }
        
        http_response_code(200);
        echo json_encode($participants);
        
    } elseif($id) {
        // Get single tournament
        $tournament->id = $id;
        if($tournament->readOne()) {
            http_response_code(200);
            echo json_encode(array(
                "id" => $tournament->id,
                "name" => $tournament->name,
                "description" => $tournament->description,
                "date" => $tournament->date,
                "image" => $tournament->image,
                "status" => $tournament->status,
                "created_at" => $tournament->created_at
            ));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Tournament not found"));
        }
    } else {
        // Get all tournaments
        $stmt = $tournament->read();
        $tournaments = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tournaments[] = array(
                "id" => $row['id'],
                "name" => $row['name'],
                "description" => $row['description'],
                "date" => $row['date'],
                "image" => $row['image'],
                "status" => $row['status'],
                "created_at" => $row['created_at'],
                "participant_count" => $row['participant_count'],
                "time_status" => $row['time_status']
            );
        }
        
        http_response_code(200);
        echo json_encode($tournaments);
    }
}

function handleCreateTournament($tournament) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    if(!empty($data->name) && !empty($data->date)) {
        // Set tournament properties
        $tournament->name = $data->name;
        $tournament->description = $data->description ?? '';
        $tournament->date = $data->date;
        $tournament->image = $data->image ?? null;
        $tournament->status = $data->status ?? 'upcoming';
        
        if($tournament->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Tournament created successfully",
                "id" => $tournament->id
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to create tournament"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: name, date"));
    }
}

function handleUpdateTournament($tournament) {
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
        echo json_encode(array("message" => "Tournament ID is required"));
        return;
    }
    
    // Set tournament properties
    $tournament->id = $id;
    $tournament->name = $data->name ?? '';
    $tournament->description = $data->description ?? '';
    $tournament->date = $data->date ?? '';
    $tournament->image = $data->image ?? null;
    $tournament->status = $data->status ?? 'upcoming';
    
    if($tournament->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "Tournament updated successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to update tournament"));
    }
}

function handleDeleteTournament($tournament) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if(!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "Tournament ID is required"));
        return;
    }
    
    $tournament->id = $id;
    
    if($tournament->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Tournament deleted successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to delete tournament"));
    }
}

function handleParticipate($tournament) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    if(!empty($data->tournament_id) && !empty($data->user_id)) {
        $tournament->id = $data->tournament_id;
        
        // Check if user is already a participant
        if($tournament->isParticipant($data->user_id)) {
            http_response_code(400);
            echo json_encode(array("message" => "User is already a participant"));
            return;
        }
        
        if($tournament->addParticipant($data->user_id)) {
            http_response_code(201);
            echo json_encode(array("message" => "Successfully joined tournament"));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to join tournament"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: tournament_id, user_id"));
    }
}

function handleLeaveTournament($tournament) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!$data) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid JSON data"));
        return;
    }
    
    if(!empty($data->tournament_id) && !empty($data->user_id)) {
        $tournament->id = $data->tournament_id;
        
        if($tournament->removeParticipant($data->user_id)) {
            http_response_code(200);
            echo json_encode(array("message" => "Successfully left tournament"));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to leave tournament"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Required fields: tournament_id, user_id"));
    }
}
?>
