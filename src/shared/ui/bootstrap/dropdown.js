import Dropdown from 'bootstrap/js/dist/dropdown.js';
import { canInstantiateNativeBootstrapComponent, getBootstrapComponent } from './shared.js';

export function createDropdown(element, options = {}) {
    const DropdownComponent = getBootstrapComponent('Dropdown', Dropdown);
    if (!element || !DropdownComponent) return null;
    if (DropdownComponent === Dropdown && !canInstantiateNativeBootstrapComponent()) return null;
    return new DropdownComponent(element, options);
}

export function destroyDropdown(instance) {
    instance?.dispose?.();
}
