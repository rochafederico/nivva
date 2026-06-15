// src/routes.js

import { navItems, DEFAULT_SUBTITLE } from './layout/navConfig.js';
import Home from './pages/Home.js';
import Gastos from './pages/Gastos.js';
import GastosMensual from './pages/GastosMensual.js';
import Ingresos from './pages/Ingresos.js';

const componentMap = {
  '/': Home,
  '/gastos': Gastos,
  '/ingresos': Ingresos,
};

const routes = [
  ...navItems.map(item => ({
    path: item.path,
    label: item.label,
    title: item.title,
    subtitle: item.subtitle,
    component: componentMap[item.path],
  })),
  {
    path: '/gastos/deudas',
    label: 'Deudas',
    title: 'Deudas',
    subtitle: DEFAULT_SUBTITLE,
    component: GastosMensual,
  },
];

export default routes;
