// PWA functionality
class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.isPWAInstalled = this.checkPWAInstallation();
        this.init();
    }
    
    init() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button or notification
            this.showInstallButton();
        });
        
        // Listen for when the app is installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isPWAInstalled = true;
        });
        
        // Register service worker
        this.registerServiceWorker();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }
    
    checkPWAInstallation() {
        // Check if the app is running as a PWA
        return (window.matchMedia('(display-mode: standalone)').matches || 
                navigator.standalone === true);
    }
    
    showInstallButton() {
        // Check if installation is already handled
        if (this.isPWAInstalled) return;
        
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.className = 'control-btn';
            installBtn.title = 'Install Convertation as an app';
            
            installBtn.style.position = 'absolute';
            installBtn.style.top = '15px';
            installBtn.style.left = '20px';
            installBtn.style.zIndex = '100';
            
            document.body.appendChild(installBtn);
        }
        
        installBtn.onclick = () => {
            this.promptInstall();
        };
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        
        // Optionally, send analytics event with outcome of user choice
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        this.deferredPrompt = null;
    }
}

// Initialize PWA handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize PWA features if not already in standalone mode
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        new PWAHandler();
    }
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            }
        });
    }
});

// Export PWAHandler for debugging
window.PWAHandler = PWAHandler;