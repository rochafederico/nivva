# 004 — Retro

Respuestas cortas y concretas. Si no aplica, "nada".

1. **Spec ambigua:** el detalle de lo refinanciado. La spec mostraba los montos reemplazados, pero no decía cómo ver el plan nuevo. Hubo tres ajustes en la prueba: grupos por día (#320), un registro de cada refinanciación con su resumen (#321) y sacar los reemplazados del detalle (#325). Importar una copia anterior a una refinanciación quedó sin cubrir (#309).
2. **Correcciones en review:** el humano, al probar T05, pidió ver cada refinanciación como una línea con cantidad de cuotas, cuota o promedio y total, y no ver los montos reemplazados. Codex: el test del menú de Acreedores (#312, corregido), cerrar con `Escape` durante el guardado deja la lista sin actualizar (#315, sin resolver, está en `main`), los refinanciados huérfanos al eliminar todos los datos (#318, corregido) y el estado `aprobada` en el PR del plan (#310, es lo que pide `/plan`).
3. **Tamaño:** T02 no entró y se partió en T02b. T05b no entró en 10 archivos y fueron dos PRs (#323 y #324). T05 quedó en 200 líneas justas después de compactar tests. `DebtDetailModal`, `refinanciarRepository` y `localStorageFallback` obligaron a extraer archivos. Partir ayudó; compactar para entrar molestó.
4. **Estimación:** T05b estaba en 9 archivos y fueron 12, por el refactor de `DebtDetailModal` y los tests de tareas anteriores que cambiaron.
5. **Errores repetidos del agente:** apiló T06 y T07 antes de validar T05 en la app, y hubo que rehacerlos con rebase tres veces. No pasó las tareas a `mergeada` en `tareas.md`. Volvió a correr un check `validado` viejo, que repite el evento sin la etiqueta, y dejó #317 bloqueado.
6. **Plan:** el wireframe del detalle no tenía datos reales (dos refinanciaciones, el mismo día, cuotas distintas). Faltó guardar el plan como registro desde T01 y prever los huérfanos al eliminar todos los datos.
7. **Divergencias:** nada.

## Aprendizajes

- Los comentarios de revisión automática se resuelven antes de mergear: #315 dejó en `main` el cierre con `Escape` durante el guardado.
- Un PR apilado se mergea después de su base y de los ajustes a la spec que lo cambian: #316 entró antes de #325, y GitHub no deja cambiar la base de un PR que es parte de una pila.
- La interacción se validó tarde otra vez: el detalle cambió tres veces en la prueba de T05.
- No se apilan tareas sobre una tarea visible sin probar: un ajuste a la spec obliga a rehacer todas las de arriba.
- `tareas.md` no se actualiza al mergear: T01 a T07 quedaron en "en PR".
- Un check de `pull_request_target` no se vuelve a correr: repite el evento viejo. Para revalidar se saca y se pone la etiqueta.
