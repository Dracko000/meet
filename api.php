<?php
// Simple PHP backend with MySQL database integration
require_once 'database.php';

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

try {
    $dbSetup = new DatabaseSetup();
    // Ensure tables exist
    $dbSetup->createTables();
} catch (Exception $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

// Handle different API endpoints
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'create-room':
        createRoom($dbSetup);
        break;
    case 'join-room':
        joinRoom($dbSetup);
        break;
    case 'send-message':
        sendMessage($dbSetup);
        break;
    case 'get-messages':
        getMessages($dbSetup);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

function createRoom($dbSetup) {
    // Generate a unique room ID
    $roomId = bin2hex(random_bytes(8)); // 16 character hex room ID

    try {
        $dbSetup->createRoom($roomId, "Meeting Room");

        echo json_encode([
            'success' => true,
            'roomId' => $roomId,
            'message' => 'Room created successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to create room: ' . $e->getMessage()
        ]);
    }
}

function joinRoom($dbSetup) {
    $roomId = $_POST['roomId'] ?? '';

    if (empty($roomId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID is required']);
        return;
    }

    try {
        // Check if room exists
        $room = $dbSetup->getRoom($roomId);
        if (!$room) {
            http_response_code(404);
            echo json_encode(['error' => 'Room does not exist']);
            return;
        }

        // In a real implementation, you'd store the user in the room
        $userId = $_POST['userId'] ?? 'user_' . bin2hex(random_bytes(4));
        $username = $_POST['username'] ?? 'Anonymous';

        $dbSetup->joinRoom($userId, $roomId, $username);

        echo json_encode([
            'success' => true,
            'roomId' => $roomId,
            'userId' => $userId,
            'message' => 'Successfully joined room'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to join room: ' . $e->getMessage()
        ]);
    }
}

function sendMessage($dbSetup) {
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

    try {
        $dbSetup->saveMessage($roomId, $userId, $message);

        echo json_encode([
            'success' => true,
            'message' => 'Message sent successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to send message: ' . $e->getMessage()
        ]);
    }
}

function getMessages($dbSetup) {
    $roomId = $_GET['roomId'] ?? '';

    if (empty($roomId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID is required']);
        return;
    }

    try {
        $messages = $dbSetup->getMessages($roomId);

        echo json_encode([
            'success' => true,
            'messages' => $messages,
            'count' => count($messages)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to get messages: ' . $e->getMessage()
        ]);
    }
}
?>