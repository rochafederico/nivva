import './DarkToggle.js';
import './NotificationsButton.js';
import './TourButton.js';
import './UserMenuButton.js';
import '../shared/components/AppToast.js';

export class AppHeader extends HTMLElement {
  connectedCallback() {
    this.classList.add('d-block');
    this.render();
    this._onBrandClick = (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    this._onDataImported = () => window.dispatchEvent(new CustomEvent('ui:refresh'));
    this.querySelector('.navbar-brand').addEventListener('click', this._onBrandClick);
    window.addEventListener('data-imported', this._onDataImported);
  }

  disconnectedCallback() {
    this.querySelector('.navbar-brand')?.removeEventListener('click', this._onBrandClick);
    window.removeEventListener('data-imported', this._onDataImported);
  }

  render() {
    this.innerHTML = `
      <app-toast></app-toast>
      <nav class="navbar navbar-dark bg-primary px-3 shadow-sm">
        <div class="container-fluid">
          <a class="navbar-brand fw-bold" href="/" aria-label="Inicio" data-tour-step="bienvenida">Nivva</a>
          <div class="ms-auto d-flex align-items-center gap-2">
            <notifications-button></notifications-button>
            <tour-button></tour-button>
            <user-menu-button></user-menu-button>
          </div>
        </div>
      </nav>
    `;
  }
}
customElements.define('app-header', AppHeader);

export default function AppHeaderComponent() {
  return document.createElement('app-header');
}
