// src/shared/components/menuButtonTeclas.js
// Teclado del botón de menú (patrón Menu Button del W3C). Recibe el <menu-button> y el evento.

/**
 * Sobre el botón: flecha abajo abre en la primera opción y flecha arriba en la última.
 * Enter y Espacio no se manejan acá: los resuelve el clic nativo del botón.
 */
export function teclaEnBoton(e, menu) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        menu.open(e.key === 'ArrowDown' ? 0 : -1);
    }
}

/**
 * Dentro del menú: flechas con vuelta en las puntas, Inicio, Fin, Enter, Espacio, Escape y Tab.
 */
export function teclaEnMenu(e, menu) {
    const items = menu.items;
    const actual = items.indexOf(e.target.closest('[role="menuitem"]'));
    const destino = {
        ArrowDown: (actual + 1) % items.length,
        ArrowUp: (actual - 1 + items.length) % items.length,
        Home: 0,
        End: items.length - 1
    }[e.key];
    if (destino !== undefined) {
        e.preventDefault();
        items[destino]?.focus();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        menu.close({ focusButton: true });
    } else if (e.key === 'Tab') {
        menu.close();
    } else if ((e.key === 'Enter' || e.key === ' ') && actual >= 0) {
        e.preventDefault();
        menu.select(items[actual].dataset.value);
    }
}
