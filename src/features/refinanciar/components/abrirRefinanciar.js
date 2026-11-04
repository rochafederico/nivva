// La ventana se crea la primera vez que hace falta, en cualquier pantalla.
import './RefinanciarModal.js';

let ventana = null;

export function abrirRefinanciar(deuda, opener) {
    if (!ventana?.isConnected) {
        ventana = document.createElement('refinanciar-modal');
        document.body.appendChild(ventana);
    }
    return ventana.abrir(deuda, opener);
}
