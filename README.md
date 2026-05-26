# Motor Sinaptico de Compatibilidad Academico-Vocacional SAVP-TIS3

Demo visual 3D para representar el procesamiento interno del sistema SAVP-TIS3. El objetivo es mostrar como las evidencias de un estudiante viajan, se conectan, activan criterios y fortalecen rutas hasta generar una compatibilidad de carrera.

## Tecnologias

- Vite
- React
- Three.js
- 3d-force-graph
- GSAP
- d3-force-3d
- CSS moderno

## Instalacion

```bash
npm install
npm run dev
```

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Flujo interno

El estudiante inicia en 4to de secundaria, etapa en la que se fortalece el Bachillerato Tecnico Humanistico. El motor integra el cuestionario vocacional RIASEC, rendimiento academico tipo LMS, especialidad BTH, catalogo de carreras y simulacion academico-profesional.

La compatibilidad final usa el siguiente modelo:

```txt
Compatibilidad Final =
Cuestionario Vocacional * 0.25 +
Rendimiento Academico LMS * 0.30 +
Especialidad BTH * 0.20 +
Simulacion Academico-Profesional * 0.20 +
Aspiracion Declarada * 0.05
```

El grafo activa fases desde fuentes de datos hasta perfiles, motor multicriterio, areas profesionales, carreras preliminares, compatibilidad final y retroalimentacion interna.

## Rama de trabajo

La rama objetivo del desarrollo es:

```bash
dev/simulacion
```

## Advertencia tecnica

La metafora visual es sinaptica, pero el modelo corresponde a una integracion multicriterio de evidencias. No representa una red neuronal entrenada ni afirma entrenamiento neuronal.
