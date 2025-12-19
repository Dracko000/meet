// Configuration settings for the video conferencing app
const CONFIG = {
    // STUN/TURN servers for WebRTC
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
        // Add TURN server if needed for NAT traversal
        // {
        //     urls: 'turn:your-turn-server.com:3478',
        //     username: 'username',
        //     credential: 'password'
        // }
    ],
    
    // Media constraints
    mediaConstraints: {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        },
        audio: true
    },
    
    // Socket server URL (update this to your signaling server)
    socketServerUrl: window.location.protocol + '//' + window.location.host + '/socket.io',
    
    // Application settings
    appSettings: {
        maxParticipants: 10,
        enableChat: true,
        enableScreenSharing: true,
        enableRecording: false
    }
};