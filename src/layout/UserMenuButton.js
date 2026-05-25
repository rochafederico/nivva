import { createNavbarPopover } from './navbarPopoversController.js';
import { openSettingsFrom } from './settingsShortcutAction.js';
import { createIconButton } from '../shared/components/createIconButton.js';
import { destroyPopover } from '../shared/ui/bootstrap/index.js';

export class UserMenuButton extends HTMLElement {
  connectedCallback() {
    this.render();
    const btn = this.querySelector('#user-menu-btn');
    this._popoverController = document.createElement('navbar-popover-controller');
    this._popoverController._button = btn;
    this._popoverController._getPopover = () => this._popover;
    this._popoverController._onShown = () => this._bindPopoverActions();
    this._popoverController._onHidden = () => this._unbindPopoverActions();
    this.appendChild(this._popoverController);
    this._updatePopover();
  }

  disconnectedCallback() {
    this._popoverController?.remove();
    this._popoverController = null;
    destroyPopover(this._popover);
    this._popover = null;
  }

  _bindPopoverActions() {
    const btn = this.querySelector('#user-menu-btn');
    const popoverId = btn?.getAttribute('aria-describedby');
    const popoverElement = popoverId ? document.getElementById(popoverId) : null;
    if (!popoverElement) return;
    this._popoverElement = popoverElement;
    this._onPopoverClick = (e) => {
      if (e.target.closest('[data-user-settings]')) {
        e.preventDefault();
        this._popover?.hide();
        openSettingsFrom(btn, { location: 'header' });
      }
    };
    this._popoverElement.addEventListener('click', this._onPopoverClick);
  }

  _unbindPopoverActions() {
    if (this._popoverElement && this._onPopoverClick) {
      this._popoverElement.removeEventListener('click', this._onPopoverClick);
    }
    this._popoverElement = null;
    this._onPopoverClick = null;
  }

  _updatePopover() {
    const btn = this.querySelector('#user-menu-btn');
    if (!btn) return;
    destroyPopover(this._popover);
    this._popover = createNavbarPopover(btn, {
      html: true,
      content: '<div class="list-group list-group-flush">' +
        '<button type="button" class="list-group-item list-group-item-action" data-user-settings><i class="bi bi-gear me-2" aria-hidden="true"></i>Configuración</button>' +
        '</div>',
      allowList: {
        button: ['type', 'class', 'data-user-settings'],
        i: ['class', 'aria-hidden'],
      },
    });
    if (!this._popover) return;
  }

  render() {
    this.replaceChildren(createIconButton({
      id: 'user-menu-btn',
      icon: 'bi-person-circle',
      label: 'Abrir menú de usuario',
    }));
  }
}

customElements.define('user-menu-button', UserMenuButton);
