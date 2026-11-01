# Accesibilidad — WCAG 2.2 nivel AA

Nivva cumple **WCAG 2.2 nivel AA** (niveles A y AA). La referencia es la
norma oficial; acá no se copia, solo se dice cómo usarla en este repo.

## Dónde está la norma

- Lista completa con filtros: <https://www.w3.org/WAI/WCAG22/quickref/>
  (en *Filter*, elegir niveles A y AA, y tecnologías HTML, CSS, ARIA y
  scripting).
- Cada criterio tiene tres páginas. Ejemplo con 1.4.3 Contraste mínimo:
  - Resumen y técnicas: `https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum`
  - Qué pide y por qué: `https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum`
  - Técnicas con ejemplos de código: los links de *Sufficient techniques*
    de esas páginas (`https://www.w3.org/WAI/WCAG22/Techniques/...`).

**Para agentes:** no leas la página completa del quickref. Buscá el
criterio que aplica y abrí solo su página Understanding y sus técnicas.

## Cómo se aplica en el flujo

- **Spec (qué):** nombra los criterios que toca la funcionalidad (número
  y nombre) y describe lo que la persona tiene que poder hacer: qué
  escucha con lector de pantalla, qué teclas usa, dónde queda el foco.
  Sin HTML, ARIA ni nombres de código.
- **Plan (cómo):** para cada criterio, la técnica del W3C que se usa
  (roles, atributos `aria-*`, estructura HTML) y el test que la cubre.
- **PR:** el DoD pide revisar teclado, lector de pantalla, contraste y zoom.
- **Baseline:** lo que hoy no cumple AA se anota como divergencia, con el
  número de criterio. No se corrige en la baseline.

## Criterios que más aparecen en Nivva

| Criterio | En la spec (lo que percibe la persona) | En el plan (técnica habitual) |
|---|---|---|
| 1.3.1 Info y relaciones | El lector anuncia cada campo con su nombre y las listas como listas | `<label>` asociado, `<ul>`/`<table>` semánticos |
| 1.4.3 Contraste mínimo | Textos e importes legibles sobre su fondo | 4.5:1 en texto, 3:1 en texto grande |
| 1.4.10 Reflow | Se usa a 320 px de ancho sin scroll horizontal | Layout fluido, sin anchos fijos |
| 1.4.11 Contraste no textual | Switches, bordes de campos y foco se distinguen | 3:1 contra el fondo |
| 2.1.1 Teclado | Todo se hace sin mouse, incluido el bottom sheet del + | Elementos nativos o manejo de teclas |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Se ve dónde está el foco y no queda bajo el header | `:focus-visible`, `scroll-margin` |
| 2.5.8 Tamaño del objetivo | Los controles se tocan sin errar | Al menos 24×24 px |
| 3.3.1 y 3.3.3 Errores | Cada campo dice qué está mal y cómo corregirlo | `aria-describedby`, `aria-invalid` |
| 4.1.2 Nombre, función, valor | El lector dice qué es cada control, cómo se llama y su estado | Rol y nombre accesible en los Web Components |
| 4.1.3 Mensajes de estado | El lector anuncia avisos sin mover el foco | `role="status"` o `aria-live` |

La tabla no reemplaza la norma: es por dónde empezar a revisar.

## Cómo se verifica

- **Tests:** atributos y roles se prueban en `test/` con happy-dom.
- **A mano en cada PR de UI:** recorrer con teclado, probar con un lector
  de pantalla (VoiceOver o TalkBack), zoom al 200 % y ancho de 320 px.
- **Contraste:** happy-dom no lo puede medir; se revisa a mano hasta que
  exista un check automático (axe-core sobre la app real, iteración futura).
