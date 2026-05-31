import Toast from 'bootstrap/js/dist/toast.js';
import { canInstantiateNativeBootstrapComponent, getBootstrapComponent } from './shared.js';

export function createToast(element, options = {}) {
    const ToastComponent = getBootstrapComponent('Toast', Toast);
    if (!element || !ToastComponent) return null;
    if (ToastComponent === Toast && !canInstantiateNativeBootstrapComponent()) return null;
    return new ToastComponent(element, options);
}
