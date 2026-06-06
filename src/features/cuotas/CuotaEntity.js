// CuotaEntity.js
export class CuotaEntity {
    /**
     * @param {Object} params
     * @param {number} params.deudaId
     * @param {number} params.cuota
     * @param {string} params.moneda
     * @param {string} params.vencimiento
     * @param {string} [params.periodo]
     */
    constructor({ deudaId, cuota, moneda, vencimiento, periodo, pagado = false }) {
        this.deudaId = deudaId;
        this.cuota = cuota;
        this.moneda = moneda;
        this.vencimiento = vencimiento;
        this.periodo = periodo || vencimiento?.slice(0, 7) || '';
        this.pagado = pagado;
    }
}
