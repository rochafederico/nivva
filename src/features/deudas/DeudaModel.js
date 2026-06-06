// src/models/DeudaModel.js
import { CuotaModel } from '../cuotas/CuotaModel.js';

export class DeudaModel {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {string} params.acreedor
     * @param {string} params.tipoDeuda
     * @param {string} [params.notas]
     * @param {Array<Object>|CuotaModel[]} [params.cuotas]
     */
    constructor({ id, acreedor, tipoDeuda, notas = '', cuotas = [] }) {
        this.id = id;
        this.acreedor = acreedor;
        this.tipoDeuda = tipoDeuda;
        this.notas = notas;
        // Asegura que todos las cuotas sean instancias de CuotaModel
        this.cuotas = cuotas.map(m => m instanceof CuotaModel ? m : new CuotaModel(m));
    }
}
