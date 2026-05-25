function getBootstrapComponent(name) {
    return typeof window !== 'undefined' ? window.bootstrap?.[name] : null;
}

export function createPopover(element, options = {}) {
    const Popover = getBootstrapComponent('Popover');
    if (!element || !Popover) return null;
    return new Popover(element, options);
}

export function destroyPopover(instance) {
    instance?.dispose?.();
}

export function getPopoverDefaultAllowList() {
    return getBootstrapComponent('Popover')?.Default?.allowList ?? {};
}

export function createModal(element, options = {}) {
    const Modal = getBootstrapComponent('Modal');
    if (!element || !Modal) return null;
    return new Modal(element, options);
}

export function createToast(element, options = {}) {
    const Toast = getBootstrapComponent('Toast');
    if (!element || !Toast) return null;
    return new Toast(element, options);
}
