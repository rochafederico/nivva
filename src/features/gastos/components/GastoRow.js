// Fila de un gasto: sin interruptor de pagado y con menú ⋮. Avisa con 'gasto:edit' y 'gasto:delete'.
import { createListRow } from '../../../shared/components/ListRow.js';
import '../../../shared/components/MenuButton.js';
import { formatMoneda } from '../../../shared/config/monedas.js';
import { formatFecha } from '../../../shared/utils/fechas.js';
import { fechaHablada, montoHablado } from '../../montos/utils/montoHablado.js';

function dobleTexto(tag, className, visible, hablado) {
    const contenedor = document.createElement(tag);
    contenedor.className = className;
    contenedor.innerHTML = '<span aria-hidden="true"></span><span class="visually-hidden"></span>';
    contenedor.children[0].textContent = visible;
    contenedor.children[1].textContent = hablado;
    return contenedor;
}

export function createGastoRow(gasto) {
    const cifra = montoHablado(gasto.monto, gasto.moneda);
    const menu = document.createElement('menu-button');
    menu.label = '⋮';
    menu.accessibleName = `Acciones del gasto ${gasto.descripcion}, ${cifra}`;
    menu.options = [{ value: 'edit', text: 'Editar' }, { value: 'delete', text: 'Eliminar' }];
    menu.render();
    menu.button.style.cssText = 'scroll-margin-block: 5rem;';
    menu.addEventListener('menu:select', (e) => {
        e.stopPropagation();
        menu.dispatchEvent(new CustomEvent(`gasto:${e.detail.value}`, { detail: { gasto, boton: menu.button }, bubbles: true }));
    });

    const fila = createListRow({
        avatar: { icon: 'bi-bag', className: 'bg-danger-subtle text-danger-emphasis' },
        title: gasto.descripcion,
        detail: dobleTexto('small', 'd-block text-muted', `Gasto · ${formatFecha(gasto.fecha)}`, `Gasto, ${fechaHablada(gasto.fecha)}`),
        status: dobleTexto('span', 'fw-normal lh-sm text-nowrap', formatMoneda(gasto.monto, gasto.moneda), cifra),
        controls: [menu],
    });
    fila.dataset.gastoId = gasto.id;
    fila.querySelector('h6').classList.add('gasto-descripcion');
    return fila;
}
