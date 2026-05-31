import Popover from 'bootstrap/js/dist/popover.js';
import { canInstantiateNativeBootstrapComponent, getBootstrapComponent } from './shared.js';

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
