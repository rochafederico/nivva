import { createIconButton } from '../shared/components/createIconButton.js';
import { trackEvent } from '../shared/observability/index.js';

export class TourButton extends HTMLElement {
  connectedCallback() {
    this.render();
    this._onTourClick = () => {
      trackEvent('shortcut_used', { flow: 'shortcut', status: 'completed', shortcut: 'tour', location: 'header' });
      window.dispatchEvent(new CustomEvent('tour:start'));
    };
    this.querySelector('#tour-btn').addEventListener('click', this._onTourClick);
  }

  disconnectedCallback() {
    this.querySelector('#tour-btn')?.removeEventListener('click', this._onTourClick);
  }

  render() {
    this.replaceChildren(createIconButton({
      id: 'tour-btn',
      icon: 'bi-question-circle',
      label: 'Abrir guía rápida',
      title: 'Abrir guía rápida',
    }));
  }
}

customElements.define('tour-button', TourButton);
