class NotificationSystem {
    constructor() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(this.container);
    }
  
    show(message, type = 'success', duration = 3000) {
      const id = `toast-${Date.now()}`;
      const toast = document.createElement('div');
      toast.className = `toast align-items-center border-0 show`;
      toast.role = 'alert';
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');
      toast.id = id;
  

      let bgColor;
      switch(type) {
        case 'success': bgColor = 'bg-success text-white'; break;
        case 'error': bgColor = 'bg-danger text-white'; break;
        case 'warning': bgColor = 'bg-warning'; break;
        case 'info': bgColor = 'bg-info text-white'; break;
        default: bgColor = 'bg-secondary text-white';
      }
  
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body ${bgColor}">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `;
  
      this.container.appendChild(toast);
  

      setTimeout(() => {
        toast.remove();
      }, duration);
  

      toast.querySelector('.btn-close').addEventListener('click', () => {
        toast.remove();
      });
    }
  
    success(message, duration) {
      this.show(message, 'success', duration);
    }
  
    error(message, duration) {
      this.show(message, 'error', duration);
    }
  
    warning(message, duration) {
      this.show(message, 'warning', duration);
    }
  
    info(message, duration) {
      this.show(message, 'info', duration);
    }
  }
  

  const notifications = new NotificationSystem();
  window.notifications = notifications;