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

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-${variant} d-inline-flex align-items-center justify-content-center p-2 rounded-3`;
  if (id) button.id = id;
  if (title) button.title = title;
  button.setAttribute('aria-label', label);

  const additionalClasses = extraClasses.split(' ').filter(Boolean);
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
