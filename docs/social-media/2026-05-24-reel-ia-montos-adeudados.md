# Social Media — Reel IA: nueva vista de montos adeudados

> Guía operativa y registro del reel de Instagram creado para promocionar la nueva vista de montos adeudados de Nivva.

## Objetivo

Promocionar la nueva vista de montos adeudados de Nivva mostrando, de forma clara y simple, que ahora es más fácil ver:

- qué queda pendiente;
- qué ya está pagado;
- cuánto corresponde al mes seleccionado.

La narrativa del reel va de **desorden manual** a **claridad visual en Nivva**.

## Versión publicada

El reel se armó en **4 escenas**, sin textos agregados sobre el video.

| Escena | Idea | Función narrativa |
|---|---|---|
| 1 | Escritorio con papeles, cuentas, planilla y pizarra | Mostrar el problema: organización manual y desorden visual |
| 2 | Celular o pantalla con Nivva | Presentar la solución de forma visual |
| 3 | Persona usando Nivva en el celular | Humanizar el uso y mostrar claridad en contexto real |
| 4 | Logo de Nivva | Cierre de marca |

## Criterio de marca

- Usar tono claro, cercano y directo.
- Escribir en registro rioplatense con “vos”.
- No prometer resultados financieros.
- No dramatizar deudas.
- No usar estética futurista, cripto, bancaria ni exageradamente “IA”.
- Mostrar Nivva como herramienta de registro y visibilidad.
- Usar IA como apoyo visual, no como protagonista del mensaje.
- Priorizar escenas realistas, cálidas y cotidianas.
- Evitar estética de stock corporativo demasiado perfecta.

## Decisión de edición

Para esta versión se decidió **no usar textos en pantalla**. La comunicación queda apoyada en:

- la progresión visual de las escenas;
- la captura/representación de Nivva;
- el caption de Instagram;
- los hashtags;
- el cierre con marca.

Motivo: al no sumar overlays, el reel se ve más limpio, más realista y menos publicitario. Además, permite que el foco quede en la app y en el contraste entre el desorden inicial y la claridad final.

## Caption para publicar

```text
Ordenar tus cuentas no debería depender de mil papeles, cuentas sueltas o una planilla difícil de seguir.

En Nivva estoy mejorando la vista de montos adeudados para que sea más simple ver qué queda pendiente, qué ya pagaste y cuánto corresponde al mes.

La idea es clara: menos vueltas, más visibilidad.

Probala gratis desde el link del perfil.
```

## Hashtags

```text
#Nivva #FinanzasPersonales #OrganizacionFinanciera #Deudas #PresupuestoPersonal #AppWeb #Productividad #HerramientasDigitales #FinanzasDelHogar #HechoEnArgentina #ProyectoPersonal #WebApp #UX #DiseñoDeProducto #ConstruyendoEnPublico
```

## Prompt maestro para imágenes

Usar como base para todas las escenas.

```text
Create a vertical 9:16 realistic product marketing image for a personal finance web app called Nivva.

Brand style: simple, clear, calm, trustworthy and human. The product helps people register and visualize monthly financial commitments. It is not a financial advisor and should not promise financial improvement.

Visual style: realistic lifestyle photography, warm natural light, shallow depth of field, modern home desk, everyday objects, natural textures, calm composition. Avoid exaggerated AI aesthetics. The mood should feel useful and human, not dramatic.

Brand colors: teal #3D8F8F, cream #F2EDE8, white, soft black #1A1A1A and neutral gray.

The app should look like a clean mobile-first web app. The key feature is an improved monthly debts view that clearly separates pending payments, paid payments and monthly totals.

Do not show real bank logos, credit card brands, private data, QR codes, account numbers or sensitive financial information.

Leave empty space if text overlays are needed later, but do not generate text inside the image.

Format: vertical 9:16.
Tone: calm, useful, premium but simple.
```

## Prompt negativo general

Usar como restricción en todos los nodos de imagen o video.

```text
No futuristic holograms, no neon, no cyberpunk, no flying charts, no crypto coins, no bank logos, no credit card brands, no real personal data, no QR codes, no messy unreadable UI, no distorted phone screen, no dramatic anxiety, no luxury lifestyle, no money flying, no exaggerated AI glow, no robotic interface, no extra fingers, no broken hands, no fake captions, no watermark, no perfect corporate stock-photo look.
```

## Prompts por escena

### Escena 1 — Problema: desorden manual

Objetivo visual: mostrar el “antes”. Debe verse como una persona intentando organizar sus cuentas con papeles, planilla y pizarra física.

```text
Vertical 9:16 realistic lifestyle photograph.

A warm home-office desk in natural morning light, slightly messy and very relatable. The desk is full of scattered receipts, loose bills, handwritten notes, a notebook open with calculations, a simple calculator, pens, sticky notes and a generic laptop in the background showing a blurred spreadsheet with rows and columns.

On the left side of the scene, include a physical whiteboard with many handwritten personal-finance calculations, arrows, crossed-out amounts, monthly totals and reminders. The handwriting should look real and messy, but not readable in detail. The whiteboard should communicate financial confusion and manual organization.

The laptop must be generic, with no visible brand. The spreadsheet should be softly blurred and not readable. No bank logos, no credit card logos, no app logos, no people, no faces.

The scene should feel disorganized but not dramatic: everyday financial clutter, warm, human, realistic, calm tension. Use soft shadows, warm natural light, shallow depth of field, and realistic textures on paper, wood and objects.

Do not generate any readable text, captions, slogans or watermarks.

Style: realistic photography, cozy home desk, warm natural light, 35mm lens look, shallow depth of field, imperfect real-life composition.
Aspect ratio: 9:16.
```

Refuerzo si el resultado sale demasiado prolijo:

```text
Make it look like a real candid photo, not a polished stock image. Slightly imperfect framing, natural shadows, papers overlapping, receipts at different angles, realistic desk clutter, warm sunlight, subtle dust and paper texture. The mood is “I’m trying to organize my finances manually” before discovering a simpler app.
```

### Escena 2 — Aparece Nivva

Objetivo visual: presentar Nivva como una alternativa clara y ordenada al desorden anterior. Esta escena funciona mejor si el celular o la pantalla aparece como protagonista, con una composición simple y realista.

```text
Vertical 9:16 realistic lifestyle product photograph.

A modern smartphone standing upright on a warm minimal wooden desk, slightly below the center of the frame. The scene should feel like a real home desk in warm natural light, calm, simple and human.

On the phone screen, use the attached Nivva reference image as the visual source of truth. Preserve the Nivva brand, teal identity, real app layout, component hierarchy and overall screen structure: top brand/header area, monthly selector, debt/payment rows, status badges, toggles, bottom navigation and summary cards for pending and paid amounts.

Replace every personal or sensitive value from the reference image with invented data. Do not copy exact names, creditor labels, amounts, dates, balances or identifiers from the reference. The invented data must stay internally consistent across the whole interface: the selected month, row dates, paid/pending/vencido states, row amounts, totals and summary cards should all match logically.

Use fictional values such as a selected month like “Mayo 2026”, rows such as “Alquiler”, “Internet”, “Seguro”, “Curso” or “Celular”, invented due dates and invented amounts. If the screen shows totals, they must equal the visible fictional rows and preserve a realistic Argentine peso format. Keep Nivva branding visible, but do not show bank logos, credit card brands, QR codes, account numbers, real private data, browser controls or address bar.

The background should be softly blurred with subtle everyday desk objects like a notebook or mug. No people, no faces, no watermark, no extra marketing text outside the phone.

Style: realistic photography, warm natural light, shallow depth of field, premium but simple, calm composition.
Aspect ratio: 9:16.
```

Variante desktop:

```text
Vertical 9:16 realistic home-office product photo.

A generic unbranded desktop computer or all-in-one monitor placed on the right side of a warm wooden desk. The computer screen should adapt the attached Nivva reference image into a desktop presentation while preserving the Nivva brand, teal identity, layout logic, monthly selector, debt/payment rows, status badges, toggles, navigation structure and pending/paid summary cards. It should look like the same Nivva interface shown in the reference, not a generic finance dashboard.

Replace every personal or sensitive value with invented data. Do not copy exact names, creditor labels, amounts, dates, balances or identifiers from the reference image. Keep all fictional values internally consistent across row amounts, row states, selected month, totals and summary cards. Do not include bank logos, credit card brands, QR codes, account numbers, private data, visible hardware brands or browser/address-bar chrome.

The scene must be different from the smartphone scene: different angle, different props and more desk depth. Use warm natural light, a neutral wall, a small plant, notebook, keyboard, mouse and mug. Keep it calm, organized and human. No visible hardware brands. No bank logos. No extra generated text outside the screen.
Aspect ratio: 9:16.
```

### Escena 3 — Uso real de Nivva

Objetivo visual: mostrar la funcionalidad real con una escena humana: una persona usando Nivva y viendo la pantalla de deudas con pendiente y pagado.

```text
Vertical 9:16 realistic lifestyle product photograph.

A person sitting near a warm home desk and holding a modern smartphone with the Nivva app open. Do not show the person's face; frame the image from the shoulders down or from behind, showing only hands, sweater/torso, jeans and part of the desk. The phone should be the main focal point, held naturally in one hand, slightly angled toward the camera.

On the phone screen, show the Nivva debts view clearly. Use teal #3D8F8F, cream #F2EDE8, white surfaces, rounded cards and soft dividers. The UI should show a monthly debts list with simple status badges for paid and overdue/pending items, plus two summary cards near the bottom: one for pending amount and one for paid amount. The screen should look like a real mobile-first web app, not a generic finance mockup.

The environment should be calm, organized and realistic: warm wooden desk, soft natural light, blurred notebook, pen, mug, plant or papers in the background. Keep the mood useful and relaxed, not emotional or dramatic.

Do not show browser address bar, Safari/Chrome controls or screenshot chrome. No bank logos, no credit card logos, no QR codes, no private data, no extra captions outside the phone, no watermark. Avoid distorted hands, extra fingers or warped phone screen.

Style: realistic lifestyle photography, warm natural light, shallow depth of field, premium but everyday, calm personal finance moment.
Aspect ratio: 9:16.
```

Refuerzo si la pantalla no se entiende:

```text
Keep the phone screen sharp and readable. The key visual hierarchy must be visible: debt rows, paid/overdue status indicators, pending summary card, paid summary card, and teal bottom navigation. The screen should resemble the real Nivva debts view, with clear pending vs paid separation.
```

Variante si se quiere priorizar captura real:

```text
Use the real Nivva debts screenshot as the phone screen reference. Preserve the layout: teal header, debts title, monthly selector, debt rows, paid/vencido badges, toggles, bottom navigation, yellow pending card and green paid card. Integrate it naturally into a realistic hand-held smartphone scene without browser chrome.
```

### Escena 4 — Cierre: logo de Nivva

Objetivo visual: cierre simple, premium y limpio. Debe funcionar como transición final de marca.

```text
Vertical 9:16 realistic branded end-transition image.

Use the Nivva logo as the main focal point. Preserve the logo’s geometric shape and teal identity. Create a clean, elegant end card that feels calm, modern and minimal, suitable as the final transition of a social media reel for a personal finance app.

Place the logo prominently near the center with subtle depth, soft lighting and a warm cream-toned background with gentle teal accents. Add a soft blurred tabletop or abstract minimal setting so it feels premium and cohesive with the previous warm desk scenes, but keep it visually simpler than the earlier scenes.

No people. No extra logos. No generated text. Leave breathing room around the logo so it works well for fade-out or outro animation.

Aspect ratio: 9:16.
```

## Prompts para imagen a video

### Animación general por escena

Usar cuando se quiera convertir una imagen individual en clip.

```text
Animate this vertical 9:16 image into a short realistic product promo clip.

Use a slow camera push-in, subtle handheld movement and warm natural lighting. Keep the main subject stable and natural. Do not distort the smartphone screen. Do not add new objects. Do not add text. Keep the movement calm, premium and minimal.

Duration: 4 seconds.
Aspect ratio: 9:16.
```

### Transición desde desorden hacia Nivva

Usar entre la escena 1 y la escena 2.

```text
Create a vertical 9:16 realistic transition video between the two reference images.

Start with the cluttered desk scene: scattered receipts, calculator, notebook, whiteboard and blurred spreadsheet. Use a slow push-in across the papers, as if the camera is searching for clarity. Keep the warm natural light and realistic desk textures.

Then transition smoothly into the smartphone scene with the Nivva app open on a clean warm desk. The transition should feel like moving from manual confusion to visual organization. Use a soft dissolve or match-cut based on the warm desk tones and teal accents.

No new text, no logos except Nivva inside the app, no dramatic effects, no futuristic glow, no distorted UI.

Duration: 4 to 5 seconds.
Camera motion: slow push-in, soft dissolve, stable final frame.
Mood: calm, practical, organized.
Aspect ratio: 9:16.
```

### Transición desde persona usando la app hacia logo

Usar entre la escena 3 y la escena 4.

```text
Create a vertical 9:16 realistic transition video using the two reference images.

Start with the person sitting near a warm home desk, holding a smartphone with the Nivva app open. The mood is calm, organized and realistic. Slowly push in toward the smartphone screen with a soft handheld camera movement. Keep the warm natural light, shallow depth of field and cozy desk atmosphere.

As the camera approaches the phone screen, create a smooth transition where the teal elements of the app subtly expand and dissolve into the final Nivva logo scene. The transition should feel elegant and minimal, like the app experience resolving into the brand identity.

End on the teal Nivva logo floating or centered in a warm cream minimalist environment. Add a very subtle slow zoom out or gentle floating motion to the logo. Keep the background soft, premium and calm.

No people faces. No extra text. No generated captions. No bank logos. No exaggerated effects. No futuristic holograms.

Duration: 4 to 5 seconds.
Camera motion: slow push-in from phone, soft dissolve into logo, slight logo float at the end.
Mood: calm, clear, organized, personal finance made simple.
Aspect ratio: 9:16.
```

Versión corta si el generador responde mejor a prompts simples:

```text
Create a vertical 9:16 realistic transition video between the two reference images. Begin with the person holding the phone showing the Nivva app. Slowly zoom into the phone screen. The teal app color softly expands and dissolves into the final scene with the Nivva logo floating on a warm cream minimalist background. Keep the motion smooth, calm and premium. Warm natural light, soft depth of field, no faces, no extra text, no logos other than Nivva, no futuristic effects. End with a subtle floating motion and slow zoom on the logo.
```

## Prompt para música o ambiente opcional

Usar solo si se decide generar música o ambiente. No usar voz.

```text
Create a short instrumental background track for a calm, modern product reel.

Mood: warm, simple, focused and optimistic.
Style: minimal electronic acoustic, soft beat, no vocals, no lyrics, no dramatic buildup.
Duration: 18 seconds.
The music should support a clean personal productivity app, not feel like a bank ad or a luxury commercial.
```

## Edición en Instagram Edits

1. Crear un proyecto vertical 9:16.
2. Importar los clips generados.
3. Ordenar los clips así:
   - escritorio con papeles, planilla y pizarra;
   - celular o pantalla con Nivva;
   - persona usando Nivva;
   - cierre con logo.
4. Cortar cada clip a 3–5 segundos.
5. No agregar textos en pantalla para esta versión.
6. Agregar música instrumental suave.
7. No agregar voz IA.
8. Exportar y revisar que se entienda visualmente sin audio.

## Checklist antes de publicar

- [ ] El reel se entiende sin sonido.
- [ ] No aparecen datos reales.
- [ ] No aparecen marcas de bancos o tarjetas.
- [ ] No se usan pantallas viejas como protagonista.
- [ ] El caption está en registro “vos”.
- [ ] No se promete salir de deudas ni mejorar finanzas.
- [ ] La estética se mantiene simple, clara y humana.
- [ ] La escena 1 muestra desorden sin dramatizar.
- [ ] La nueva vista aparece al menos una vez con la interfaz y marca de Nivva, usando datos ficticios consistentes y sin datos personales reales.
- [ ] El cierre muestra el logo de Nivva.
- [ ] No se generó voz IA.
