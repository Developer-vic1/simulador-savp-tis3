# Motor Sinaptico de Compatibilidad Academico-Vocacional SAVP-TIS3

Demo visual 3D para representar el procesamiento interno del sistema SAVP-TIS3. La escena muestra como evidencias vocacionales, academicas, tecnicas y situacionales viajan por una red multicriterio, activan perfiles, fortalecen conexiones y llegan a una compatibilidad academico-vocacional explicable.

La demo no es un dashboard, no es un sistema administrativo y no es un reporte. Su objetivo es comunicar la logica interna del motor mediante una metafora sinaptica de propagacion de evidencias.

## Mejoras visuales y narrativas

- Red 3D organizada por capas: fuentes, indicadores, perfiles, motor, areas, carreras y resultado.
- Nodos con anillos por tipo para mejorar lectura visual: fuente, indicador, perfil, area, carrera y resultado.
- Etiquetas tipo chip con mejor contraste y abreviacion visual en nombres largos.
- Carreras visibles con nombre y porcentaje de compatibilidad.
- Conexiones diferenciadas por peso, ruta recomendada, ruta alternativa y alerta formativa.
- Particulas dosificadas por tipo de enlace para evitar saturacion visual.
- Tarjeta de explicacion por fase con datos que ingresan, procesamiento, activaciones, resultado parcial y nota de defensa.
- Mini consola interna con mensajes de procesamiento del motor.

## Modo claro y oscuro

La aplicacion inicia en modo oscuro por defecto, con fondo profundo, nodos neon y lineas brillantes para reforzar la metafora sinaptica.

Tambien incluye modo claro, pensado para presentaciones academicas con mayor contraste sobre fondo claro, colores sobrios y lineas visibles sin exceso de neon.

La preferencia de tema se guarda en `localStorage`, por lo que la demo recuerda el ultimo modo seleccionado.

## Fases del procesamiento

El simulador recorre fases narrativas del procesamiento interno:

1. Sistema en espera.
2. Activacion del cuestionario RIASEC.
3. Activacion del rendimiento LMS.
4. Activacion de la especialidad BTH.
5. Activacion del catalogo de carreras.
6. Activacion de simulacion academico-profesional.
7. Integracion en motor multicriterio.
8. Propagacion hacia areas profesionales.
9. Activacion de carreras preliminares.
10. Recalculo posterior a simulacion.
11. Compatibilidad final.
12. Retroalimentacion y ruta recomendada.

Estas fases se agrupan en cuatro capitulos visuales:

- Capitulo 1: Entrada de evidencias.
- Capitulo 2: Construccion de perfiles.
- Capitulo 3: Integracion multicriterio.
- Capitulo 4: Compatibilidad y retroalimentacion.

## Flujo interno

El caso de demostracion corresponde a un estudiante de 4to de secundaria con BTH en Sistemas Informaticos y aspiracion hacia Ingenieria de Sistemas.

El motor integra:

- Cuestionario vocacional RIASEC.
- Rendimiento academico tipo LMS.
- Especialidad BTH.
- Catalogo de carreras.
- Simulacion academico-profesional.
- Aspiracion declarada.

La compatibilidad final usa el siguiente modelo:

```txt
Compatibilidad Final =
Cuestionario Vocacional * 0.25 +
Rendimiento Academico LMS * 0.30 +
Especialidad BTH * 0.20 +
Simulacion Academico-Profesional * 0.20 +
Aspiracion Declarada * 0.05
```

## Tecnologias

- Vite
- React
- Three.js
- 3d-force-graph
- GSAP
- d3-force-3d
- CSS moderno

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

## Comandos disponibles

```bash
npm run dev
npm run build
npm run preview
```

## Rama de trabajo

```bash
dev/simulacion
```

## Advertencia tecnica

La metafora visual es sinaptica, pero el modelo corresponde a una integracion multicriterio de evidencias. No representa una red neuronal entrenada, no ejecuta entrenamiento neuronal y no debe presentarse como inteligencia artificial predictiva entrenada.
