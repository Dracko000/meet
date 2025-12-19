// Chat functionality for the video conferencing app
class ChatClient {
    constructor(roomId) {
        this.messages = [];
        this.unreadCount = 0;
        this.roomId = roomId;
        this.clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.initializeChat();
    }

    initializeChat() {
        const messageForm = document.getElementById('message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Load previous messages from server
        this.loadPreviousMessages();

        // Add initial system messages
        this.addMessage('System', 'Welcome to the meeting! Share the room ID with others to invite them.', 'system');
        this.addMessage('System', 'You joined the meeting.', 'system');
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        try {
            // Send message to server
            const response = await fetch('/signaling.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'message',
                    roomId: this.roomId,
                    senderId: this.clientId,
                    message: message
                })
            });

            const result = await response.json();

            if (result.type === 'message_saved') {
                // Add message to UI
                this.addMessage('You', message, 'sent');

                // Clear input
                messageInput.value = '';
            } else {
                console.error('Failed to send message:', result);
                this.showError('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message');
        }
    }

    async loadPreviousMessages() {
        try {
            const response = await fetch('/signaling.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'get-messages',
                    roomId: this.roomId
                })
            });

            const result = await response.json();

            if (result.type === 'messages' && result.messages) {
                result.messages.forEach(msg => {
                    // Format: "HH:MM" from the timestamp
                    const time = new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    this.addMessage(`${msg.sender_id} (${time})`, msg.message, 'received');
                });
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            // Continue without previous messages
        }
    }

    addMessage(sender, content, type = 'received') {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        // For system messages, we format differently
        if (type === 'system') {
            const contentSpan = document.createElement('span');
            contentSpan.textContent = content;
            messageDiv.appendChild(contentSpan);
        } else {
            const senderSpan = document.createElement('strong');
            senderSpan.textContent = sender + ': ';

            const contentSpan = document.createElement('span');
            contentSpan.textContent = content;

            messageDiv.appendChild(senderSpan);
            messageDiv.appendChild(contentSpan);
        }

        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Update unread count if chat panel is hidden
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel && chatPanel.classList.contains('hidden') && type === 'received') {
            this.unreadCount++;
            this.updateUnreadCount();
        }
    }

    showError(message) {
        // Show error message in the UI
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.position = 'fixed';
        errorMsg.style.top = '60px';
        errorMsg.style.left = '50%';
        errorMsg.style.transform = 'translateX(-50%)';
        errorMsg.style.backgroundColor = '#ea4335';
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '10px 20px';
        errorMsg.style.borderRadius = '4px';
        errorMsg.style.zIndex = '1000';
        errorMsg.textContent = message;

        document.body.appendChild(errorMsg);

        setTimeout(() => {
            errorMsg.remove();
        }, 5000);
    }

    updateUnreadCount() {
        const badge = document.getElementById('unread-count');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount.toString();
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    markAsRead() {
        this.unreadCount = 0;
        this.updateUnreadCount();
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const chatClient = new ChatClient();
    window.chatClient = chatClient; // For debugging
    
    // Add event listener to show/hide chat panel
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
        chatPanel.addEventListener('transitionend', function() {
            if (!chatPanel.classList.contains('hidden')) {
                chatClient.markAsRead();
            }
        });
    }
});

// Export ChatClient for use in other modules
window.ChatClient = ChatClient;