# 003 — Retro

Respuestas cortas y concretas. Si no aplica, "nada".

1. **Spec ambigua:** no definía mínimo ni decimales del monto (#298). Se decidió dejarlo como está.
2. **Correcciones en review:** no hubo comentarios humanos. Codex marcó la fecha en UTC+13 (#291, corregida en #298), el gasto duplicado (#293) y la pestaña sin conexión (#286), que quedaron en `main`. El humano corrigió el proceso: el orden de las tareas no dejó probar la UI hasta los últimos PRs.
3. **Tamaño:** T01 no entraba porque el plan no contó `tareas.md` (se ajustó en #294). T02, T03, T05 y T07 quedaron cerca del límite. Para entrar, T05 perdió comentarios y T01 pasó una función a T02: eso molestó.
4. **Estimación:** T05 estaba en 150 líneas y arrancó en 230.
5. **Errores repetidos del agente:** probar con Bootstrap simulado, que no vio dos fallas de la CI (orden de campos en T04 y foco en T08). También implementó T07 y T08 sin esperar la prueba de T06 en el teléfono, a pedido de armar todo el stack.
6. **Plan:** le faltó ordenar por valor visible y definir qué hacer con una pestaña desconectada.
7. **Divergencias:** nada.

## Aprendizajes

- Cada tarea entrega algo que se puede probar en la app; el plan ordena por valor visible, no por capas.
- El plan cuenta `tareas.md` entre los archivos de cada tarea.
- Los comentarios de revisión automática se resuelven antes de mergear.
- Los tests en un navegador con Bootstrap simulado no reemplazan a la CI.
- Un PR apilado se mergea después de su base: #288 a #291 entraron en una rama intermedia y hubo que rehacer el stack.
- Una sesión sin dependencias no puede correr los tests: PRs en draft y CI como verificación.
- Un bug de `main` no tiene camino en el flujo: el gasto duplicado se arregló fuera de las tareas.
- La interacción se validó tarde otra vez: T06 fue la primera tarea visible.
