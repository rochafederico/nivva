import Modal from 'bootstrap/js/dist/modal.js';
import { canInstantiateNativeBootstrapComponent, getBootstrapComponent } from './shared.js';

export function createModal(element, options = {}) {
    const ModalComponent = getBootstrapComponent('Modal', Modal);
    if (!element || !ModalComponent) return null;
    if (ModalComponent === Modal && !canInstantiateNativeBootstrapComponent()) return null;
    return new ModalComponent(element, options);
}
