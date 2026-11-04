import { createToast } from '../ui/bootstrap/index.js';

export class AppToast extends HTMLElement {
    connectedCallback() {
        this._container = document.createElement('div');
        this._container.className = 'toast-container position-fixed top-0 end-0 p-3';
        this._container.style.zIndex = '11000';
        document.body.appendChild(this._container);
        this._region = Object.assign(document.createElement('div'), { className: 'visually-hidden' });
        this._region.setAttribute('role', 'status');
        this._region.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this._region);

        this._handler = (e) => this.#show(e.detail);
        window.addEventListener('app:notify', this._handler);
    }

    disconnectedCallback() {
        window.removeEventListener('app:notify', this._handler);
        this._container?.remove();
        this._region?.remove();
    }

    #show({ message, type = 'success' }) {
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-bg-${type} border-0`;
        if (type === 'danger') {
            toastEl.setAttribute('role', 'alert');
        } else {
            this._region.textContent = message;
        }
        toastEl.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="toast-body flex-grow-1">${message}</div>
                <button type="button" class="btn-close btn-close-white mt-2 me-2 flex-shrink-0" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>
        `;
        this._container.appendChild(toastEl);
        createToast(toastEl, { delay: 5000 })?.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
}

customElements.define('app-toast', AppToast);
