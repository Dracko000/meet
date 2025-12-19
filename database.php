<?php
// Database connection and operations class
require_once __DIR__ . '/config/database_config.php';

// Database connection class
class DatabaseConnection {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DatabaseConfig::HOST .
                   ";dbname=" . DatabaseConfig::DATABASE .
                   ";charset=" . DatabaseConfig::CHARSET;

            $this->connection = new PDO($dsn,
                                      DatabaseConfig::USER,
                                      DatabaseConfig::PASSWORD,
                                      [
                                          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                                          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                                          PDO::ATTR_EMULATE_PREPARES => false
                                      ]);
        } catch (PDOException $e) {
            throw new Exception("Connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}

// Database setup class
class DatabaseSetup {
    private $db;

    public function __construct() {
        $this->db = DatabaseConnection::getInstance()->getConnection();
    }

    public function getRoom($roomId) {
        $stmt = $this->db->prepare("SELECT * FROM rooms WHERE room_id = ? AND is_active = TRUE");
        $stmt->execute([$roomId]);
        return $stmt->fetch();
    }

    public function createRoom($roomId, $roomName = null, $createdBy = null) {
        $stmt = $this->db->prepare("INSERT INTO rooms (room_id, room_name, created_by) VALUES (?, ?, ?)");
        return $stmt->execute([$roomId, $roomName, $createdBy]);
    }

    public function joinRoom($userId, $roomId, $username = null) {
        // Create user record
        $stmt = $this->db->prepare("INSERT INTO users (user_id, username, joined_room) VALUES (?, ?, ?)
                                   ON DUPLICATE KEY UPDATE joined_room = VALUES(joined_room), left_at = NULL");
        $stmt->execute([$userId, $username, $roomId]);

        // Update room activity
        $stmt = $this->db->prepare("UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE room_id = ?");
        return $stmt->execute([$roomId]);
    }

    public function leaveRoom($userId) {
        $stmt = $this->db->prepare("UPDATE users SET left_at = CURRENT_TIMESTAMP WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }

    public function saveMessage($roomId, $senderId, $message) {
        $stmt = $this->db->prepare("INSERT INTO messages (room_id, sender_id, message) VALUES (?, ?, ?)");
        return $stmt->execute([$roomId, $senderId, $message]);
    }

    public function getMessages($roomId, $limit = 50) {
        $stmt = $this->db->prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY sent_at DESC LIMIT ?");
        $stmt->execute([$roomId, $limit]);
        return array_reverse($stmt->fetchAll()); // Return in chronological order
    }
}
?>