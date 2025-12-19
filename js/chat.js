// Chat functionality for the video conferencing app
class ChatClient {
    constructor() {
        this.messages = [];
        this.unreadCount = 0;
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
        
        // Add sample messages for demo
        this.addMessage('System', 'Welcome to the meeting! Share the room ID with others to invite them.', 'system');
        this.addMessage('System', 'You joined the meeting.', 'system');
    }
    
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Add message to UI
        this.addMessage('You', message, 'sent');
        
        // Clear input
        messageInput.value = '';
        
        // In a real implementation, this would send the message via WebSocket
        // broadcastMessageToParticipants(message);
        
        // Simulate receiving a response after a delay
        this.simulateIncomingMessage();
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
    
    simulateIncomingMessage() {
        // Simulate receiving a message from another participant
        setTimeout(() => {
            const responses = [
                'Hello everyone!',
                'Can you hear me?',
                'That sounds great!',
                'I agree with that point.',
                'Let\'s move on to the next topic.',
                'Good idea!',
                'Thanks for sharing.',
                'I have a question about that.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage('Participant 2', randomResponse, 'received');
        }, 2000 + Math.random() * 3000);
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