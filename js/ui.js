class UI {
    constructor() {
        this.elements = {
            potAmount: document.getElementById('pot-amount'),
            phaseIndicator: document.getElementById('phase-indicator'),
            communityCards: document.getElementById('community-cards'),
            playerCards: document.getElementById('player-cards'),
            cpuCards: document.getElementById('cpu-cards'),
            playerChips: document.getElementById('player-chips'),
            cpuChips: document.getElementById('cpu-chips'),
            playerBet: document.getElementById('player-bet'),
            cpuBet: document.getElementById('cpu-bet'),
            playerAction: document.getElementById('player-action'),
            cpuAction: document.getElementById('cpu-action'),
            handEvaluation: document.getElementById('hand-evaluation'),
            logEntries: document.getElementById('log-entries'),
            gameMessage: document.getElementById('game-message'),
            betSlider: document.getElementById('bet-slider'),
            sliderValue: document.getElementById('slider-value')
        };
    }

    updatePot(pot) {
        this.elements.potAmount.textContent = pot;
    }

    updatePhase(phase) {
        const phaseNames = {
            'preflop': 'Pre-Flop',
            'flop': 'Flop',
            'turn': 'Turn',
            'river': 'River',
            'showdown': 'Showdown'
        };
        this.elements.phaseIndicator.textContent = `Fase: ${phaseNames[phase] || phase}`;
    }

    renderCards(containerId, cards, hideSecond = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');

            if (hideSecond && index === 1) {
                cardEl.classList.add('back');
                cardEl.textContent = '🂠';
            } else {
                const isRed = isRedSuit(card.suit);
                cardEl.classList.add(isRed ? 'red' : 'black');
                cardEl.textContent = `${card.value}${card.suit}`;
            }

            container.appendChild(cardEl);
        });

        if (window.pokerAudio && cards.length > 0) {
            window.pokerAudio.playCardDeal();
        }
    }

    renderCommunityCards(cards) {
        const container = this.elements.communityCards;
        container.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');

            if (i < cards.length) {
                const card = cards[i];
                const isRed = isRedSuit(card.suit);
                cardEl.classList.add(isRed ? 'red' : 'black');
                cardEl.textContent = `${card.value}${card.suit}`;
            } else {
                cardEl.classList.add('placeholder');
                cardEl.textContent = '🂠';
            }

            container.appendChild(cardEl);
        }

        if (window.pokerAudio && cards.length > 0) {
            window.pokerAudio.playCardDeal();
        }
    }

    updatePlayerInfo(player, isCpu = false) {
        const chipsEl = isCpu ? this.elements.cpuChips : this.elements.playerChips;
        const betEl = isCpu ? this.elements.cpuBet : this.elements.playerBet;
        
        chipsEl.textContent = player.chips;
        betEl.textContent = player.currentBet;
    }

    updateControls(gameState) {
        const { phase, currentBet, pot, player, cpu, isPlayerTurn } = gameState;
        
        const btnCheck = document.getElementById('btn-check');
        const btnCall = document.getElementById('btn-call');
        const btnRaise = document.getElementById('btn-raise');
        const btnAllIn = document.getElementById('btn-allin');
        const btnFold = document.getElementById('btn-fold');

        if (!isPlayerTurn || phase === 'showdown') {
            this.disableAllButtons();
            return;
        }

        const callAmount = currentBet - player.currentBet;
        const minRaise = currentBet + 10;

        // Check
        if (callAmount === 0) {
            btnCheck.disabled = false;
            btnCall.disabled = true;
        } else {
            btnCheck.disabled = true;
            btnCall.disabled = callAmount > player.chips;
        }

        // Raise
        btnRaise.disabled = player.chips <= callAmount || minRaise > player.chips + player.currentBet;

        // All-in
        btnAllIn.disabled = player.chips === 0;

        // Fold
        btnFold.disabled = false;

        // Update slider
        this.elements.betSlider.min = minRaise;
        this.elements.betSlider.max = player.chips + player.currentBet;
        this.elements.betSlider.value = minRaise;
        this.elements.sliderValue.textContent = minRaise;
    }

    disableAllButtons() {
        const buttons = ['btn-check', 'btn-call', 'btn-raise', 'btn-allin', 'btn-fold'];
        buttons.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
    }

    showAction(player, action, amount = 0) {
        const isCpu = player.name === 'CPU';
        const actionEl = isCpu ? this.elements.cpuAction : this.elements.playerAction;
        
        let actionText = action;
        if (amount > 0) {
            actionText += ` $${amount}`;
        }
        
        actionEl.textContent = actionText;

        // Play procedural audio
        if (window.pokerAudio) {
            if (action.includes('Check')) window.pokerAudio.playCheck();
            else if (action.includes('Fold')) window.pokerAudio.playFold();
            else if (action.includes('Call') || action.includes('Raise') || action.includes('All-in')) window.pokerAudio.playChipBet();
        }
        
        // Add to log
        this.addLogEntry(`${player.name}: ${action}${amount > 0 ? ` $${amount}` : ''}`, !isCpu);
    }

    showHandEvaluation(evaluation) {
        this.elements.handEvaluation.textContent = `Mejor mano: ${evaluation.name}`;
    }

    showGameMessage(message, duration = 0) {
        this.elements.gameMessage.textContent = message;
        this.elements.gameMessage.classList.add('show');
        
        if (message.includes('Ganas') || message.includes('ganador')) {
            if (window.pokerAudio) window.pokerAudio.playWin();
        }

        if (duration > 0) {
            setTimeout(() => {
                this.hideGameMessage();
            }, duration);
        }
    }

    hideGameMessage() {
        this.elements.gameMessage.classList.remove('show');
    }

    addLogEntry(message, isPlayer = false) {
        const entry = document.createElement('div');
        entry.classList.add('log-entry');
        entry.classList.add(isPlayer ? 'player-action' : 'cpu-action');
        entry.textContent = message;
        
        this.elements.logEntries.appendChild(entry);
        this.elements.logEntries.scrollTop = this.elements.logEntries.scrollHeight;
    }

    clearLog() {
        this.elements.logEntries.innerHTML = '';
    }

    resetUI() {
        this.elements.potAmount.textContent = '0';
        this.elements.phaseIndicator.textContent = 'Fase: Pre-Flop';
        this.elements.playerBet.textContent = '0';
        this.elements.cpuBet.textContent = '0';
        this.elements.playerAction.textContent = '-';
        this.elements.cpuAction.textContent = '-';
        this.elements.handEvaluation.textContent = '';
        this.clearLog();
        this.hideGameMessage();
        this.disableAllButtons();
        
        // Reset cards
        this.renderCards('player-cards', [], false);
        this.renderCards('cpu-cards', [], true);
        this.renderCommunityCards([]);
    }

    updateSlider(value) {
        this.elements.sliderValue.textContent = value;
    }
}