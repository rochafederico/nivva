// Fila abierta de la lista "Montos" (spec 002): grupo con nombre y monto-form dentro del li.
import './MontoForm.js';

// Sin monto, la fila es de un monto nuevo.
export function crearMontoAbierto(monto) {
    const fila = document.createElement('li');
    fila.className = 'border rounded p-2 mb-2';
    const grupo = document.createElement('div');
    grupo.setAttribute('role', 'group');
    const form = document.createElement('monto-form');
    form.setAttribute('inline', '');
    form.setAttribute('compact-errors', '');
    form.monto = monto ? { ...monto } : {};
    grupo.appendChild(form);
    fila.appendChild(grupo);
    // Escape lo decide la fila: la ventana del egreso no lo recibe.
    fila.addEventListener('keydown', (e) => { if (e.key === 'Escape') e.stopPropagation(); });
    return fila;
}

// Nombre según la posición (un número o 'nuevo'), sin redibujar: no se pierde lo escrito.
export function numerarMontoAbierto(fila, numero) {
    fila.querySelector('[role="group"]').setAttribute('aria-label', `Monto ${numero}`);
    fila.querySelector('monto-form').numero = numero;
}

// Con la fila ya en la lista: que el foco no quede debajo del encabezado ni del pie.
export function protegerFocoDelMontoAbierto(fila) {
    fila.querySelectorAll('input, select, button').forEach((control) => {
        control.style.cssText = 'scroll-margin-block: 5rem;';
    });
}
