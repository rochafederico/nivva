# Social Media — Reel IA: nueva vista de montos adeudados

> Guía operativa para crear un reel de Instagram usando ElevenLabs + Instagram Edits, sin voz generada por IA.

## Objetivo

Promocionar la nueva vista de montos adeudados de Nivva mostrando, de forma clara y simple, que ahora es más fácil ver:

- qué queda pendiente;
- qué ya está pagado;
- cuánto corresponde al mes seleccionado.

## Criterio de marca

- Usar tono claro, cercano y directo.
- Escribir en registro rioplatense con “vos”.
- No prometer resultados financieros.
- No dramatizar deudas.
- No usar estética futurista, cripto, bancaria ni exageradamente “IA”.
- Mostrar Nivva como herramienta de registro y visibilidad.
- Usar IA como apoyo visual, no como protagonista del mensaje.

## Herramientas sugeridas

### Prioridad recomendada

1. **ElevenLabs** para armar el flujo de generación visual y producir imágenes/clips base.
2. **Instagram Edits** para editar, ordenar clips, agregar textos, música y publicar.
3. **Captura real de la app** para mostrar la nueva vista como evidencia del producto.

> Nota: no usar voz generada con IA. Los textos del reel se definen desde la documentación de marca y se agregan como overlays en Instagram Edits.

## Flujo de trabajo resumido

1. Definir el mensaje del reel.
2. Crear un flujo en ElevenLabs.
3. Generar imágenes base por escena.
4. Convertir las imágenes a clips cortos.
5. Grabar o capturar la pantalla real de la nueva vista.
6. Editar todo en Instagram Edits.
7. Agregar textos breves en pantalla.
8. Publicar como reel y reutilizar como historia.

## Flujo recomendado en ElevenLabs

Crear un flujo visual con estos nodos:

| Nodo | Tipo | Salida |
|---|---|---|
| 1 | Texto | Prompt maestro |
| 2 | Imagen | Escena problema |
| 3 | Imagen | Escena transición |
| 4 | Imagen | Escena nueva vista |
| 5 | Imagen | Escena beneficio |
| 6 | Imagen | Cierre marca |
| 7 | Video | Animación de escenas |
| 8 | Export | Clips para Edits |

### Paso a paso en ElevenLabs

1. Crear un flujo nuevo.
2. Agregar un nodo de texto con el **prompt maestro**.
3. Agregar un nodo de imagen por cada escena.
4. Conectar el prompt maestro con cada nodo de imagen.
5. En cada nodo de imagen, sumar el prompt específico de la escena.
6. Generar una primera versión de cada imagen.
7. Elegir solo imágenes donde el celular, la mano y la pantalla se vean naturales.
8. Convertir cada imagen aceptada a video con el prompt de imagen a video.
9. Exportar clips verticales 9:16 de 3 a 5 segundos.
10. No generar voz ni narración.

## Estructura del reel

Duración sugerida: 18 a 24 segundos.

| Escena | Duración | Idea |
|---|---:|---|
| 1 | 3s | Antes: papeles, planillas, confusión |
| 2 | 4s | Aparece Nivva en el celular |
| 3 | 6s | Nueva vista de montos adeudados |
| 4 | 5s | Pendiente y pagado más claros |
| 5 | 3s | Cierre con marca |

## Textos en pantalla

Usar estos textos como overlays en Instagram Edits:

1. `¿Te cuesta ver cuánto debés?`
2. `Ahora lo ves más claro.`
3. `Pendiente y pagado, separados.`
4. `Tus montos del mes, en un solo lugar.`
5. `Nivva`
6. `Tus números, fácil y simple.`

## Prompt maestro para el flujo

Usar como primer nodo de texto en ElevenLabs.

```text
Create a vertical 9:16 realistic product marketing reel for a personal finance web app called Nivva.

Brand style: simple, clear, calm, trustworthy and human. The product helps people register and visualize monthly financial commitments. It is not a financial advisor and should not promise financial improvement.

Visual style: realistic, minimal, warm natural light, modern home desk, smartphone as the main subject. Avoid exaggerated AI aesthetics. The mood should feel organized and useful, not dramatic.

Brand colors: teal #3D8F8F, cream #F2EDE8, white, soft black #1A1A1A and neutral gray.

The app should look like a clean mobile-first web app. The key feature is an improved “amounts owed” view that clearly separates pending payments, paid payments and monthly totals.

Do not show real bank logos, credit card brands, private data, QR codes, account numbers or sensitive financial information.

Do not add Spanish text inside the generated image or video. Leave empty space for text overlays that will be added later in Instagram Edits.

Format: vertical 9:16.
Tone: calm, useful, premium but simple.
```

## Prompt negativo general

Usar como restricción en todos los nodos de imagen o video.

```text
No futuristic holograms, no neon, no cyberpunk, no flying charts, no crypto coins, no bank logos, no credit card brands, no real personal data, no QR codes, no messy unreadable UI, no distorted phone screen, no dramatic anxiety, no luxury lifestyle, no money flying, no exaggerated AI glow, no robotic interface, no extra fingers, no broken hands, no generated Spanish text, no fake captions, no watermark.
```

## Prompts por escena

### Escena 1 — Problema

```text
Vertical 9:16 realistic image. A home desk with scattered receipts, a notebook, a calculator, a pen and a laptop with a spreadsheet blurred in the background. Warm natural light. The scene should feel relatable and slightly disorganized, but not dramatic. No people faces. No bank logos. Leave empty space for text overlay. No generated text.
```

Texto en Edits:

```text
¿Te cuesta ver cuánto debés?
```

### Escena 2 — Transición a Nivva

```text
Vertical 9:16 realistic image. A smartphone on a warm minimal desk showing a clean personal finance web app called Nivva. The interface uses teal #3D8F8F and cream #F2EDE8. The app looks simple, readable and mobile-first. The background is softly blurred. Leave empty space for text overlay. No generated text.
```

Texto en Edits:

```text
Ahora lo ves más claro.
```

### Escena 3 — Nueva vista de montos

```text
Vertical 9:16 realistic close-up of a smartphone screen showing a clean mobile app view for monthly owed amounts. The interface clearly separates pending payments and paid payments. Show visual totals at the bottom. Use teal #3D8F8F, cream #F2EDE8, white and soft black. The UI must feel simple and organized. No real brands, no private data, no QR codes. No generated text.
```

Texto en Edits:

```text
Pendiente y pagado, separados.
```

> Recomendación: para esta escena conviene priorizar una captura real de Nivva antes que una pantalla generada por IA.

### Escena 4 — Beneficio

```text
Vertical 9:16 realistic image of a person holding a smartphone with the Nivva app open. The person is sitting near a desk in warm natural light. The phone screen shows a clean monthly summary with pending and paid amounts. The mood is calm and organized. Do not show the person's face. No exaggerated emotion. No generated text.
```

Texto en Edits:

```text
Tus montos del mes, en un solo lugar.
```

### Escena 5 — Cierre

```text
Vertical 9:16 minimal brand image. Cream background #F2EDE8, centered teal symbol inspired by the Nivva brand, clean sans-serif text area, modern and simple. No extra decoration. Calm, trustworthy and minimal. No generated text.
```

Texto en Edits:

```text
Nivva
Tus números, fácil y simple.
```

## Prompt para imagen a video

Usar en cada nodo que convierta imagen a video.

```text
Animate this vertical 9:16 image into a short realistic product promo clip.

Use a slow camera push-in, subtle handheld movement and warm natural lighting. Keep the smartphone and app interface stable and readable. Do not distort the screen. Do not add new objects. Do not add text. Keep the movement calm, premium and minimal.

Duration: 4 seconds.
```

## Prompt para música o ambiente opcional

Usar solo si se decide generar música o ambiente dentro de ElevenLabs. No usar voz.

```text
Create a short instrumental background track for a calm, modern product reel.

Mood: warm, simple, focused and optimistic.
Style: minimal electronic acoustic, soft beat, no vocals, no lyrics, no dramatic buildup.
Duration: 24 seconds.
The music should support a clean personal productivity app, not feel like a bank ad or a luxury commercial.
```

## Edición en Instagram Edits

1. Crear un proyecto vertical 9:16.
2. Importar los clips generados con ElevenLabs.
3. Importar una grabación real de la nueva vista, si está disponible.
4. Ordenar los clips así:
   - escritorio con papeles;
   - celular con Nivva;
   - detalle de montos;
   - persona usando el celular;
   - cierre con marca.
5. Cortar cada clip a 3–5 segundos.
6. Agregar textos en pantalla, uno por escena.
7. Usar tipografía simple, sin efectos llamativos.
8. Usar texto blanco o negro según contraste.
9. Usar teal solo para palabras clave como `Pendiente`, `Pagado` o `Nivva`.
10. Agregar música instrumental suave desde Instagram o importar la generada en ElevenLabs.
11. No agregar voz IA.
12. Exportar y revisar que la pantalla se entienda sin audio.

## Caption sugerido

```text
Ahora la vista de montos es más clara.

Podés ver qué queda pendiente, qué ya pagaste y cuánto corresponde al mes seleccionado.

Nivva te ayuda a registrar y visualizar tus compromisos sin planillas, sin vueltas y sin subir tus datos.

Probala gratis.
```

## Checklist antes de publicar

- [ ] El reel se entiende sin sonido.
- [ ] No aparecen datos reales.
- [ ] No aparecen marcas de bancos o tarjetas.
- [ ] No se usan pantallas viejas como protagonista.
- [ ] Los textos están en registro “vos”.
- [ ] No se promete salir de deudas ni mejorar finanzas.
- [ ] La estética se mantiene simple, clara y humana.
- [ ] El cierre muestra Nivva y el tagline.
- [ ] No se generó voz IA.
- [ ] La nueva vista aparece al menos una vez con captura real o UI claramente legible.
