# Registro de Deudas — Nivva

Aplicación web para gestionar deudas, montos y vencimientos usando JavaScript puro, Web Components y IndexedDB.

## 📚 Documentación de marca y copy

> Toda la documentación de marca, voz/tono, glosario y copy de Nivva está en la **[Wiki del repositorio](https://github.com/rochafederico/deudas-app/wiki)**.  
> Los archivos fuente de la wiki también están disponibles en [`docs/wiki/`](./docs/wiki/).

| Página | Descripción |
|--------|-------------|
| [Home / Índice](https://github.com/rochafederico/deudas-app/wiki) | Tabla de contenidos del sistema de marca |
| [02 — Relevamiento](https://github.com/rochafederico/deudas-app/wiki/02-Relevamiento) | Inventario de microcopy actual + mapa de flujos |
| [03 — Manual UI](https://github.com/rochafederico/deudas-app/wiki/03-Manual-UI-Copy-Guidelines) | Guía por componente Bootstrap |
| [04 — Voz y tono](https://github.com/rochafederico/deudas-app/wiki/04-Voz-y-tono) | Registro "vos", reglas y ejemplos do/don't |
| [05 — Glosario](https://github.com/rochafederico/deudas-app/wiki/05-Glosario) | Términos aprobados y prohibidos |
| [06 — CTAs](https://github.com/rochafederico/deudas-app/wiki/06-CTAs) | Convención de verbos y ejemplos |
| [07 — Plantillas](https://github.com/rochafederico/deudas-app/wiki/07-Plantillas-de-mensajes) | Estructura éxito / error / vacío / ayuda |
| [08 — Textos breves](https://github.com/rochafederico/deudas-app/wiki/08-Textos-breves-overflow) | Límites de caracteres y overflow |
| [09 — Personas](https://github.com/rochafederico/deudas-app/wiki/09-Personas) | 3 personas basadas en encuestas (N=54) |


## Características
- **Frontend moderno:** HTML5, CSS y JavaScript sin frameworks.
- **Web Components:** UI modular con componentes personalizados (`AppShell`, `DebtForm`, `DebtList`, etc).
- **IndexedDB:** Persistencia local de datos, sin backend.
- **Modelo flexible:** Cada deuda puede tener múltiples montos, cada uno con moneda, vencimiento y periodo.
- **Navegación por mes:** Filtra y navega deudas por mes con flechas.
- **CRUD completo:** Alta, edición y borrado de deudas y montos.
- **Confirmación contextual:** Al borrar, muestra acreedor, monto, moneda, vencimiento y periodo.
- **Demo data:** Se generan datos de ejemplo realistas al iniciar.
- **Estilo oscuro:** UI moderna y responsiva.

## Funcionalidades

- [x] Alta, edición y borrado de deudas
- [x] Cada deuda puede tener múltiples montos/cuotas, con moneda (ARS/USD) y fecha de vencimiento
- [x] Edición y eliminación de montos/cuotas
- [x] Navegación y filtrado por mes
- [x] Resumen mensual: muestra totales a pagar por moneda en el mes seleccionado
- [x] Confirmación contextual al borrar montos
- [x] Persistencia local en IndexedDB (los datos no salen del navegador)
- [x] Demo de datos realistas al iniciar
- [x] Duplicar montos/cuotas: permite copiar una cuota y elegir la nueva fecha de vencimiento fácilmente.
- [x] Exportar datos
 - [x] Importar datos
- [ ] Encriptar exportación
 - [x] Agregar ingresos (sueldo o ingresos sueltos) para calcular balance mensual
- [ ] Marcar montos como pagados
 - [x] Marcar montos como pagados
- [ ] Dashboard con gráficos y cálculos para ayudar en la toma de decisiones
- [ ] Mejoras en validaciones de formularios
- [ ] Onboarding/tour para nuevos usuarios
- [x] Agrupamiento de montos en la lista por acreedor, tipo, moneda o vencimiento

## Arquitectura y estructura
El proyecto está organizado en carpetas según responsabilidad:
- **components/**: Web Components para UI y lógica de interacción.
- **models/**: Modelos de datos para deudas y montos.
- **entity/**: Entidades para la persistencia en IndexedDB.
- **database/**: Inicialización, esquema y datos demo de la base de datos.
- **repository/**: Acceso y operaciones sobre los datos.
- **utils/**: Utilidades para DOM y validaciones.
- **styles/**: Estilos globales.

Cada componente y módulo está pensado para ser reutilizable y fácil de mantener.

## Cómo usar
1. Clona el repositorio.
2. Instala dependencias con `npm install`.
3. Inicia el entorno de desarrollo con `npm run dev`.
4. Abre la URL que muestra Vite y comienza a registrar y gestionar tus deudas.

## Build

- `npm run build`: genera la aplicación optimizada en `dist/`.
- `npm run preview`: sirve localmente el build de `dist/`.

### Assets públicos y PWA

- `manifest.json`, `sw.js`, `favicon.ico` e íconos PWA viven en `public/` para que Vite los publique sin rehacer rutas.
- Los estilos principales ahora entran por `src/main.js`, así que no hace falta mantener un paso separado `build:css`.

## Requisitos
- Navegador moderno compatible con Web Components y IndexedDB.

## Notas técnicas
- No se usan frameworks ni librerías externas.
- Los datos se guardan localmente en el navegador.
- El código está modularizado y es fácil de mantener.

Importante:
- La importación/exportación de datos está implementada. La función de importación fusiona deudas por **Acreedor + Tipo de Deuda** para evitar duplicados y agrega montos que no estén ya presentes (comparación por monto, moneda y periodo/vencimiento). Esto permite combinar backups sin crear grupos duplicados.
- Las operaciones de acceso a datos se organizan en los módulos de `src/features/**`, mientras que la infraestructura de `IndexedDB` se encuentra en `src/shared/database`, usando transacciones para consistencia.

## Licencia
MIT

---

## 🗺️ Mapa del sitio

> Estado relevado del código real. Última revisión: 2026-10-08.
> Se toma el código como fuente de verdad para lo implementado y las épicas/HU abiertas como referencia del backlog pendiente.

- ✅ **Header (`AppHeader`)**
  - ✅ Marca **Nivva** → vuelve a Inicio (Este mes · Todo)
  - ✅ Acciones: **🔔 vencimientos próximos**, **💬 feedback**, **❓ tour**, **👤 menú de usuario** (Configuración)
- ✅ Sin barra inferior ni lateral: toda la app es una sola vista
- ✅ Un único botón flotante **+** abre un bottom sheet para elegir **Ingreso** o **Egreso**

### Vista única: Inicio (`/`)

- ✅ **Deuda total acumulada** fija arriba (todo lo impago de todos los meses, ARS / USD); tocarla lleva a Acreedores
- ✅ **Este mes** (con selector de mes ‹ mes ›)
  - ✅ Resumen compacto: **Ingresos**, **Egresos**, **Balance** y **Por pagar este mes** (con alerta de vencidos); cada dato abre su filtro
  - ✅ Filtros (viven en la URL, funcionan Atrás/Adelante y los links):
    - ✅ **Todo** (`/`): ingresos y montos del mes en orden de fecha
    - ✅ **Ingresos** (`/?vista=ingresos`)
    - ✅ **Egresos** (`/?vista=egresos`, `&estado=pendiente` para ver solo lo que falta pagar)
  - ✅ Filas con un solo control (switch de pagado), fecha corta ("05 oct") y badge solo para lo vencido; tocar la fila abre el detalle
- ✅ **Acreedores** (`/?vista=acreedores`): deudas globales, sin selector de mes
  - ✅ Tocar la fila abre el detalle; **Editar** y **Eliminar** en el menú ⋮
  - ✅ Avance con barra de progreso "x de y cuotas" y pendiente por acreedor
- ⏳ Dashboard visual y proyecciones *(Épica #3: HU #34–#38)*
- ⏳ Categorización avanzada y filtros persistentes *(Épica #8: HU #57–#60)*
- ⏳ Ingresos recurrentes, proyección y categorización *(Épica #4: HU #39–#43)*

### Rutas anteriores

- ✅ `/ingresos`, `/gastos` y `/gastos/deudas` redirigen a la pestaña correspondiente de Inicio (favoritos y links de notificaciones siguen funcionando)

### Acciones secundarias y modales (sin ruta propia)

- ✅ **⚙️ Configuración** *(desde el menú de usuario 👤)*
  - ✅ Exportar datos
  - ✅ Importar datos
  - 🚧 Eliminar todo *(la acción existe y borra egresos e ingresos, pero la HU #47 pide doble confirmación y limpieza de localStorage)*
- ✅ **🔔 Vencimientos próximos**
  - ✅ Popover/panel desde el header
  - ✅ Notificaciones nativas + aviso in-app *(HU #29 implementada)*
  - ⏳ Agenda/calendario, frecuencia configurable y resumen semanal *(HU #30–#33)*
- ✅ **❓ Tour guiado**
  - ✅ Inicio automático en primera visita *(HU #21)*
  - ✅ Omitir/cerrar en cualquier momento *(HU #22)*
  - 🚧 Relanzar manualmente *(botón ❓ en el header; la HU #23 lo ubicaba en `src/layout/Menu.js`, que se eliminó con la vista única)*
  - ⏳ Indicador de progreso *(HU #24)*
  - ✅ Navegación por teclado
- ✅ **Otros modales implementados**
  - ✅ Egreso (alta/edición)
  - ✅ Detalle del egreso
  - ✅ Ingreso
  - ✅ Exportación / importación

### Funcionalidades implementadas vs. pendientes

- ✅ Persistencia 100 % local en IndexedDB
- ✅ Fusión inteligente al importar *(acreedor+tipo y monto+moneda+periodo/vencimiento)*
- ✅ Resumen mensual compacto (ingresos, egresos, balance y por pagar este mes) y deuda total acumulada
- ✅ Notificaciones toast (`AppToast`)
- ⏳ Privacidad, cifrado y acceso con PIN *(Épica #5: HU #44–#47, #67–#72)*
- ⏳ Importación/exportación CSV, backups automáticos y multi-cuenta *(Épica #7: HU #53–#56)*
- ⏳ Dashboard analítico real *(Épica #3)*
- ⏳ Vistas adicionales de ayuda, agenda o patrimonio *(Épicas #1, #2 y #9)*
