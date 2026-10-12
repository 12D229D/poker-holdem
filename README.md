# Poker Hold'em

Un juego de póker Texas Hold'em para un jugador contra la computadora (CPU), implementado en HTML5, CSS3 y JavaScript puro.

## 🎮 Características

- **Texas Hold'em**: Juego completo con todas las fases (Preflop, Flop, Turn, River, Showdown)
- **Contra la CPU**: Inteligencia artificial con decisiones basadas en probabilidades y fuerza de mano
- **Sistema de Apuestas**: Check, Call, Raise, All-In y Fold con fichas simuladas
- **1000 fichas iniciales**: Empieza con $1000 y juega hasta que uno quede sin fichas
- **Evaluación de manos**: Sistema completo que reconoce todas las manos del póker (Pareja, Doble Pareja, Trío, Escalera, Color, Full House, Póker, Escalera de Color, Escalera Real)
- **Diseño Responsive**: Adaptado para escritorio y móviles

## 🚀 Cómo jugar

1. Abre el archivo `index.html` en tu navegador web
2. Haz clic en "Nueva Mano" para comenzar
3. El juego te repartirá dos cartas (Preflop)
4. Toma decisiones usando los botones: **Check, Call, Raise, All-In, Fold**
5. La CPU tomará sus decisiones automáticamente
6. Avanza por las fases: Preflop → Flop → Turn → River → Showdown
7. Gana fichas y ¡intenta dejar sin fondos a la CPU!

## 📂 Estructura del proyecto

```
poker-holdem/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos del juego
├── js/
│   ├── main.js         # Punto de entrada
│   ├── game.js         # Lógica principal del juego
│   ├── poker.js        # Evaluación de manos y reglas
│   ├── player.js       # Gestión de jugadores
│   ├── ai.js           # Inteligencia artificial CPU
│   └── ui.js           # Renderizado de la interfaz
└── README.md           # Este archivo
```

## 🛠️ Tecnologías

- HTML5
- CSS3 (Flexbox, Grid, Animaciones)
- JavaScript (ES6+ Classes)

## 🎯 Reglas del juego

### Objetivo
Ganar el bote (pot) teniendo la mejor mano de 5 cartas o haciendo que el oponente se retire (fold).

### Fases del juego
1. **Preflop**: Se reparten 2 cartas a cada jugador
2. **Flop**: 3 cartas comunitarias se revelan
3. **Turn**: 1 carta comunitaria adicional
4. **River**: 1 carta comunitaria más (total 5)
5. **Showdown**: Se comparan las mejores manos de 5 cartas

### Jerarquía de manos (de mayor a menor)
1. Escalera Real (Royal Flush)
2. Escalera de Color (Straight Flush)
3. Póker (Four of a Kind)
4. Full House
5. Color (Flush)
6. Escalera (Straight)
7. Trío (Three of a Kind)
8. Doble Pareja (Two Pair)
9. Pareja (One Pair)
10. Carta Alta (High Card)

## 📝 Notas

- No se requiere servidor, es un juego completamente del lado del cliente
- Compatible con Chrome, Firefox, Safari y Edge
- Las fichas son virtuales y no tienen valor monetario real

## 🏆 Créditos

Desarrollado con ❤️ para practicar JavaScript y HTML5.
