// src/features/montos/components/MontosList.js
// Lista "Montos" del egreso (spec 001). Uso: <montos-list labelledby="id-del-nombre">, y
// lista.montos = [...]. Ordena en el mismo arreglo, del vencimiento más antiguo al más reciente.
// Avisa 'montos:edit' con detail { monto, idx } cuando se toca "Editar" en una fila, y
// 'montos:duplicated' y 'montos:empty' desde las acciones (montosListaAcciones.js).
import { crearFilaMonto } from './MontoRow.js';
import { conectarAcciones } from './montosListaAcciones.js';

let contador = 0;

export class MontosList extends HTMLElement {
    constructor() {
        super();
        this._montos = [];
    }

    connectedCallback() {
        this.classList.add('d-block');
        if (!this._estructura) this._crearEstructura();
        this.render();
    }

    get montos() { return this._montos; }
    set montos(valor) {
        this._montos = Array.isArray(valor) ? valor : [];
        if (this._estructura) this.render();
    }

    get lista() { return this._estructura?.lista; }

    _crearEstructura() {
        const id = `montos-orden-${++contador}`;
        const orden = document.createElement('p');
        orden.id = id;
        orden.className = 'small text-body-secondary mb-2';
        orden.textContent = 'Del vencimiento más antiguo al más reciente.';
        const lista = document.createElement('ul');
        lista.className = 'list-unstyled mb-0';
        lista.setAttribute('role', 'list');
        lista.setAttribute('aria-describedby', id);
        if (this.hasAttribute('labelledby')) lista.setAttribute('aria-labelledby', this.getAttribute('labelledby'));
        const vacio = document.createElement('p');
        vacio.className = 'mb-0';
        vacio.dataset.montosVacio = '';
        vacio.textContent = 'Todavía no agregaste montos. Agregá el primero.';
        const estado = document.createElement('div');
        estado.className = 'visually-hidden';
        estado.setAttribute('role', 'status');
        this.replaceChildren(orden, lista, vacio, estado);
        this._estructura = { orden, lista, vacio, estado };
        conectarAcciones(this);
        lista.addEventListener('monto:edit', (e) => {
            e.stopPropagation();
            const { monto } = e.detail;
            this.dispatchEvent(new CustomEvent('montos:edit', {
                detail: { monto, idx: this._montos.indexOf(monto) }, bubbles: true
            }));
        });
    }

    render() {
        const { orden, lista, vacio } = this._estructura;
        this._montos.sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento)));
        lista.replaceChildren(...this._montos.map((monto, i) => crearFilaMonto(monto, i + 1)));
        const hayMontos = this._montos.length > 0;
        orden.hidden = !hayMontos;
        lista.hidden = !hayMontos;
        vacio.hidden = hayMontos;
    }
}

customElements.define('montos-list', MontosList);
