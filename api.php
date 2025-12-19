<?php
// Simple PHP backend for signaling server functionality
header('Content-Type: application/json');

// Enable CORS for WebRTC connections
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle different API endpoints
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'create-room':
        createRoom();
        break;
    case 'join-room':
        joinRoom();
        break;
    case 'send-message':
        sendMessage();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

function createRoom() {
    // Generate a unique room ID
    $roomId = bin2hex(random_bytes(8)); // 16 character hex room ID
    
    echo json_encode([
        'success' => true,
        'roomId' => $roomId,
        'message' => 'Room created successfully'
    ]);
}

function joinRoom() {
    $roomId = $_POST['roomId'] ?? '';
    
    if (empty($roomId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID is required']);
        return;
    }
    
    // In a real implementation, you'd validate the room exists
    // and store the user in the room
    
    echo json_encode([
        'success' => true,
        'roomId' => $roomId,
        'message' => 'Successfully joined room'
    ]);
}

function sendMessage() {
    $roomId = $_POST['roomId'] ?? '';
    $message = $_POST['message'] ?? '';
    $userId = $_POST['userId'] ?? '';
    
    if (empty($roomId) || empty($message) || empty($userId)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Room ID, message, and user ID are required'
        ]);
        return;
    }
    
    // In a real implementation, you'd broadcast the message to all
    // participants in the room via WebSocket
    
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);
}
?>