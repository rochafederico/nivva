// Spec 003, criterios 15, 16 y 20: copia de seguridad, importación y borrado de todo.
import { assert } from './setup.js';
import '../src/features/import-export/components/ExportDataModal.js';
import '../src/features/import-export/components/ImportDataModal.js';
import { deleteAllData } from '../src/layout/dataActions.js';
import { addDeuda, deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import { addGasto, deleteAllGastos, getAll as getGastos } from '../src/features/gastos/gastoRepository.js';

const SUPER = { descripcion: 'Súper', monto: 5000, moneda: 'USD', fecha: '2026-11-03' };
const EGRESO = { acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '', montos: [] };

async function exportar() {
    const crearUrl = URL.createObjectURL;
    const clickAncla = window.HTMLAnchorElement.prototype.click;
    let archivo;
    URL.createObjectURL = (blob) => { archivo = blob; return 'blob:copia'; };
    window.HTMLAnchorElement.prototype.click = () => {};
    const modal = document.createElement('export-data-modal');
    document.body.appendChild(modal);
    await modal.open(document.body);
    URL.createObjectURL = crearUrl;
    window.HTMLAnchorElement.prototype.click = clickAncla;
    return JSON.parse(await archivo.text());
}

function modalImportar() {
    const modal = document.createElement('import-data-modal');
    document.body.appendChild(modal);
    return modal;
}

async function importar(datos) {
    const modal = modalImportar();
    modal.importData = datos;
    await modal.importDataToDb();
    modal.remove();
}

async function criterio15() {
    console.log('  Criterio 15: los gastos vuelven con todos sus datos');
    await Promise.all([deleteDeudas(), deleteAllGastos()]);
    await addGasto(SUPER);
    const copia = await exportar();
    assert(copia.gastos.length === 1, 'la copia incluye los gastos');
    await deleteAllGastos();
    await importar(copia);
    const [gasto] = await getGastos();
    assert(gasto?.descripcion === 'Súper' && gasto.monto === 5000 && gasto.moneda === 'USD', 'vuelve con sus datos');
    assert(gasto?.fecha === '2026-11-03' && gasto.periodo === '2026-11', 'vuelve con su fecha');

    const modal = modalImportar();
    await modal.handleFileSelect({ target: { files: [{ text: async () => JSON.stringify(copia) }] } });
    assert(modal.querySelector('.file-content').textContent.includes('1 egresos'), 'la vista previa lo suma a egresos');
    modal.remove();
}

async function copiaAnterior() {
    console.log('  Criterios 15 y 20: una copia sin gastos se importa sin error');
    await Promise.all([deleteDeudas(), deleteAllGastos()]);
    await importar({ deudas: [EGRESO], ingresos: [] });
    const deudas = await listDeudas();
    assert(deudas.length === 1 && deudas[0].acreedor === 'Banco', 'el egreso vuelve como siempre');
    assert((await getGastos()).length === 0, 'no aparecen gastos');
}

async function criterio16() {
    console.log('  Criterio 16: eliminar todos los datos borra los gastos');
    await Promise.all([deleteDeudas(), deleteAllGastos()]);
    await addGasto(SUPER);
    await addDeuda(EGRESO);
    const original = window.setTimeout;
    const confirmar = globalThis.confirm;
    let pregunta;
    globalThis.confirm = (texto) => { pregunta = texto; return true; };
    window.setTimeout = (fn, ms) => (ms === 700 ? 0 : original(fn, ms)); // sin recargar la página
    await deleteAllData();
    window.setTimeout = original;
    globalThis.confirm = confirmar;
    assert((await getGastos()).length === 0 && (await listDeudas()).length === 0, 'se borra todo');
    assert(pregunta === 'Vas a eliminar todos tus egresos e ingresos. Esta acción no se puede deshacer. ¿Continuás?', 'la confirmación no cambia');
}

export const tests = [criterio15, copiaAnterior, criterio16];
