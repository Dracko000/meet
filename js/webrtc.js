// WebRTC implementation for video conferencing
class WebRTCClient {
    constructor(roomId) {
        this.roomId = roomId;
        this.localStream = null;
        this.remoteStreams = new Map();
        this.peerConnections = new Map();
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        
        // Initialize the client
        this.init();
    }
    
    async init() {
        try {
            // Get access to local camera and microphone
            await this.startLocalStream();

            // Create peer connections for each participant
            this.setupPeerConnectionHandler();

            // Simulate participants joining for demonstration
            this.simulateParticipants();

        } catch (error) {
            console.error('Failed to initialize WebRTC:', error);
            this.showError('Could not access camera/microphone. Please check permissions.');
        }
    }
    
    async startLocalStream() {
        try {
            // Request access to camera and microphone
            this.localStream = await navigator.mediaDevices.getUserMedia(CONFIG.mediaConstraints);
            
            // Display local video
            const localVideo = document.getElementById('local-video');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
            
            // Update UI based on media status
            this.updateMediaStatus();
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }
    
    setupPeerConnectionHandler() {
        // In a production environment, you would connect to a WebSocket signaling server
        // For this implementation, we'll create a simulated signaling mechanism
        this.setupSimulatedSignaling();
    }

    setupSimulatedSignaling() {
        // Setup connection to the signaling server
        console.log(`Joined room: ${this.roomId}`);

        // Initialize this client with a random ID
        this.clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Join the room
        this.joinRoom();
    }

    async joinRoom() {
        try {
            const response = await fetch('/signaling.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'join',
                    roomId: this.roomId,
                    senderId: this.clientId
                })
            });

            const data = await response.json();
            console.log('Joined room:', data);

            if (data.type === 'joined') {
                // Update connection status
                const statusIndicator = document.getElementById('connection-status');
                if (statusIndicator) {
                    statusIndicator.className = 'connection-status connected';
                    statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Connected';
                }

                // For demo purposes, simulate other participants after a delay
                setTimeout(() => {
                    this.simulateRemoteParticipants();
                }, 2000);
            }
        } catch (error) {
            console.error('Error joining room:', error);
            this.showError('Could not connect to signaling server');
        }
    }

    async sendSignal(signalData) {
        // Add room and client info to the signal
        const payload = {
            ...signalData,
            roomId: this.roomId,
            senderId: this.clientId
        };

        try {
            const response = await fetch('/signaling.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Signal sent:', result);

            return result;
        } catch (error) {
            console.error('Error sending signal:', error);
        }
    }

    async handleOffer(peerId, offer) {
        // Create a new peer connection for this peer
        const pc = this.createPeerConnection(peerId);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Create an answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer back to the peer (in a real app, this goes through signaling server)
            this.sendSignal({
                type: 'answer',
                to: peerId,
                sdp: pc.localDescription
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(peerId, answer) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        }
    }

    async handleCandidate(peerId, candidate) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error handling candidate:', error);
            }
        }
    }

    createPeerConnection(peerId) {
        const pc = new RTCPeerConnection(CONFIG.iceServers);

        // Add local stream tracks to this connection
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            this.addRemoteStream(event.streams[0], peerId);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // Send candidate to remote peer (in a real app, via signaling server)
                this.sendSignal({
                    type: 'candidate',
                    to: peerId,
                    candidate: event.candidate
                });
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log(`Peer connection state for ${peerId}:`, pc.connectionState);

            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                this.removePeerConnection(peerId);
            }
        };

        // Store the peer connection
        this.peerConnections.set(peerId, pc);

        return pc;
    }

    addRemoteStream(stream, peerId) {
        // Check if we already have a video element for this peer
        let videoElement = document.getElementById(`remote-video-${peerId}`);

        if (!videoElement) {
            // Create a new video container for this remote stream
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container active';
            videoContainer.id = `remote-${peerId}`;

            videoElement = document.createElement('video');
            videoElement.id = `remote-video-${peerId}`;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.muted = false;

            // Create overlay for participant info
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';

            const nameLabel = document.createElement('span');
            nameLabel.className = 'participant-name';
            nameLabel.textContent = `Participant ${this.remoteStreams.size + 1}`;

            const statusDiv = document.createElement('div');
            statusDiv.className = 'video-status';

            const micIcon = document.createElement('i');
            micIcon.className = 'fas fa-microphone';
            micIcon.id = `mic-status-${peerId}`;

            const videoIcon = document.createElement('i');
            videoIcon.className = 'fas fa-video';
            videoIcon.id = `video-status-${peerId}`;

            statusDiv.appendChild(micIcon);
            statusDiv.appendChild(videoIcon);

            overlay.appendChild(nameLabel);
            overlay.appendChild(statusDiv);

            videoContainer.appendChild(videoElement);
            videoContainer.appendChild(overlay);

            // Add to remote videos container
            const container = document.getElementById('remote-videos-container');
            if (container) {
                container.appendChild(videoContainer);
            }
        }

        // Set the stream to the video element
        videoElement.srcObject = stream;

        // Add to remote streams map
        this.remoteStreams.set(peerId, { stream, element: videoElement });
    }

    async createAndSendOffer(peerId) {
        const pc = this.createPeerConnection(peerId);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer to the peer (in a real app, via signaling server)
            this.sendSignal({
                type: 'offer',
                to: peerId,
                sdp: pc.localDescription
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }


    generateRandomPeerId() {
        return 'peer_' + Math.random().toString(36).substr(2, 9);
    }

    removePeerConnection(peerId) {
        const pc = this.peerConnections.get(peerId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(peerId);
        }

        // Remove remote stream UI if it exists
        const videoContainer = document.getElementById(`remote-${peerId}`);
        if (videoContainer) {
            videoContainer.remove();
        }

        this.remoteStreams.delete(peerId);
    }

    // Simulate other participants joining for demonstration
    simulateRemoteParticipants() {
        setTimeout(() => {
            this.createAndSendOffer('simulated_peer_2');
        }, 2000);

        setTimeout(() => {
            this.createAndSendOffer('simulated_peer_3');
        }, 4000);
    }
    
    
    toggleAudio() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                this.isAudioEnabled = !this.isAudioEnabled;
                audioTracks.forEach(track => {
                    track.enabled = this.isAudioEnabled;
                });
                
                // Update UI
                const micIcon = document.getElementById('mic-status');
                const toggleBtn = document.getElementById('toggle-audio');
                
                if (micIcon && toggleBtn) {
                    if (this.isAudioEnabled) {
                        micIcon.className = 'fas fa-microphone';
                        toggleBtn.className = 'control-btn active';
                    } else {
                        micIcon.className = 'fas fa-microphone-slash';
                        toggleBtn.className = 'control-btn';
                    }
                }
            }
        }
    }
    
    toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                this.isVideoEnabled = !this.isVideoEnabled;
                videoTracks.forEach(track => {
                    track.enabled = this.isVideoEnabled;
                });
                
                // Update UI
                const videoIcon = document.getElementById('video-status');
                const toggleBtn = document.getElementById('toggle-video');
                
                if (videoIcon && toggleBtn) {
                    if (this.isVideoEnabled) {
                        videoIcon.className = 'fas fa-video';
                        toggleBtn.className = 'control-btn active';
                    } else {
                        videoIcon.className = 'fas fa-video-slash';
                        toggleBtn.className = 'control-btn';
                    }
                }
                
                // Hide/show the video element
                const localVideo = document.getElementById('local-video');
                if (localVideo) {
                    localVideo.style.visibility = this.isVideoEnabled ? 'visible' : 'hidden';
                }
            }
        }
    }
    
    async toggleScreenShare() {
        if (!CONFIG.appSettings.enableScreenSharing) return;
        
        try {
            // Check if screen sharing is currently active
            if (this.localStream?.getVideoTracks()[0]?.label.includes('Screen')) {
                // Stop screen sharing and go back to camera
                await this.startLocalStream();
            } else {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false // Chrome doesn't support audio in getDisplayMedia yet
                });
                
                // Replace video track in local stream
                const videoTrack = screenStream.getVideoTracks()[0];
                const oldTrack = this.localStream.getVideoTracks()[0];
                
                // Replace the track in all peer connections
                this.peerConnections.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });
                
                // Replace the track in the local stream
                oldTrack.stop();
                this.localStream.removeTrack(oldTrack);
                this.localStream.addTrack(videoTrack);
                
                // Listen for when the user stops sharing
                videoTrack.onended = () => {
                    this.startLocalStream(); // Switch back to camera
                };
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
            this.showError('Failed to share screen. Please try again.');
        }
    }
    
    updateMediaStatus() {
        // Update UI based on current media status
        const micIcon = document.getElementById('mic-status');
        const videoIcon = document.getElementById('video-status');
        
        if (micIcon && this.isAudioEnabled) {
            micIcon.className = 'fas fa-microphone';
        } else if (micIcon) {
            micIcon.className = 'fas fa-microphone-slash';
        }
        
        if (videoIcon && this.isVideoEnabled) {
            videoIcon.className = 'fas fa-video';
        } else if (videoIcon) {
            videoIcon.className = 'fas fa-video-slash';
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
    
    disconnect() {
        // Clean up resources
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        this.peerConnections.forEach(pc => {
            pc.close();
        });
        
        this.peerConnections.clear();
        this.remoteStreams.clear();
    }
}

// Export the WebRTC client
window.WebRTCClient = WebRTCClient;