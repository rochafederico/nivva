// src/routes.js
// La app es una sola vista (Inicio). Las rutas anteriores redirigen a su pestaña
// para no romper favoritos, links de notificaciones ni accesos directos.

import { DEFAULT_TITLE, DEFAULT_SUBTITLE } from './layout/navConfig.js';
import Home from './pages/Home.js';

export const REDIRECTS = {
  '/ingresos': '/?vista=ingresos',
  '/gastos': '/?vista=egresos',
  '/gastos/deudas': '/?vista=acreedores',
};

/** Destino al que hay que redirigir una ruta vieja (o null si no es una ruta vieja). */
export function redirectFor(pathname) {
  return REDIRECTS[pathname.replace(/\/+$/, '') || '/'] || null;
}

const routes = [
  {
    path: '/',
    label: 'Inicio',
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    component: Home,
  },
];

export default routes;
