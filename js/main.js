// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (!roomId) {
        // This shouldn't happen due to the redirect in PHP, but just in case
        window.location.href = '/';
        return;
    }
    
    // Initialize WebRTC client
    const webrtcClient = new WebRTCClient(roomId);

    // Store client instance in global scope for debugging
    window.webrtcClient = webrtcClient;

    // Initialize chat client
    const chatClient = new ChatClient(roomId);
    window.chatClient = chatClient; // For debugging

    // Set up UI event handlers
    setupEventListeners(webrtcClient);

    // Initialize copy room functionality
    initializeCopyRoom(roomId);
});

function setupEventListeners(webrtcClient) {
    // Audio toggle
    const toggleAudioBtn = document.getElementById('toggle-audio');
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', function() {
            webrtcClient.toggleAudio();
        });
    }
    
    // Video toggle
    const toggleVideoBtn = document.getElementById('toggle-video');
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', function() {
            webrtcClient.toggleVideo();
        });
    }
    
    // Screen sharing
    const screenShareBtn = document.getElementById('screen-share');
    if (screenShareBtn) {
        screenShareBtn.addEventListener('click', function() {
            webrtcClient.toggleScreenShare()
                .catch(err => console.error('Screen share error:', err));
        });
    }
    
    // Chat toggle
    const chatToggleBtn = document.getElementById('chat-toggle');
    const chatPanel = document.getElementById('chat-panel');
    if (chatToggleBtn && chatPanel) {
        chatToggleBtn.addEventListener('click', function() {
            chatPanel.classList.toggle('hidden');
            updateChatButtonBadge();
        });
    }
    
    // Close chat
    const closeChatBtn = document.getElementById('close-chat');
    if (closeChatBtn && chatPanel) {
        closeChatBtn.addEventListener('click', function() {
            chatPanel.classList.add('hidden');
            updateChatButtonBadge();
        });
    }
    
    // Leave call
    const leaveCallBtn = document.getElementById('leave-call');
    if (leaveCallBtn) {
        leaveCallBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to leave the call?')) {
                // Clean up and redirect
                if (window.webrtcClient) {
                    window.webrtcClient.disconnect();
                }
                window.location.href = '/';
            }
        });
    }
    
    // Handle Enter key in message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('message-form').dispatchEvent(new Event('submit'));
            }
        });
    }
}

function initializeCopyRoom(roomId) {
    const copyBtn = document.getElementById('copy-room-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    // Show temporary success indicator
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy room URL:', err);
                    alert('Failed to copy room URL. Please copy it manually.');
                });
        });
    }
}

function updateChatButtonBadge() {
    const chatPanel = document.getElementById('chat-panel');
    const badge = document.getElementById('unread-count');
    const chatToggleBtn = document.getElementById('chat-toggle');
    
    if (chatPanel && badge && chatToggleBtn) {
        if (!chatPanel.classList.contains('hidden')) {
            // Chat is open, hide the badge
            badge.classList.add('hidden');
        } else {
            // Chat is closed, show badge if there are new messages
            // For demo purposes, just show/hide based on whether chat is open
            badge.classList.remove('hidden');
        }
    }
}

// Handle browser back button
window.addEventListener('beforeunload', function(e) {
    if (window.webrtcClient) {
        window.webrtcClient.disconnect();
    }
});