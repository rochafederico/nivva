// Spec 004, criterios 3 y 4: campos de la ventana y elección de moneda.
import { assert, waitFor } from './setup.js';
import { abrirRefinanciar } from '../src/features/refinanciar/components/abrirRefinanciar.js';

const m = (monto, moneda = 'ARS') => ({ monto, moneda, vencimiento: '2026-11-10', pagado: false });
const deuda = (montos) => ({ id: 1, acreedor: 'Banco Galicia', montos });

async function criterio3() {
    console.log('  Criterio 3: pide cuotas, vencimiento y adelanto, con foco en el primero');
    const opener = document.body.appendChild(document.createElement('button'));
    await abrirRefinanciar(deuda([m(15000)]), opener);
    const modal = document.querySelector('refinanciar-modal');
    const etiquetas = [...modal.form.querySelectorAll('label')].map((l) => l.firstChild.textContent);
    assert(etiquetas.join() === 'Cuotas, separadas por coma,Primer vencimiento,Adelantar capital (opcional),Fecha del adelanto', 'campos de la spec, sin moneda');
    assert(modal.form.querySelector('[data-field-name="fechaAdelanto"]').classList.contains('d-none'), 'la fecha del adelanto arranca oculta');
    await waitFor(() => document.activeElement?.name === 'cuotas');
    assert(document.activeElement.name === 'cuotas', 'el foco queda en el primer campo');
    modal.ui.close();
    opener.remove();
}

async function criterio4() {
    console.log('  Criterio 4: con dos monedas, primero se elige una');
    const opener = document.body.appendChild(document.createElement('button'));
    await abrirRefinanciar(deuda([m(15000), m(300, 'USD')]), opener);
    const modal = document.querySelector('refinanciar-modal');
    const moneda = modal.form.querySelector('[name="moneda"]');
    assert(moneda.value === '', 'sin ninguna elegida');
    assert([...moneda.options].map((o) => o.value).join() === ',ARS,USD', 'ofrece solo esas dos');
    assert(modal.form.resumen.textContent === '', 'sin moneda no hay resumen');
    moneda.value = 'USD';
    moneda.dispatchEvent(new Event('change', { bubbles: true }));
    assert(modal.form.resumen.textContent === 'Vas a reemplazar 1 monto sin pagar: US$ 300,00', 'actualiza el resumen');
    modal.ui.close();
    opener.remove();
}

export const tests = [criterio3, criterio4];
