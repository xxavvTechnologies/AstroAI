class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);
    }

    createNotification(message, type, code) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const content = document.createElement('p');
        content.innerHTML = `${message} ${code ? `<span class="code">${code}</span>` : ''}`;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => notification.remove();
        
        notification.appendChild(content);
        notification.appendChild(closeBtn);
        
        this.container.appendChild(notification);
        notification.classList.add('show');
        
        setTimeout(() => notification.remove(), 5000);
    }

    success(message, code) {
        this.createNotification(message, 'success', code);
    }

    error(message, code) {
        this.createNotification(message, 'error', code);
    }

    warning(message, code) {
        this.createNotification(message, 'warning', code);
    }

    info(message, code) {
        this.createNotification(message, 'info', code);
    }
}

// Initialize notifications system only after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notifications = new NotificationSystem();
});
