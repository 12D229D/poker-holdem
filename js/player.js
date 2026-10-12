class Player {
    constructor(name, chips, isHuman = false) {
        this.name = name;
        this.chips = chips;
        this.isHuman = isHuman;
        this.cards = [];
        this.currentBet = 0;
        this.isFolded = false;
        this.isAllIn = false;
        this.totalWinnings = 0;
    }

    reset() {
        this.cards = [];
        this.currentBet = 0;
        this.isFolded = false;
        this.isAllIn = false;
    }

    placeBet(amount) {
        if (amount > this.chips) {
            console.warn(`${this.name} intentó apostar más de lo que tiene`);
            amount = this.chips;
        }

        this.chips -= amount;
        this.currentBet += amount;

        if (this.chips === 0) {
            this.isAllIn = true;
        }

        return amount;
    }

    addChips(amount) {
        this.chips += amount;
        this.totalWinnings += amount;
    }

    fold() {
        this.isFolded = true;
    }

    resetBet() {
        this.currentBet = 0;
    }

    getDisplayInfo() {
        return {
            name: this.name,
            chips: this.chips,
            bet: this.currentBet,
            isFolded: this.isFolded,
            isAllIn: this.isAllIn,
            cardCount: this.cards.length
        };
    }

    receiveCards(cards) {
        this.cards = cards;
    }
}