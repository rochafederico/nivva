import Modal from 'bootstrap/js/dist/modal.js';
import Popover from 'bootstrap/js/dist/popover.js';
import Toast from 'bootstrap/js/dist/toast.js';

function getBootstrapComponent(name, fallback) {
    return typeof window !== 'undefined' ? window.bootstrap?.[name] ?? fallback : fallback;
}

function canInstantiateNativeBootstrapComponent() {
    return typeof document !== 'undefined' && typeof Element !== 'undefined';
}

export function createPopover(element, options = {}) {
    const PopoverComponent = getBootstrapComponent('Popover', Popover);
    if (!element || !PopoverComponent) return null;
    if (PopoverComponent === Popover && !canInstantiateNativeBootstrapComponent()) return null;
    return new PopoverComponent(element, options);
}

export function destroyPopover(instance) {
    instance?.dispose?.();
}

export function getPopoverDefaultAllowList() {
    const PopoverComponent = getBootstrapComponent('Popover', Popover);
    return PopoverComponent?.Default?.allowList ?? {};
}

export function createModal(element, options = {}) {
    const ModalComponent = getBootstrapComponent('Modal', Modal);
    if (!element || !ModalComponent) return null;
    if (ModalComponent === Modal && !canInstantiateNativeBootstrapComponent()) return null;
    return new ModalComponent(element, options);
}

export function createToast(element, options = {}) {
    const ToastComponent = getBootstrapComponent('Toast', Toast);
    if (!element || !ToastComponent) return null;
    if (ToastComponent === Toast && !canInstantiateNativeBootstrapComponent()) return null;
    return new ToastComponent(element, options);
}
