export function createIconButton({
  id,
  icon,
  label,
  title,
  variant = 'primary',
  extraClasses = '',
  onClick,
} = {}) {
  if (!icon || !label) {
    throw new Error('createIconButton requiere icon y label');
  }
  const allowedVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];
  if (!allowedVariants.includes(variant)) {
    throw new Error(`createIconButton: variant no permitido (${variant})`);
  }
  const hasExtraClasses = extraClasses !== undefined && extraClasses !== null;
  if (hasExtraClasses && typeof extraClasses !== 'string') {
    throw new Error('createIconButton: extraClasses debe ser string');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-${variant} d-inline-flex align-items-center justify-content-center p-2 rounded-3`;
  if (id) button.id = id;
  if (title) button.title = title;
  button.setAttribute('aria-label', label);

  const normalizedExtraClasses = hasExtraClasses ? extraClasses.trim() : '';
  const additionalClasses = normalizedExtraClasses ? normalizedExtraClasses.split(/\s+/) : [];
  if (additionalClasses.length > 0) {
    button.classList.add(...additionalClasses);
  }

  const iconEl = document.createElement('i');
  iconEl.className = `bi ${icon}`;
  iconEl.setAttribute('aria-hidden', 'true');
  button.appendChild(iconEl);

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
