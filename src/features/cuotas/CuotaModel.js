// CuotaModel.js
export class CuotaModel {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.cuota
     * @param {string} params.moneda
     * @param {string} params.vencimiento
     * @param {string} [params.periodo]
     * @param {number} [params.deudaId]
     */
    constructor({ id, cuota, moneda, vencimiento, periodo, deudaId, pagado = false }) {
        this.id = id;
        this.cuota = Number(cuota);
        this.moneda = moneda || 'ARS';
        this.vencimiento = vencimiento;
        this.periodo = periodo || (vencimiento ? vencimiento.slice(0, 7) : '');
        this.deudaId = deudaId;
        this.pagado = pagado;
    }
}
