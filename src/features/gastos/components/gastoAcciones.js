// Editar y eliminar desde el menú ⋮ de la fila, y a quién darle el foco después.
import { deleteGasto } from '../gastoRepository.js';
import { fechaHablada, montoHablado } from '../../montos/utils/montoHablado.js';

const EVENTOS = ['gasto:saved', 'gasto:updated', 'gasto:deleted'];
const botonDe = (lista, id) => lista.querySelector(`[data-gasto-id="${id}"] menu-button button`);

/** A quién pasar el foco si se elimina la fila: la siguiente con ⋮, la anterior o el botón +. */
function focoAlEliminar(lista, id) {
    const ids = [...lista.querySelectorAll('[data-gasto-id]')].map((fila) => Number(fila.dataset.gastoId));
    const i = ids.indexOf(id);
    return ids[i + 1] ?? ids[i - 1] ?? 'agregar';
}

function enfocarDespues(lista, foco) {
    const destino = foco === 'agregar' ? document.getElementById('add-fab') : botonDe(lista, foco);
    destino?.focus();
}

function editarGasto({ gasto, boton }) {
    document.getElementById('gastoModal')?.openEdit(gasto, boton);
}

async function eliminarGasto(lista, { gasto, boton }) {
    const texto = `¿Eliminar el gasto "${gasto.descripcion}" de ${montoHablado(gasto.monto, gasto.moneda)} del ${fechaHablada(gasto.fecha)}?`;
    if (!confirm(texto)) {
        boton.focus();
        return;
    }
    const foco = focoAlEliminar(lista, gasto.id);
    await deleteGasto(gasto.id);
    window.dispatchEvent(new CustomEvent('gasto:deleted', { detail: { id: gasto.id, foco } }));
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: 'Gasto eliminado.', type: 'success' } }));
}

/** Conecta una lista con su menú ⋮ y con los cambios de gastos. Devuelve cómo desconectarla. */
export function conectarGastos(lista) {
    // La fila se dibuja de nuevo: el foco se da recién después.
    const alCambiar = async (e) => {
        await lista.loadDebts();
        enfocarDespues(lista, e.detail?.foco);
    };
    EVENTOS.forEach((tipo) => window.addEventListener(tipo, alCambiar));
    lista.addEventListener('gasto:edit', (e) => editarGasto(e.detail));
    lista.addEventListener('gasto:delete', (e) => eliminarGasto(lista, e.detail));
    return () => EVENTOS.forEach((tipo) => window.removeEventListener(tipo, alCambiar));
}
