// Shared navigation items used by the desktop menu (Menu.js) and mobile bottom navbar (BottomNav.js)
export const DEFAULT_SUBTITLE = 'Gestioná tus pagos y vencimientos del período.';

export const navItems = [
  { label: 'Inicio', icon: 'bi-house', path: '/', key: 'inicio', title: 'Tu panorama financiero', subtitle: 'Mirá cómo viene tu mes de un vistazo.' },
  { label: 'Ingresos', icon: 'bi-cash-stack', path: '/ingresos', key: 'ingresos', title: 'Ingresos del mes', subtitle: 'Registrá el dinero que recibís en el período.' },
  { label: 'Egresos', icon: 'bi-wallet2', path: '/gastos', key: 'gastos', title: 'Egresos', subtitle: DEFAULT_SUBTITLE },
];
