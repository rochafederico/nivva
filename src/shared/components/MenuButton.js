// src/shared/components/MenuButton.js
// Botón de menú (patrón Menu Button del W3C): un botón que abre una lista de opciones.
// Uso: el.label = 'Más acciones'; el.accessibleName = '…'; el.options = [{ value, text }].
// Emite 'menu:select' con detail.value al elegir una opción.
// Enter y Espacio sobre el botón lo activan como un clic nativo: abren con foco en la primera opción.
import { teclaEnBoton, teclaEnMenu } from './menuButtonTeclas.js';

let menuAbierto = null;
let contador = 0;

function crear(tag, className, attrs = {}) {
    const el = document.createElement(tag);
    el.className = className;
    Object.entries(attrs).forEach(([nombre, valor]) => el.setAttribute(nombre, valor));
    return el;
}

export class MenuButton extends HTMLElement {
    constructor() {
        super();
        this.label = '';
        this.accessibleName = '';
        this.options = [];
        this._onDocumentClick = (e) => { if (!this.contains(e.target)) this.close(); };
    }

    connectedCallback() {
        this.classList.add('d-inline-block', 'position-relative');
        if (!this._rendered) this.render();
    }

    disconnectedCallback() { this.close(); }

    get button() { return this.querySelector('button'); }
    get menu() { return this.querySelector('[role="menu"]'); }
    get items() { return [...this.querySelectorAll('[role="menuitem"]')]; }
    get isOpen() { return this.button?.getAttribute('aria-expanded') === 'true'; }

    render() {
        this._rendered = true;
        const id = `menu-button-${++contador}`;
        const button = crear('button', 'btn btn-outline-secondary btn-sm', {
            type: 'button', 'aria-label': this.accessibleName || this.label,
            'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': id
        });
        button.textContent = this.label;
        button.addEventListener('click', () => (this.isOpen ? this.close() : this.open(0)));
        button.addEventListener('keydown', (e) => teclaEnBoton(e, this));
        const menu = crear('ul', 'dropdown-menu dropdown-menu-end', { id, role: 'menu', 'aria-label': this.label });
        this.options.forEach(({ value, text }) => {
            const item = crear('li', 'dropdown-item', { role: 'menuitem', tabindex: '-1', 'data-value': value });
            item.textContent = text;
            item.addEventListener('click', () => this.select(value));
            menu.appendChild(item);
        });
        menu.addEventListener('keydown', (e) => teclaEnMenu(e, this));
        this.replaceChildren(button, menu);
    }

    open(index = 0) {
        if (menuAbierto && menuAbierto !== this) menuAbierto.close();
        menuAbierto = this;
        this.button.setAttribute('aria-expanded', 'true');
        this.menu.classList.add('show');
        document.addEventListener('click', this._onDocumentClick);
        const items = this.items;
        items[(index + items.length) % items.length]?.focus();
    }

    close({ focusButton = false } = {}) {
        if (!this.isOpen) return;
        if (menuAbierto === this) menuAbierto = null;
        this.button.setAttribute('aria-expanded', 'false');
        this.menu.classList.remove('show');
        document.removeEventListener('click', this._onDocumentClick);
        if (focusButton) this.button.focus();
    }

    select(value) {
        this.close({ focusButton: true });
        this.dispatchEvent(new CustomEvent('menu:select', { detail: { value }, bubbles: true }));
    }
}

customElements.define('menu-button', MenuButton);
