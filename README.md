# Simulador SAVP-TIS3

Escena 3D interactiva que muestra cómo una consulta demo pasa por entradas, orquestación PETER 3, procesamiento paralelo, motor de evidencia, Bridge V2, perfiles de carrera, escenarios, tutor e integración PETER 2. La salida conserva un `traceId` y las referencias a los datos de origen.

> La metáfora visual neuronal/sináptica representa el flujo de información entre componentes del sistema y no corresponde a una red neuronal artificial.

No se entrenan modelos, no se predice la probabilidad de éxito académico ni se envían datos a Laravel. El paquete de PETER 2 es una representación local lista para inspección, no una sincronización real. El corpus incluido es pequeño y de demostración, no está verificado externamente. La recuperación usa coincidencia léxica local; no ejecuta embeddings semánticos ni FAISS. Los contadores muestran el tamaño real del corpus demo y nunca cifras ficticias de producción.

## Ejecutar

Requiere Node.js compatible con Vite 8.

```bash
npm install
npm run dev
```

En PowerShell con ejecución de scripts restringida, usar `npm.cmd` y `npx.cmd` en lugar de `npm` y `npx`.

## Flujo y arquitectura

`src/simulation/SimulationEngine.js` controla estado, fases, señales, eventos y traza. `src/processors/index.js` calcula los resultados sin depender de Three.js. `src/data/demo.js` contiene un estudiante coherente, 30 respuestas RIASEC, tres periodos académicos, doce carreras, cinco documentos y tres escenarios. `src/graph/graphModel.js` define la topología espacial. `src/components/SynapticGraph.jsx` representa el estado del motor mediante Three.js, 3d-force-graph y GSAP; no calcula recomendaciones. `src/App.jsx` dispone controles, paneles y vista textual.

El procesamiento RIASEC resta uno a cada respuesta 1–5 y suma cinco reactivos por dimensión. El código Holland toma las tres dimensiones de mayor valor. Analítica muestra notas por periodo y cambios. El motor de evidencia agrupa datos vocacionales, académicos, documentales, técnicos y situacionales. La falta de datos usa `{ status: "missing", value: null }`. Las reglas del Bridge registran `ruleId`, entradas, resultado y `traceId`; los perfiles mantienen afinidad, preparación, continuidad BTH e interés declarado por separado. Las respuestas de escenarios generan nueva evidencia y vuelven al motor antes de crear la explicación.

## Controles

- **Iniciar, Pausar/Continuar, Anterior, Siguiente y Reiniciar** controlan la ejecución.
- **Guiado** enfoca la cámara en el componente de la fase; **Exploración** permite rotar y acercar la red.
- **Auto** avanza las fases y se detiene ante los escenarios para recibir respuestas.
- La velocidad puede cambiarse entre 0.5× y 2×.
- Haz clic en nodos o enlaces para inspeccionar estado, evidencia o señales. **Ver traza** muestra eventos y el origen de las evidencias del perfil seleccionado.
- **Vista textual** resume el flujo sin depender del canvas 3D.
- `Espacio` pausa o continúa; `→` y `←` avanzan y retroceden; `Escape` cierra el panel. El modo de movimiento reducido evita viajes de cámara y partículas.

## Estados y trazabilidad

Los nodos pasan de espera a procesamiento y completado según eventos del motor. Las partículas aparecen únicamente mientras una señal registrada viaja por un enlace; al llegar se emite `SIGNAL_RECEIVED`. Cada ejecución crea un ID `SAVP-AAAA-MM-DD-NNNN`. Eventos, señales, evidencias, reglas, respuesta del tutor, paquete de integración y salida comparten ese ID. El panel de traza permite revisar el origen de cada evidencia usada por el perfil, además de la línea de tiempo.

## Verificación

```bash
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias cubren normalización RIASEC, código Holland, datos ausentes, tendencias, reglas de perfiles, escenarios, EventBus y ejecución completa. Playwright verifica inicio, fases, escenarios, salida, traza y reinicio.
