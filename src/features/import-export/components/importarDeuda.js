// Guarda un egreso de una copia de seguridad, con sus montos y sus refinanciados.
import { addOrMergeDeuda } from '../../deudas/deudaRepository.js';
import { DeudaModel } from '../../deudas/DeudaModel.js';
import { MontoModel } from '../../montos/MontoModel.js';
import { agregarRefinanciados } from '../../refinanciar/refinanciarRepository.js';

export async function importarDeuda(deudaData) {
    // Sin id, para que se genere uno nuevo
    const montos = (deudaData.montos || []).map(m => new MontoModel({
        monto: m.monto,
        moneda: m.moneda || 'ARS',
        vencimiento: m.vencimiento,
        periodo: m.periodo,
        pagado: m.pagado || false
    }));
    const id = await addOrMergeDeuda(new DeudaModel({
        acreedor: deudaData.acreedor,
        tipoDeuda: deudaData.tipoDeuda,
        notas: deudaData.notas || '',
        montos
    }));
    await agregarRefinanciados(id, deudaData.refinanciados);
}
