import { createPopover, getPopoverDefaultAllowList } from '../shared/ui/bootstrap/index.js';

function mergeAllowList(additions = {}) {
  const defaults = getPopoverDefaultAllowList();
  const merged = { ...defaults };
  Object.entries(additions).forEach(([key, value]) => {
    const base = Array.isArray(defaults[key]) ? defaults[key] : [];
    merged[key] = Array.isArray(value) ? [...new Set([...base, ...value])] : value;
  });
  return merged;
}

export function createNavbarPopover(button, options) {
  if (!button) return null;
  const cloneModifier = (modifier) => {
    if (!modifier || typeof modifier !== 'object') return modifier;
    return {
      ...modifier,
      options: modifier.options && typeof modifier.options === 'object'
        ? { ...modifier.options }
        : modifier.options,
    };
  };
  const { allowList, ...popoverOptions } = options ?? {};
  return createPopover(button, {
    trigger: 'click',
    placement: 'bottom',
    container: 'body',
    popperConfig(defaultConfig) {
      const modifiers = Array.isArray(defaultConfig?.modifiers)
        ? defaultConfig.modifiers.map(cloneModifier)
        : defaultConfig?.modifiers;
      return { ...defaultConfig, modifiers, placement: 'bottom-end' };
    },
    ...popoverOptions,
    ...(allowList ? { allowList: mergeAllowList(allowList) } : {}),
  });
}

export class NavbarPopoverController extends HTMLElement {
  connectedCallback() {
    if (!this._button) return;
    this._handleShown = () => this._onShown?.();
    this._handleHidden = () => this._onHidden?.();
    this._handleAnyShown = (e) => {
      const target = e.target;
      if (target && target !== this._button) {
        this._getPopover?.()?.hide();
      }
    };
    this._button.addEventListener('shown.bs.popover', this._handleShown);
    this._button.addEventListener('hidden.bs.popover', this._handleHidden);
    document.addEventListener('shown.bs.popover', this._handleAnyShown);
  }

  disconnectedCallback() {
    this._button?.removeEventListener('shown.bs.popover', this._handleShown);
    this._button?.removeEventListener('hidden.bs.popover', this._handleHidden);
    document.removeEventListener('shown.bs.popover', this._handleAnyShown);
    this._onHidden?.();
    this._handleShown = null;
    this._handleHidden = null;
    this._handleAnyShown = null;
  }
}

customElements.define('navbar-popover-controller', NavbarPopoverController);
