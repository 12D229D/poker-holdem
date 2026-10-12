class AI {
    static makeDecision(gameState, playerCards) {
        const { phase, currentBet, pot, communityCards, aiChips, aiCurrentBet, playerTotalBet } = gameState;
        
        const handStrength = this.evaluateHandStrength(playerCards, communityCards, phase);
        const potOdds = this.calculatePotOdds(currentBet, aiCurrentBet, pot);
        const callAmount = currentBet - aiCurrentBet;
        const isFavorable = this.isPotOddsFavorable(handStrength, potOdds);
        
        const currentBetPercentage = (currentBet / aiChips) * 100;
        
        if (phase === 'preflop') {
            return this.preflopDecision(playerCards, aiChips, currentBet, aiCurrentBet, pot, isFavorable, handStrength);
        }
        
        return this.postflopDecision(handStrength, aiChips, currentBet, aiCurrentBet, pot, isFavorable, callAmount, phase);
    }

    static preflopDecision(playerCards, aiChips, currentBet, aiCurrentBet, pot, isFavorable, handStrength) {
        const callAmount = currentBet - aiCurrentBet;
        const raiseThreshold = Math.random() * 0.2 + 0.7;
        
        if (handStrength > 0.7 && isFavorable && aiChips > callAmount * 2) {
            if (Math.random() < 0.8) {
                return { action: 'raise', amount: Math.min(currentBet + Math.floor(aiChips * 0.1), aiChips) };
            }
            return { action: 'call', amount: callAmount };
        }
        
        if (handStrength > 0.5 && isFavorable) {
            if (currentBet === 0 || callAmount <= aiChips * 0.1) {
                return { action: 'call', amount: callAmount };
            }
        }
        
        if (isFavorable && callAmount <= aiChips * 0.05) {
            return { action: 'call', amount: callAmount };
        }
        
        if (handStrength > 0.3 && isFavorable && callAmount <= aiChips * 0.15) {
            return { action: 'call', amount: callAmount };
        }
        
        if (callAmount === 0) {
            return { action: 'check', amount: 0 };
        }
        
        return { action: 'fold', amount: 0 };
    }

    static postflopDecision(handStrength, aiChips, currentBet, aiCurrentBet, pot, isFavorable, callAmount, phase) {
        const bluffChance = Math.random();
        const isBluffing = bluffChance > 0.9;
        
        if (handStrength > 0.8 && isFavorable && aiChips > callAmount * 1.5) {
            if (Math.random() < 0.7 || isBluffing) {
                const raiseAmount = Math.min(currentBet + Math.floor(pot * 0.5) + 100, aiChips);
                if (raiseAmount > callAmount) {
                    return { action: 'raise', amount: raiseAmount };
                }
            }
            if (callAmount > 0) {
                return { action: 'call', amount: callAmount };
            }
            return { action: 'check', amount: 0 };
        }
        
        if (handStrength > 0.5 && isFavorable) {
            if (callAmount === 0) {
                return { action: 'check', amount: 0 };
            }
            if (callAmount <= aiChips * 0.15) {
                return { action: 'call', amount: callAmount };
            }
        }
        
        if (isFavorable && callAmount <= aiChips * 0.08) {
            return { action: 'call', amount: callAmount };
        }
        
        if (callAmount === 0) {
            return { action: 'check', amount: 0 };
        }
        
        if (isBluffing && callAmount < aiChips * 0.2) {
            return { action: 'raise', amount: Math.min(currentBet + Math.floor(pot * 0.3), aiChips) };
        }
        
        return { action: 'fold', amount: 0 };
    }

    static evaluateHandStrength(playerCards, communityCards, phase) {
        let strength = 0;
        const allCards = [...playerCards, ...communityCards];
        
        if (phase === 'preflop') {
            const ranks = playerCards.map(c => c.rank);
            const isSuited = playerCards[0].suit === playerCards[1].suit;
            const isPair = ranks[0] === ranks[1];
            const highCard = Math.max(...ranks);
            const gap = Math.abs(ranks[0] - ranks[1]);
            
            if (isPair) {
                if (ranks[0] >= 10) strength = 0.85;
                else if (ranks[0] >= 7) strength = 0.70;
                else strength = 0.55;
            } else if (isSuited) {
                if (highCard >= 14) strength = 0.80;
                else if (highCard >= 12) strength = 0.70;
                else if (highCard >= 10) strength = 0.60;
                else strength = 0.40 + (highCard / 50);
            } else {
                if (highCard >= 13) strength = 0.75;
                else if (highCard >= 10) strength = 0.65;
                else strength = 0.35 + (highCard / 50);
            }
            
            if (gap <= 3 && !isPair) strength += 0.05;
            if (gap === 1 && !isPair) strength += 0.08;
            
            if (strength > 1) strength = 1;
            return strength;
        }
        
        const hand = communityCards.length >= 5 
            ? PokerHandEvaluator.getBestHand(playerCards, communityCards)
            : PokerHandEvaluator.evaluate(allCards);
        
        strength = hand.rank / 10;
        
        if (communityCards.length > 0) {
            const numOuts = this.calculateOuts(playerCards, communityCards);
            const remainingCards = 52 - allCards.length;
            const improvementChance = numOuts / remainingCards;
            strength += improvementChance * 0.15;
        }
        
        return Math.min(strength, 1.0);
    }

    static calculateOuts(playerCards, communityCards) {
        let outs = 0;
        const allCards = [...playerCards, ...communityCards];
        const ranks = allCards.map(c => c.rank);
        const suits = allCards.map(c => c.suit);
        
        const rankGroups = {};
        ranks.forEach(rank => {
            if (!rankGroups[rank]) rankGroups[rank] = 0;
            rankGroups[rank]++;
        });
        
        for (const rank in rankGroups) {
            if (rankGroups[rank] === 4) {
                outs += 1;
            } else if (rankGroups[rank] === 3) {
                outs += 2;
            } else if (rankGroups[rank] === 2) {
                outs += 2;
            }
        }
        
        const suitCounts = {};
        suits.forEach(suit => {
            if (!suitCounts[suit]) suitCounts[suit] = 0;
            suitCounts[suit]++;
        });
        
        for (const suit in suitCounts) {
            if (suitCounts[suit] === 4) {
                outs += 9;
            } else if (suitCounts[suit] === 3) {
                outs += 9;
            } else if (suitCounts[suit] === 2) {
                outs += 2;
            }
        }
        
        return Math.min(outs, 21);
    }

    static calculatePotOdds(currentBet, aiCurrentBet, pot) {
        const callAmount = currentBet - aiCurrentBet;
        const totalPot = pot + callAmount;
        
        if (totalPot === 0) return 0;
        
        return callAmount / totalPot;
    }

    static isPotOddsFavorable(handStrength, potOdds) {
        return handStrength > potOdds + 0.15;
    }
}