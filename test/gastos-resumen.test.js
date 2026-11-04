// Spec 003, criterios 12, 13 y 14: el resumen cuenta los gastos y el resto de la app no los ve.
import { assert, waitFor } from './setup.js';
import StatsIndicators from '../src/features/stats/components/StatsIndicators.js';
import { getMonthlySummary } from '../src/features/stats/statsService.js';
import { formatMoneda } from '../src/shared/config/monedas.js';
import { getSelectedMonth, setSelectedMonth } from '../src/shared/MonthFilter.js';
import { addDeuda, deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import { addIngreso, deleteAllIngresos } from '../src/features/ingresos/ingresoRepository.js';
import { listMontos } from '../src/features/montos/montoRepository.js';
import { addGasto, deleteAllGastos } from '../src/features/gastos/gastoRepository.js';

const MES = '2026-11';
const fecha = '2026-11-03';
const gasto = (monto, moneda = 'ARS') => ({ descripcion: 'Súper', monto, moneda, fecha });

async function cargarMes() {
    await limpiar();
    await addIngreso({ fecha, descripcion: 'Sueldo', monto: 100000, moneda: 'ARS' });
    await addDeuda({
        acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '',
        montos: [{ monto: 30000, moneda: 'ARS', vencimiento: '2026-11-20', periodo: MES, pagado: false }],
    });
    await addGasto(gasto(5000));
}

async function limpiar() {
    await Promise.all([deleteDeudas(), deleteAllIngresos(), deleteAllGastos()]);
}

async function criterio12() {
    console.log('  Criterio 12: Egresos y Balance cuentan el gasto, "Por pagar" no');
    await cargarMes();
    const previo = getSelectedMonth();
    setSelectedMonth(MES);
    const banner = StatsIndicators({ mes: MES });
    document.body.appendChild(banner);
    const montos = () => [...banner.querySelectorAll('.kpi-amount')].map((el) => el.textContent);
    await waitFor(() => montos().length === 4);
    assert(montos()[1] === formatMoneda(35000, 'ARS'), 'Egresos suma el gasto');
    assert(montos()[2] === formatMoneda(65000, 'ARS'), 'Balance resta el gasto');
    assert(montos()[3] === formatMoneda(30000, 'ARS'), 'Por pagar no cuenta el gasto');

    await addGasto(gasto(1000));
    window.dispatchEvent(new CustomEvent('gasto:saved', { detail: {} }));
    await waitFor(() => montos()[1] === formatMoneda(36000, 'ARS'));
    assert(montos()[1] === formatMoneda(36000, 'ARS'), 'se actualiza sin recargar');
    banner.remove();
    setSelectedMonth(previo);
}

async function criterio13() {
    console.log('  Criterio 13: montos y acreedores no ven el gasto');
    await cargarMes();
    const montos = await listMontos({ mes: MES });
    assert(montos.length === 1 && montos[0].monto === 30000, 'la lista de montos no incluye el gasto');
    const deudas = await listDeudas();
    assert(deudas.length === 1 && deudas[0].acreedor === 'Banco', 'los acreedores no incluyen el gasto');
    const { counts } = await getMonthlySummary(MES);
    assert(counts.montos === 1 && counts.vencidos === 0, 'los conteos de vencidos no lo cuentan');
}

async function criterio14() {
    console.log('  Criterio 14: un gasto en dólares no se mezcla con los pesos');
    await cargarMes();
    await addGasto(gasto(20, 'USD'));
    const { byCurrency } = await getMonthlySummary(MES);
    assert(byCurrency.egresos.ARS === 35000, 'los pesos no cambian');
    assert(byCurrency.egresos.USD === 20 && byCurrency.saldo.USD === -20, 'los dólares van aparte');
    await limpiar();
}

export const tests = [criterio12, criterio13, criterio14];
