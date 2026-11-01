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

- **Spec:** la sección *Accesibilidad* nombra los criterios que toca la
  funcionalidad (número y nombre) y cómo se va a verificar cada uno.
- **Plan:** dice qué técnica del W3C se usa para cada criterio.
- **PR:** el DoD pide revisar teclado, lector de pantalla, contraste y zoom.
- **Baseline:** lo que hoy no cumple AA se anota como divergencia, con el
  número de criterio. No se corrige en la baseline.

## Criterios que más aparecen en Nivva

| Criterio | Qué significa acá |
|---|---|
| 1.3.1 Info y relaciones | Formularios con `<label>`, tablas y listas semánticas |
| 1.4.3 Contraste mínimo | 4.5:1 en texto, 3:1 en texto grande; montos incluidos |
| 1.4.10 Reflow | Usable a 320 px de ancho sin scroll horizontal |
| 1.4.11 Contraste no textual | Switches, bordes de inputs y foco a 3:1 |
| 2.1.1 Teclado | Todo se puede hacer sin mouse, incluido el bottom sheet del + |
| 2.4.7 y 2.4.11 Foco visible y no tapado | El foco se ve y no queda bajo el header fijo |
| 2.5.8 Tamaño del objetivo | Controles de al menos 24×24 px |
| 3.3.1 y 3.3.3 Errores | Mensaje por campo, que diga cómo corregirlo |
| 4.1.2 Nombre, función, valor | Web Components con rol y nombre accesible correctos |
| 4.1.3 Mensajes de estado | Toasts anunciados con `role="status"` o `aria-live` |

La tabla no reemplaza la norma: es por dónde empezar a revisar.

## Cómo se verifica

- **Tests:** atributos y roles se prueban en `test/` con happy-dom.
- **A mano en cada PR de UI:** recorrer con teclado, probar con un lector
  de pantalla (VoiceOver o TalkBack), zoom al 200 % y ancho de 320 px.
- **Contraste:** happy-dom no lo puede medir; se revisa a mano hasta que
  exista un check automático (axe-core sobre la app real, iteración futura).
