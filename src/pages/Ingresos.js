// src/pages/Ingresos.js
import '../layout/PageSectionLayout.js';
import '../features/ingresos/components/IngresoModal.js';
import '../features/ingresos/components/IngresoList.js';
import '../shared/components/AppButton.js';
import StatsIndicators from '../features/stats/components/StatsIndicators.js';

export default function Ingresos() {
    const container = document.createElement('div');
    container.className = 'd-flex flex-column gap-3';

    const ingresoModal = document.createElement('ingreso-modal');
    ingresoModal.id = 'ingresoModal';
    container.appendChild(ingresoModal);

    const layout = document.createElement('page-section-layout');

    // Toolbar: action button on the right
    const addBtn = document.createElement('app-button');
    addBtn.id = 'add-income';
    addBtn.setAttribute('variant', 'success');
    addBtn.textContent = 'Agregar ingreso';
    addBtn.addEventListener('click', () => {
        ingresoModal.openCreate();
        ingresoModal.attachOpener(addBtn);
    });

    layout.toolbarEnd = addBtn;

    // Content: indicadores + lista de ingresos
    const contentSlot = document.createElement('div');
    contentSlot.className = 'd-flex flex-column gap-3';

    contentSlot.appendChild(StatsIndicators());
    // Lista de ingresos del mes: se actualiza sola (mes, alta, importación)
    contentSlot.appendChild(document.createElement('ingreso-list'));

    layout.content = contentSlot;
    container.appendChild(layout);

    return container;
}
