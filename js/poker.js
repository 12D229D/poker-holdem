const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const CARD_RANKS = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const HAND_RANKS = {
    HIGH_CARD: 1,
    PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9,
    ROYAL_FLUSH: 10
};

const HAND_RANK_NAMES = {
    [HAND_RANKS.HIGH_CARD]: 'Carta Alta',
    [HAND_RANKS.PAIR]: 'Pareja',
    [HAND_RANKS.TWO_PAIR]: 'Doble Pareja',
    [HAND_RANKS.THREE_OF_A_KIND]: 'Trío',
    [HAND_RANKS.STRAIGHT]: 'Escalera',
    [HAND_RANKS.FLUSH]: 'Color',
    [HAND_RANKS.FULL_HOUSE]: 'Full House',
    [HAND_RANKS.FOUR_OF_A_KIND]: 'Póquer',
    [HAND_RANKS.STRAIGHT_FLUSH]: 'Escalera de Color',
    [HAND_RANKS.ROYAL_FLUSH]: 'Escalera Real'
};

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        for (const suit of SUITS) {
            for (const value of VALUES) {
                this.cards.push({ suit, value, rank: CARD_RANKS[value] });
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(count = 1) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (this.cards.length === 0) break;
            drawn.push(this.cards.pop());
        }
        return count === 1 ? drawn[0] : drawn;
    }

    get size() {
        return this.cards.length;
    }
}

class PokerHandEvaluator {
    static evaluate(cards) {
        if (!cards || cards.length < 5) return { rank: 0, tiebreakers: [], name: 'Mano inválida' };

        const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);

        const isFlush = this.checkFlush(cards);
        const isStraight = this.checkStraight(sortedCards);
        const rankGroups = this.groupByRank(sortedCards);
        const rankCounts = Object.values(rankGroups).sort((a, b) => b.length - a.length);

        let handRank = HAND_RANKS.HIGH_CARD;
        let tiebreakers = sortedCards.slice(0, 5).map(c => c.rank);

        if (isFlush && isStraight) {
            if (sortedCards[0].rank === 14) {
                handRank = HAND_RANKS.ROYAL_FLUSH;
            } else {
                handRank = HAND_RANKS.STRAIGHT_FLUSH;
            }
            tiebreakers = [sortedCards[0].rank];
        } else if (rankCounts[0].length === 4) {
            handRank = HAND_RANKS.FOUR_OF_A_KIND;
            tiebreakers = [
                rankCounts[0][0].rank,
                ...rankCounts.slice(1).flat().slice(0, 1).map(c => c.rank)
            ];
        } else if (rankCounts[0].length === 3 && rankCounts[1].length >= 2) {
            handRank = HAND_RANKS.FULL_HOUSE;
            tiebreakers = [rankCounts[0][0].rank, rankCounts[1][0].rank];
        } else if (isFlush) {
            handRank = HAND_RANKS.FLUSH;
            const flushCards = this.getFlushCards(cards);
            tiebreakers = flushCards.map(c => c.rank);
        } else if (isStraight) {
            handRank = HAND_RANKS.STRAIGHT;
            tiebreakers = [this.getStraightHigh(sortedCards)];
        } else if (rankCounts[0].length === 3) {
            handRank = HAND_RANKS.THREE_OF_A_KIND;
            tiebreakers = [
                rankCounts[0][0].rank,
                ...rankCounts.slice(1).flat().slice(0, 2).map(c => c.rank)
            ];
        } else if (rankCounts[0].length === 2 && rankCounts[1].length === 2) {
            handRank = HAND_RANKS.TWO_PAIR;
            tiebreakers = [
                Math.max(rankCounts[0][0].rank, rankCounts[1][0].rank),
                Math.min(rankCounts[0][0].rank, rankCounts[1][0].rank),
                ...rankCounts.slice(2).flat().slice(0, 1).map(c => c.rank)
            ];
        } else if (rankCounts[0].length === 2) {
            handRank = HAND_RANKS.PAIR;
            tiebreakers = [
                rankCounts[0][0].rank,
                ...rankCounts.slice(1).flat().slice(0, 3).map(c => c.rank)
            ];
        }

        return {
            rank: handRank,
            tiebreakers: tiebreakers,
            name: HAND_RANK_NAMES[handRank]
        };
    }

    static groupByRank(cards) {
        const groups = {};
        for (const card of cards) {
            if (!groups[card.rank]) groups[card.rank] = [];
            groups[card.rank].push(card);
        }
        return groups;
    }

    static checkFlush(cards) {
        const suitCounts = {};
        for (const card of cards) {
            if (!suitCounts[card.suit]) suitCounts[card.suit] = 0;
            suitCounts[card.suit]++;
        }
        return Object.values(suitCounts).some(count => count >= 5);
    }

    static getFlushCards(cards) {
        const suitGroups = {};
        for (const card of cards) {
            if (!suitGroups[card.suit]) suitGroups[card.suit] = [];
            suitGroups[card.suit].push(card);
        }
        
        for (const suit in suitGroups) {
            if (suitGroups[suit].length >= 5) {
                return suitGroups[suit].sort((a, b) => b.rank - a.rank).slice(0, 5);
            }
        }
        return [];
    }

    static checkStraight(cards) {
        const uniqueRanks = [...new Set(cards.map(c => c.rank))].sort((a, b) => b - a);
        
        if (uniqueRanks.includes(14) && uniqueRanks.includes(5)) {
            const aceLowRanks = [5, 4, 3, 2, 1];
            let hasAceLowStraight = true;
            for (const rank of aceLowRanks) {
                if (!uniqueRanks.includes(rank === 1 ? 14 : rank)) {
                    hasAceLowStraight = false;
                    break;
                }
            }
            if (hasAceLowStraight) return true;
        }
        
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
                return true;
            }
        }
        
        return false;
    }

    static getStraightHigh(cards) {
        const uniqueRanks = [...new Set(cards.map(c => c.rank))].sort((a, b) => b - a);
        
        if (uniqueRanks.includes(14) && uniqueRanks.includes(5)) {
            const aceLowRanks = [5, 4, 3, 2, 1];
            let hasAceLowStraight = true;
            for (const rank of aceLowRanks) {
                if (!uniqueRanks.includes(rank === 1 ? 14 : rank)) {
                    hasAceLowStraight = false;
                    break;
                }
            }
            if (hasAceLowStraight) return 5;
        }
        
        for (let i = 0; i <= uniqueRanks.length - 5; i++) {
            if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
                return uniqueRanks[i];
            }
        }
        
        return uniqueRanks[0];
    }

    static compareHands(hand1, hand2) {
        if (hand1.rank > hand2.rank) return 1;
        if (hand1.rank < hand2.rank) return -1;
        
        for (let i = 0; i < Math.min(hand1.tiebreakers.length, hand2.tiebreakers.length); i++) {
            if (hand1.tiebreakers[i] > hand2.tiebreakers[i]) return 1;
            if (hand1.tiebreakers[i] < hand2.tiebreakers[i]) return -1;
        }
        
        return 0;
    }

    static getBestHand(playerCards, communityCards) {
        const allCards = [...playerCards, ...communityCards];
        if (allCards.length < 5) {
            return this.evaluate(allCards);
        }
        
        let bestHand = this.evaluate(allCards.slice(0, 5));
        
        if (allCards.length === 6) {
            for (let i = 0; i < allCards.length; i++) {
                const testCards = allCards.filter((_, index) => index !== i);
                const currentHand = this.evaluate(testCards);
                if (this.compareHands(currentHand, bestHand) > 0) {
                    bestHand = currentHand;
                }
            }
        } else if (allCards.length === 7) {
            for (let i = 0; i < allCards.length; i++) {
                for (let j = i + 1; j < allCards.length; j++) {
                    const testCards = allCards.filter((_, index) => index !== i && index !== j);
                    const currentHand = this.evaluate(testCards);
                    if (this.compareHands(currentHand, bestHand) > 0) {
                        bestHand = currentHand;
                    }
                }
            }
        }
        
        return bestHand;
    }
}

function getCardEmoji(card) {
    const suitMap = {
        '♠': '♠',
        '♥': '♥',
        '♦': '♦',
        '♣': '♣'
    };
    return `${card.value}${suitMap[card.suit]}`;
}

function isRedSuit(suit) {
    return suit === '♥' || suit === '♦';
}

function getCardClass(card) {
    return isRedSuit(card.suit) ? 'red' : 'black';
}