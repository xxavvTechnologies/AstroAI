export class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);
        this.queue = [];
        this.maxVisible = 3;
        this.isProcessing = false;
    }

    async createNotification(message, type, code = null) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Icon mapping for different notification types
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        // Status text mapping
        const statusText = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                ${icons[type]}
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="status">${statusText[type]}</span>
                    ${code ? `<span class="code">${code}</span>` : ''}
                </div>
                <p class="message">${message}</p>
            </div>
            <button class="close-btn" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
            <div class="progress-bar"></div>
        `;

        // Add to queue
        this.queue.push(notification);
        this.processQueue();
        
        // Auto-dismiss after delay (varies by type)
        const delays = {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000
        };

        return new Promise(resolve => {
            setTimeout(() => {
                this.dismissNotification(notification);
                resolve();
            }, delays[type]);
        });
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const visibleNotifications = this.container.children.length;
            if (visibleNotifications >= this.maxVisible) {
                this.isProcessing = false;
                return;
            }

            const notification = this.queue.shift();
            this.container.appendChild(notification);
            
            // Setup event listeners
            notification.querySelector('.close-btn').addEventListener('click', 
                () => this.dismissNotification(notification));

            // Animate in
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    notification.classList.add('show');
                    resolve();
                });
            });
        }

        this.isProcessing = false;
    }

    dismissNotification(notification) {
        notification.classList.add('dismiss');
        notification.addEventListener('animationend', () => {
            notification.remove();
            this.processQueue();
        });
    }

    success(message, code) {
        return this.createNotification(message, 'success', code);
    }

    error(message, code) {
        return this.createNotification(message, 'error', code);
    }

    warning(message, code) {
        return this.createNotification(message, 'warning', code);
    }

    info(message, code) {
        return this.createNotification(message, 'info', code);
    }
}

// Initialize notifications system globally
window.notifications = new NotificationSystem();
