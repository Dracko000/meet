<?php
// Video conferencing application entry point
session_start();

// Generate a random room ID if not provided
if (!isset($_GET['room']) || empty($_GET['room'])) {
    $roomId = bin2hex(random_bytes(8)); // 16 character random room ID
    header("Location: ?room=" . $roomId);
    exit();
}

$roomId = $_GET['room'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convertation - Video Conferencing</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icon.png">
    <meta name="theme-color" content="#4285f4">
    <meta name="description" content="Free video conferencing application like Google Meet">
    
    <!-- Load Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div id="app">
        <!-- Header section -->
        <header id="header">
            <div class="logo">
                <h1><i class="fas fa-video"></i> Convertation</h1>
            </div>
            <div class="room-info">
                <span>Room ID: <?php echo htmlspecialchars($roomId); ?></span>
                <button id="copy-room-btn" title="Copy Room ID"><i class="fas fa-copy"></i></button>
            </div>
        </header>

        <!-- Main video conference area -->
        <main id="main-container">
            <!-- Video grid area -->
            <div id="video-grid">
                <!-- Local video will be added here -->
                <div id="local-video-container" class="video-container active">
                    <video id="local-video" autoplay muted playsinline></video>
                    <div class="video-overlay">
                        <span class="participant-name">You</span>
                        <div class="video-status">
                            <i class="fas fa-microphone" id="mic-status"></i>
                            <i class="fas fa-video" id="video-status"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Remote videos will be added dynamically -->
                <div id="remote-videos-container"></div>
            </div>
            
            <!-- Controls bar -->
            <div id="controls-bar">
                <button id="toggle-audio" class="control-btn active" title="Mute/Unmute">
                    <i class="fas fa-microphone"></i>
                </button>
                <button id="toggle-video" class="control-btn active" title="Start/Stop Camera">
                    <i class="fas fa-video"></i>
                </button>
                <button id="screen-share" class="control-btn" title="Share Screen">
                    <i class="fas fa-desktop"></i>
                </button>
                <button id="chat-toggle" class="control-btn" title="Open Chat">
                    <i class="fas fa-comment"></i>
                    <span id="unread-count" class="badge hidden">0</span>
                </button>
                <button id="leave-call" class="control-btn leave-btn" title="Leave Call">
                    <i class="fas fa-phone"></i>
                </button>
            </div>
            
            <!-- Chat panel -->
            <div id="chat-panel" class="chat-panel hidden">
                <div class="chat-header">
                    <h3><i class="fas fa-comments"></i> Chat</h3>
                    <button id="close-chat" class="close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div id="messages-container">
                    <div class="message welcome-message">
                        <p>Welcome to the meeting! Share the room ID with others to invite them.</p>
                    </div>
                </div>
                <form id="message-form" class="message-form">
                    <input type="text" id="message-input" placeholder="Type your message..." maxlength="200">
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </main>
    </div>

    <!-- Signaling server connection status indicator -->
    <div id="connection-status" class="connection-status disconnected">
        <i class="fas fa-circle"></i> Disconnected
    </div>

    <script src="js/config.js"></script>
    <script src="js/webrtc.js"></script>
    <script src="js/main.js"></script>
    <script src="js/chat.js"></script>
    <script src="js/pwa.js"></script>
</body>
</html>