// src/components/ExportDataModal.js
import '../../../shared/components/AppForm.js';
import '../../../shared/components/UiModal.js';
import { mapDeudasParaExportar } from './exportarDeudas.js';
import {
    trackEvent,
    trackFlowStart,
    trackFlowComplete,
    trackFlowError
} from '../../../shared/observability/index.js';

export class ExportDataModal extends HTMLElement {
    constructor() {
        super();
    }

    #createAndDownloadJsonFile(deudas, ingresos, gastos) {
        const json = JSON.stringify({ deudas, ingresos, gastos }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deudasapp-backup.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            this.#removeDownloadLink(a, url);
        }, 100);
    }

    #removeDownloadLink(a, url) {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async open(opener) {
        if (!this._rendered) this.render();
        this.modal = this.querySelector('ui-modal');
        this.modal.setTitle('Exportar datos');
        this.modal.returnFocusTo(opener);
        await this.modal.open();
        trackFlowStart('export_data', { step: 'modal_open' });
        try {
            const { listDeudas } = await import('../../deudas/deudaRepository.js');
            const { getAll } = await import('../../ingresos/ingresoRepository.js');
            const { getAll: getGastos } = await import('../../gastos/gastoRepository.js');
            let deudas = await listDeudas();
            const ingresos = await getAll();
            const { listRefinanciados } = await import('../../refinanciar/refinanciarRepository.js');
            deudas = mapDeudasParaExportar(deudas, await listRefinanciados());
            this.#createAndDownloadJsonFile(deudas, ingresos, await getGastos());
            this.close();
            trackEvent('export_data_used', {
                flow: 'export_data',
                status: 'completed',
                deudas: deudas.length,
                ingresos: ingresos.length
            });
            await trackFlowComplete('export_data', {
                deudas: deudas.length,
                ingresos: ingresos.length
            });
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '✅ Datos exportados.', type: 'success' } }));
        } catch (error) {
            console.error('Error al exportar:', error);
            trackFlowError('export_data', { step: 'export', reason: error.message });
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: '❌ No pudimos exportar tus datos. Intentá de nuevo.', type: 'danger' } }));
            this.close();
        }
    }

    close() {
        this.modal.close();
    }

    render() {
        this._rendered = true;
        this.innerHTML = `
            <ui-modal id="exportModal">
                <div class="p-3">
                    <p>Exporta todos tus datos en un archivo JSON legible.</p>
                    <div class="text-center mt-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </ui-modal>
        `;
    }
}

customElements.define('export-data-modal', ExportDataModal);
