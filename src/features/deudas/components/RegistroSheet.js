// Bottom sheet del botón +: primero qué agregar y, si es un egreso, de qué tipo.
import '../../../shared/components/UiModal.js';

const ingreso = 'bi-arrow-down-circle fs-3 text-success';
const egreso = 'bi-arrow-up-circle fs-3 text-danger';

const PASO_1 = ['¿Qué querés agregar?', [
    { valor: 'ingreso', icono: ingreso, titulo: 'Ingreso', detalle: 'Sueldo, cobros, reintegros' },
    { valor: 'egreso', icono: egreso, titulo: 'Egreso', detalle: 'Súper, tarjeta, préstamo, alquiler' },
]];

const PASO_2 = ['¿Qué tipo de egreso?', [
    { valor: 'gasto', icono: egreso, titulo: 'Gasto', detalle: 'Súper, transporte, salidas' },
    { valor: 'vencimiento', icono: 'bi-calendar-event fs-3 text-danger', titulo: 'Gasto con vencimiento', detalle: 'Tarjeta, préstamo, alquiler, servicio' },
]];

const opcionHtml = ({ valor, icono, titulo, detalle }) => `
    <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" data-registro="${valor}">
        <i class="bi ${icono}" aria-hidden="true"></i>
        <span><span class="d-block fw-semibold">${titulo}</span><small class="text-body-secondary">${detalle}</small></span>
    </button>`;

/** Crea el sheet dentro de `padre`. `alElegir` recibe 'ingreso', 'gasto' o 'vencimiento'. */
export function crearRegistroSheet(padre, alElegir) {
    const sheet = document.createElement('ui-modal');
    sheet.id = 'registro-sheet';
    padre.appendChild(sheet);
    sheet.querySelector('.modal-dialog')?.classList.add('modal-sheet');

    // Un grupo con el título por nombre: al entrar el foco, el lector anuncia la pregunta.
    const grupo = document.createElement('div');
    grupo.className = 'list-group list-group-flush registro-opciones';
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-labelledby', sheet.querySelector('.modal-title').id);
    sheet.appendChild(grupo);

    const pintar = ([titulo, opciones]) => {
        sheet.setTitle(titulo);
        grupo.innerHTML = opciones.map(opcionHtml).join('');
    };

    grupo.addEventListener('click', (e) => {
        const valor = e.target.closest('[data-registro]')?.dataset.registro;
        if (!valor) return;
        if (valor !== 'egreso') {
            alElegir(valor);
            return;
        }
        pintar(PASO_2);
        grupo.querySelector('button').focus();
    });

    sheet.abrir = (opener) => {
        pintar(PASO_1);
        sheet.returnFocusTo(opener);
        return sheet.open();
    };
    return sheet;
}
