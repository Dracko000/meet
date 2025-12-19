<?php
// WebSocket signaling server simulation
// In a real implementation, you would use a WebSocket server like Ratchet for PHP or Socket.io with Node.js

class SignalingServer {
    private $clients = [];
    private $rooms = [];
    
    public function __construct() {
        // In a real implementation, this would connect to a WebSocket server
        // This is just a simulation for the POC
    }
    
    public function handleSignal($data) {
        $type = $data['type'] ?? '';
        $roomId = $data['roomId'] ?? '';
        $senderId = $data['senderId'] ?? '';
        
        switch($type) {
            case 'join':
                return $this->joinRoom($roomId, $senderId);
            case 'offer':
                return $this->handleOffer($data);
            case 'answer':
                return $this->handleAnswer($data);
            case 'candidate':
                return $this->handleCandidate($data);
            case 'leave':
                return $this->leaveRoom($roomId, $senderId);
            default:
                return ['error' => 'Invalid signal type'];
        }
    }
    
    private function joinRoom($roomId, $clientId) {
        if (!isset($this->rooms[$roomId])) {
            $this->rooms[$roomId] = [];
        }
        
        // Add client to room
        $this->rooms[$roomId][$clientId] = [
            'id' => $clientId,
            'joinedAt' => time()
        ];
        
        // Get list of other participants in the room
        $otherParticipants = [];
        foreach ($this->rooms[$roomId] as $id => $info) {
            if ($id !== $clientId) {
                $otherParticipants[] = $id;
            }
        }
        
        return [
            'type' => 'joined',
            'roomId' => $roomId,
            'clientId' => $clientId,
            'otherParticipants' => $otherParticipants,
            'message' => 'Successfully joined room'
        ];
    }
    
    private function handleOffer($data) {
        // Forward offer to the target client
        $targetId = $data['targetId'] ?? '';
        $roomId = $data['roomId'] ?? '';
        
        // In a real implementation, this would send the offer to the target client via WebSocket
        
        return [
            'type' => 'offer_forwarded',
            'targetId' => $targetId,
            'message' => 'Offer forwarded'
        ];
    }
    
    private function handleAnswer($data) {
        // Forward answer to the target client
        $targetId = $data['targetId'] ?? '';
        
        // In a real implementation, this would send the answer to the target client via WebSocket
        
        return [
            'type' => 'answer_forwarded',
            'targetId' => $targetId,
            'message' => 'Answer forwarded'
        ];
    }
    
    private function handleCandidate($data) {
        // Forward ICE candidate to the target client
        $targetId = $data['targetId'] ?? '';
        
        // In a real implementation, this would send the candidate to the target client via WebSocket
        
        return [
            'type' => 'candidate_forwarded',
            'targetId' => $targetId,
            'message' => 'Candidate forwarded'
        ];
    }
    
    private function leaveRoom($roomId, $clientId) {
        if (isset($this->rooms[$roomId][$clientId])) {
            unset($this->rooms[$roomId][$clientId]);
            
            // If room is empty, remove it
            if (empty($this->rooms[$roomId])) {
                unset($this->rooms[$roomId]);
            }
        }
        
        return [
            'type' => 'left',
            'roomId' => $roomId,
            'clientId' => $clientId,
            'message' => 'Successfully left room'
        ];
    }
}

// Handle POST requests to this endpoint
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    // Get the raw POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    $signalingServer = new SignalingServer();
    $response = $signalingServer->handleSignal($input);
    
    echo json_encode($response);
} else {
    // For GET requests, return simple info
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'signaling_server_mock',
        'message' => 'This is a mock signaling server. Use POST with JSON data to send signals.'
    ]);
}
?>