class PokerGame {
    constructor() {
        this.deck = new Deck();
        this.player = new Player('Jugador', 1000, true);
        this.cpu = new Player('CPU', 1000, false);
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.currentPhase = 'preflop';
        this.isPlayerTurn = true;
        this.ui = new UI();
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.dealerPosition = 0;
        this.actionCount = 0;
    }

    startNewHand() {
        this.deck.reset();
        this.player.reset();
        this.cpu.reset();
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.currentPhase = 'preflop';
        this.isPlayerTurn = true;
        this.actionCount = 0;

        this.ui.resetUI();

        this.dealCards();
        this.postBlinds();
        this.ui.updatePhase('preflop');
        this.startBettingRound();
    }

    dealCards() {
        this.player.receiveCards([this.deck.draw(), this.deck.draw()]);
        this.cpu.receiveCards([this.deck.draw(), this.deck.draw()]);

        this.ui.renderCards('player-cards', this.player.cards, false);
        this.ui.renderCards('cpu-cards', this.cpu.cards, true);
    }

    postBlinds() {
        const smallBlindPlayer = this.dealerPosition === 0 ? this.player : this.cpu;
        const bigBlindPlayer = this.dealerPosition === 0 ? this.cpu : this.player;

        // Small Blind
        const sb = Math.min(this.smallBlind, smallBlindPlayer.chips);
        smallBlindPlayer.placeBet(sb);

        // Big Blind
        const bb = Math.min(this.bigBlind, bigBlindPlayer.chips);
        bigBlindPlayer.placeBet(bb);

        this.currentBet = bb;
        this.updatePot();
        this.ui.showAction(smallBlindPlayer, `Small Blind`, sb);
        this.ui.showAction(bigBlindPlayer, `Big Blind`, bb);
    }

    startBettingRound() {
        this.actionCount = 0;
        // No resetear currentBet ni las apuestas de los jugadores para preflop
        // para preservar los ciegos ya posteados
        this.isPlayerTurn = this.dealerPosition === 0;
        this.nextTurn();
    }

    nextTurn() {
        if (this.player.isFolded && this.cpu.isFolded) {
            return;
        }

        if (this.player.isAllIn && this.cpu.isAllIn) {
            this.autoPlayToShowdown();
            return;
        }

        if (this.isPlayerTurn) {
            if (!this.player.isFolded) {
                this.ui.updateControls({
                    phase: this.currentPhase,
                    currentBet: this.currentBet,
                    pot: this.pot,
                    player: this.player,
                    cpu: this.cpu,
                    isPlayerTurn: true
                });
            } else {
                this.isPlayerTurn = false;
                this.nextTurn();
            }
        } else {
            this.ui.updateControls({
                phase: this.currentPhase,
                currentBet: this.currentBet,
                pot: this.pot,
                player: this.player,
                cpu: this.cpu,
                isPlayerTurn: false
            });

            if (!this.cpu.isFolded) {
                setTimeout(() => this.cpuTurn(), 1000);
            } else {
                this.isPlayerTurn = true;
                this.nextTurn();
            }
        }
    }

    cpuTurn() {
        const gameState = {
            phase: this.currentPhase,
            currentBet: this.currentBet,
            pot: this.pot,
            communityCards: this.communityCards,
            aiChips: this.cpu.chips,
            aiCurrentBet: this.cpu.currentBet,
            playerTotalBet: this.player.currentBet
        };

        const decision = AI.makeDecision(gameState, this.cpu.cards);
        this.handleAction(this.cpu, decision.action, decision.amount);
    }

    handleAction(player, action, amount = 0) {
        switch(action) {
            case 'check':
                this.ui.showAction(player, 'Check');
                break;
            case 'call':
                this.handleCall(player, amount);
                break;
            case 'raise':
                this.handleRaise(player, amount);
                break;
            case 'allin':
                this.handleAllIn(player);
                break;
            case 'fold':
                this.handleFold(player);
                break;
        }

        this.actionCount++;
        this.checkRoundComplete();
    }

    handleCall(player, amount) {
        const callAmount = this.currentBet - player.currentBet;
        const actualCall = Math.min(callAmount, player.chips);
        player.placeBet(actualCall);
        this.pot += actualCall;
        this.updatePot();
        this.ui.showAction(player, 'Call', actualCall);
        this.updateUI();
    }

    handleRaise(player, amount) {
        const totalRaise = amount;
        const actualRaise = totalRaise - player.currentBet;
        
        if (actualRaise > 0) {
            player.placeBet(actualRaise);
            this.currentBet = totalRaise;
            this.pot += actualRaise;
            this.updatePot();
            this.ui.showAction(player, 'Raise', actualRaise);
            this.updateUI();
            this.resetActionCount();
        }
    }

    handleAllIn(player) {
        const allInAmount = player.chips;
        player.placeBet(allInAmount);
        this.pot += allInAmount;
        
        if (player.currentBet > this.currentBet) {
            this.currentBet = player.currentBet;
        }
        
        this.updatePot();
        this.ui.showAction(player, 'All-In', allInAmount);
        this.updateUI();
        this.resetActionCount();
    }

    handleFold(player) {
        player.fold();
        this.ui.showAction(player, 'Fold');
        
        const winner = player === this.player ? this.cpu : this.player;
        winner.addChips(this.pot);
        this.ui.showGameMessage(`${winner.name} gana $${this.pot}`, 3000);
        this.pot = 0;
        this.updatePot();
        
        setTimeout(() => {
            this.endHand();
        }, 3000);
    }

    resetActionCount() {
        this.actionCount = 0;
    }

    checkRoundComplete() {
        // Si alguien se retiró, no hacer nada más (la mano ya terminó)
        if (this.player.isFolded || this.cpu.isFolded) {
            return;
        }

        // La ronda solo termina si ambos jugadores han actuado 
        // y sus apuestas coinciden con la apuesta actual
        if (this.player.currentBet === this.currentBet && 
            this.cpu.currentBet === this.currentBet &&
            this.actionCount >= 2) {
            this.advancePhase();
        } else {
            this.isPlayerTurn = !this.isPlayerTurn;
            this.nextTurn();
        }
    }

    advancePhase() {
        switch (this.currentPhase) {
            case 'preflop':
                this.dealCommunityCards(3); // Flop
                this.currentPhase = 'flop';
                break;
            case 'flop':
                this.dealCommunityCards(1); // Turn
                this.currentPhase = 'turn';
                break;
            case 'turn':
                this.dealCommunityCards(1); // River
                this.currentPhase = 'river';
                break;
            case 'river':
                this.currentPhase = 'showdown';
                this.showdown();
                return;
        }

        this.player.resetBet();
        this.cpu.resetBet();
        this.currentBet = 0;
        this.actionCount = 0;
        
        this.ui.updatePhase(this.currentPhase);
        this.ui.renderCommunityCards(this.communityCards);
        
        this.isPlayerTurn = this.dealerPosition !== 0;
        this.nextTurn();
    }

    dealCommunityCards(count) {
        for (let i = 0; i < count; i++) {
            this.communityCards.push(this.deck.draw());
        }
    }

    showdown() {
        this.ui.updatePhase('showdown');
        this.ui.renderCards('cpu-cards', this.cpu.cards, false);

        const playerHand = PokerHandEvaluator.getBestHand(this.player.cards, this.communityCards);
        const cpuHand = PokerHandEvaluator.getBestHand(this.cpu.cards, this.communityCards);

        this.ui.showHandEvaluation(playerHand);

        const comparison = PokerHandEvaluator.compareHands(playerHand, cpuHand);

        if (comparison > 0) {
            this.player.addChips(this.pot);
            this.ui.showGameMessage(`¡Ganas con ${playerHand.name}!`, 5000);
        } else if (comparison < 0) {
            this.cpu.addChips(this.pot);
            this.ui.showGameMessage(`CPU gana con ${cpuHand.name}`, 5000);
        } else {
            const splitPot = Math.floor(this.pot / 2);
            this.player.addChips(splitPot);
            this.cpu.addChips(splitPot);
            this.ui.showGameMessage(`Empate: ${playerHand.name}. Se divide el bote.`, 5000);
        }

        this.pot = 0;
        this.updatePot();
        this.updateUI();

        setTimeout(() => {
            this.endHand();
        }, 5000);
    }

    autoPlayToShowdown() {
        this.dealCommunityCards(5 - this.communityCards.length);
        this.ui.renderCommunityCards(this.communityCards);
        this.showdown();
    }

    endHand() {
        if (this.player.chips <= 0) {
            this.ui.showGameMessage('¡CPU ganó el juego!', 10000);
            setTimeout(() => location.reload(), 5000);
        } else if (this.cpu.chips <= 0) {
            this.ui.showGameMessage('¡Felicidades! Ganaste el juego.', 10000);
            setTimeout(() => location.reload(), 5000);
        }
        
        this.dealerPosition = (this.dealerPosition + 1) % 2;
    }

    updatePot() {
        this.ui.updatePot(this.pot);
    }

    updateUI() {
        this.ui.updatePlayerInfo(this.player, false);
        this.ui.updatePlayerInfo(this.cpu, true);
    }

    resetGame() {
        this.player = new Player('Jugador', 1000, true);
        this.cpu = new Player('CPU', 1000, false);
        this.dealerPosition = 0;
        this.startNewHand();
    }
}