<?php
// WebSocket signaling server with MySQL database integration
require_once 'database.php';

class SignalingServer {
    private $dbSetup;

    public function __construct() {
        try {
            $this->dbSetup = new DatabaseSetup();
            // Ensure tables exist
            $this->dbSetup->createTables();
        } catch (Exception $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public function handleSignal($data) {
        $type = $data['type'] ?? '';
        $roomId = $data['roomId'] ?? '';
        $senderId = $data['senderId'] ?? '';

        switch($type) {
            case 'join':
                return $this->joinRoom($roomId, $senderId, $data['username'] ?? null);
            case 'offer':
                return $this->handleOffer($data);
            case 'answer':
                return $this->handleAnswer($data);
            case 'candidate':
                return $this->handleCandidate($data);
            case 'leave':
                return $this->leaveRoom($roomId, $senderId);
            case 'message':
                return $this->handleMessage($data);
            case 'get-messages':
                return $this->getMessages($roomId);
            default:
                return ['error' => 'Invalid signal type'];
        }
    }

    private function joinRoom($roomId, $clientId, $username = null) {
        // Add user to room in database
        try {
            $this->dbSetup->joinRoom($clientId, $roomId, $username);
        } catch (Exception $e) {
            error_log("Failed to register user in database: " . $e->getMessage());
        }

        return [
            'type' => 'joined',
            'roomId' => $roomId,
            'clientId' => $clientId,
            'message' => 'Successfully joined room',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    private function handleOffer($data) {
        // In a real WebRTC implementation, this would forward the offer to the target client
        // For this simulation, we'll just return the data
        return [
            'type' => 'offer_received',
            'from' => $data['senderId'],
            'targetId' => $data['targetId'],
            'sdp' => $data['sdp'],
            'message' => 'Offer received and forwarded'
        ];
    }

    private function handleAnswer($data) {
        // In a real WebRTC implementation, this would forward the answer to the target client
        return [
            'type' => 'answer_received',
            'from' => $data['senderId'],
            'targetId' => $data['targetId'],
            'sdp' => $data['sdp'],
            'message' => 'Answer received and forwarded'
        ];
    }

    private function handleCandidate($data) {
        // In a real WebRTC implementation, this would forward the ICE candidate to the target client
        return [
            'type' => 'candidate_received',
            'from' => $data['senderId'],
            'targetId' => $data['targetId'],
            'candidate' => $data['candidate'],
            'message' => 'Candidate received and forwarded'
        ];
    }

    private function leaveRoom($roomId, $clientId) {
        // Mark user as left in database
        try {
            $this->dbSetup->leaveRoom($clientId);
        } catch (Exception $e) {
            error_log("Failed to update user leave status: " . $e->getMessage());
        }

        return [
            'type' => 'left',
            'roomId' => $roomId,
            'clientId' => $clientId,
            'message' => 'Successfully left room',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    private function handleMessage($data) {
        $roomId = $data['roomId'] ?? '';
        $senderId = $data['senderId'] ?? '';
        $message = $data['message'] ?? '';

        if (empty($roomId) || empty($senderId) || empty($message)) {
            return ['error' => 'Missing required fields'];
        }

        // Save message to database
        try {
            $this->dbSetup->saveMessage($roomId, $senderId, $message);

            return [
                'type' => 'message_saved',
                'roomId' => $roomId,
                'senderId' => $senderId,
                'message' => $message,
                'timestamp' => date('Y-m-d H:i:s'),
                'message' => 'Message saved to database'
            ];
        } catch (Exception $e) {
            return ['error' => 'Failed to save message: ' . $e->getMessage()];
        }
    }

    private function getMessages($roomId) {
        if (empty($roomId)) {
            return ['error' => 'Room ID is required'];
        }

        try {
            $messages = $this->dbSetup->getMessages($roomId);

            return [
                'type' => 'messages',
                'roomId' => $roomId,
                'messages' => $messages,
                'count' => count($messages)
            ];
        } catch (Exception $e) {
            return ['error' => 'Failed to retrieve messages: ' . $e->getMessage()];
        }
    }
}

// Handle POST requests to this endpoint
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Get the raw POST data
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $signalingServer = new SignalingServer();
        $response = $signalingServer->handleSignal($input);
    } catch (Exception $e) {
        $response = ['error' => 'Server error: ' . $e->getMessage()];
        http_response_code(500);
    }

    echo json_encode($response);
} else {
    // For GET requests, return simple info
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'signaling_server_db',
        'message' => 'This is a signaling server with MySQL database integration. Use POST with JSON data to send signals.'
    ]);
}
?>