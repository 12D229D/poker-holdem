# Plan: poker-holdem

## Resumen
Juego de Texas Hold'em para un solo jugador contra la CPU, implementado en HTML5, CSS3 y JavaScript puro. Incluye todas las fases del juego, sistema de apuestas, evaluación de manos de póker y sintetizador de sonido procedimental Web Audio API.

## Objetivos
- Desarrollar un juego completo de Texas Hold'em (Preflop, Flop, Turn, River, Showdown).
- Implementar una IA para la CPU basada en probabilidades y fuerza de mano.
- Simular un sistema de apuestas con fichas virtuales (Check, Call, Raise, All-In, Fold).
- Evaluar todas las manos de póker (Escalera Real, Full House, etc.).
- Ofrecer una interfaz responsive para escritorio y móvil con efectos de sonido en tiempo real.

## 🏗️ Arquitectura

- **Patrón**: Aplicación web modular de página única (SPA) con separación de responsabilidades en múltiples módulos JS.

```text
poker-holdem/
├── index.html             # Estructura de la mesa de juego
├── css/styles.css         # Estilos de cartas, mesa y animaciones
├── js/
│   ├── main.js            # Punto de entrada e inicialización
│   ├── game.js            # Motor de fases del juego (Preflop→Showdown)
│   ├── poker.js           # Evaluador de manos de póker
│   ├── poker-audio.js     # Sintetizador procedural Web Audio API
│   ├── player.js          # Entidades de jugador y fichas
│   ├── ai.js              # IA del oponente (probabilidades y fuerza de mano)
│   └── ui.js              # Renderizado de la interfaz y animaciones
├── README.md              # Documentación y reglas de juego
└── plan.md
```

## 🧠 Paradigma de Programación

- **Orientado a Objetos (OOP) + Event-Driven**
- Los módulos usan **clases ES6** para modelar entidades del dominio (Player, Game, Hand, PokerAudioEngine).
- La IA del oponente encapsula decisiones en métodos de clase con lógica **imperativa** basada en probabilidades.
- La UI reacciona a eventos DOM de forma **event-driven** (click en botones de acción: Check, Call, Raise, Fold).

---

## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: `Público (Open Source / Portafolio)`.
- **Plataforma Remota Asignada**: `GitHub`.
- **Plataforma de Despliegue CI/CD**: `GitHub Pages` / `Cloudflare Pages`.
- **Justificación**: Juego de póker Texas Hold'em contra IA probabilística con Web Audio Synth procedural sin backend, ideal para showcase interactivo abierto en GitHub Pages.

---

> ⚠️ **Auditoría de UI / DESIGN.md:** La interfaz actual no cumple con las directrices visuales de [DESIGN.md](../DESIGN.md) (requiere paleta HSL, Google Fonts modernas y profundidad/glassmorphism). Pendiente refactor visual.
## Estado actual
- Estado: ✅ **Completado**
- Audio procedural en tiempo real (`poker-audio.js`) para barajar, repartir cartas, apuestas de fichas, toques de check y fanfarria de victoria.
- Inicia con 1000 fichas y juega hasta que uno quede sin ellas.

## Tareas realizadas
- [x] Asegurar que la IA del oponente tome decisiones realistas.
- [x] Pulir la lógica de apuestas y gestión de fichas.
- [x] Mejorar la interfaz de usuario con animaciones de cartas y acciones.
- [x] Implementar el sistema de evaluación de manos y determinar el ganador en el Showdown.
- [x] Añadir sonidos y efectos visuales procedimentales (Web Audio API) para mejorar la experiencia.
- [x] Realizar pruebas exhaustivas de la lógica del juego.

## Stack / Tecnologías
- HTML5, CSS3 (Flexbox/Grid, animaciones)
- JavaScript (ES6+ Classes, Web Audio API)
