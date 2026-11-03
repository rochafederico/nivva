// Analítica del formulario de egreso: se suma a DebtForm.prototype.
import { trackFlowStart, trackFlowAbandoned, updateFlowStep } from '../../../shared/observability/index.js';

export const debtFormAnalitica = {
    startAnalyticsFlow(flowName, metadata = {}) {
        if (!flowName) return;
        this._analyticsFlow = flowName;
        this._analyticsStep = metadata.step || this._analyticsStep || 'form';
        updateFlowStep(flowName, this._analyticsStep, metadata);
        if (this._analyticsStartedFor === flowName) return;
        this._analyticsStartedFor = flowName;
        this._analyticsCompleted = false;
        trackFlowStart(flowName, metadata);
    },

    abandonAnalyticsFlow(reason = 'cancel') {
        if (!this._analyticsFlow || this._analyticsCompleted) {
            this.clearAnalyticsFlow();
            return;
        }
        trackFlowAbandoned(this._analyticsFlow, this._analyticsStep, { deudaId: this.deudaId, reason });
        this.clearAnalyticsFlow();
    },

    clearAnalyticsFlow() {
        this._analyticsFlow = null;
        this._analyticsStep = 'form';
        this._analyticsCompleted = false;
        this._analyticsStartedFor = null;
    },

    _getFlowName() {
        return this.editing ? 'edit_debt' : 'create_debt';
    }
};
