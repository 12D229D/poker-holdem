document.addEventListener('DOMContentLoaded', function() {
    const game = new PokerGame();

    // Botones de acción del jugador
    document.getElementById('btn-check').addEventListener('click', () => {
        game.handleAction(game.player, 'check');
    });

    document.getElementById('btn-call').addEventListener('click', () => {
        game.handleAction(game.player, 'call', game.currentBet - game.player.currentBet);
    });

    document.getElementById('btn-raise').addEventListener('click', () => {
        const raiseAmount = parseInt(document.getElementById('bet-slider').value);
        game.handleAction(game.player, 'raise', raiseAmount);
    });

    document.getElementById('btn-allin').addEventListener('click', () => {
        game.handleAction(game.player, 'allin');
    });

    document.getElementById('btn-fold').addEventListener('click', () => {
        game.handleAction(game.player, 'fold');
    });

    // Slider de apuesta
    document.getElementById('bet-slider').addEventListener('input', (e) => {
        game.ui.updateSlider(e.target.value);
    });

    // Botones de control del juego
    document.getElementById('btn-new-hand').addEventListener('click', () => {
        game.startNewHand();
    });

    document.getElementById('btn-reset-game').addEventListener('click', () => {
        game.resetGame();
        game.startNewHand();
    });
});