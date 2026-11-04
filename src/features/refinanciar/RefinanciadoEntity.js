// Monto reemplazado por una refinanciación: queda como historial, fuera del almacén de montos.
export class RefinanciadoEntity {
    constructor({ deudaId, monto, moneda, vencimiento, periodo, refinanciadoEl }) {
        this.deudaId = deudaId;
        this.monto = monto;
        this.moneda = moneda;
        this.vencimiento = vencimiento;
        this.periodo = periodo || vencimiento?.slice(0, 7) || '';
        this.refinanciadoEl = refinanciadoEl;
    }
}
