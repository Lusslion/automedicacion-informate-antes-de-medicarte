# Automedicación: infórmate antes de medicarte

Sitio educativo de salud pública, en español y con foco en Perú. Explica con palabras simples qué es la automedicación, qué riesgos tiene, cómo usar bien los medicamentos, en qué se diferencian la gripe y el resfrío, y aclara mitos frecuentes.

**Ver el sitio:** https://lusslion.github.io/automedicacion-informate-antes-de-medicarte/

## Aviso

Este sitio es solo informativo y educativo. No indica medicamentos, dosis ni tratamientos individuales, y no reemplaza la consulta con un profesional de la salud.

En caso de intoxicación o reacción grave, ve de inmediato a emergencias.

## Fuentes oficiales

- [Organización Mundial de la Salud (OMS)](https://www.who.int/es)
- [Organización Panamericana de la Salud (OPS)](https://www.paho.org/es)
- [Ministerio de Salud del Perú (MINSA)](https://www.gob.pe/minsa)
- [DIGEMID (Perú)](https://www.digemid.minsa.gob.pe)

## Estructura

Sitio estático, sin librerías ni dependencias:

- `index.html`: la página.
- `css/estilos.css`: estilos (modo claro y oscuro).
- `js/tema.js`: aplica el tema elegido antes de mostrar la página.
- `js/main.js`: menú, sección activa, botón de tema, acordeón de mitos, autoevaluación, progreso de lectura y botón "volver arriba".
- `js/juegos.js`: los cinco juegos de la sección "Aprende jugando".
- `assets/images/`: imágenes del sitio. El cartel de portada fue generado con inteligencia artificial.

La sección **Aprende jugando** (`#juegos`) reúne cinco juegos educativos basados en el contenido del sitio: sopa de letras, memoria de parejas, ¿buen hábito o riesgo?, adivina la palabra y ¿gripe o resfrío?

La autoevaluación y los juegos no guardan ni envían ningún dato: todo ocurre en el navegador.

Para verlo en local, abre `index.html` en el navegador.

## Licencia

El contenido se publica bajo [Creative Commons Atribución 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.es). Puedes compartirlo y adaptarlo citando la fuente. Texto completo en [`LICENSE`](LICENSE).
