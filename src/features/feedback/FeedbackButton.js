// src/features/feedback/FeedbackButton.js
// Botón del header que abre el modal de feedback (antes era un botón flotante;
// se movió arriba para dejar libre la esquina inferior derecha al botón "+").

import './FeedbackModal.js';
import { createIconButton } from '../../shared/components/createIconButton.js';

export class FeedbackButton extends HTMLElement {
    connectedCallback() {
        if (!this._rendered) this.render();
        this._btn = this.querySelector('#feedback-btn');
        this._modal = this.querySelector('feedback-modal');
        this._onClick = () => this._modal?.open(this._btn);
        this._btn?.addEventListener('click', this._onClick);
    }

    disconnectedCallback() {
        this._btn?.removeEventListener('click', this._onClick);
    }

    render() {
        this._rendered = true;
        const button = createIconButton({
            id: 'feedback-btn',
            icon: 'bi-chat-dots',
            label: 'Enviar feedback',
            title: 'Enviar feedback',
        });
        this.replaceChildren(button, document.createElement('feedback-modal'));
    }
}

customElements.define('feedback-button', FeedbackButton);
