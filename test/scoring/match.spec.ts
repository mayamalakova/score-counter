import { describe, expect, it } from 'vitest'
import {
    addPoint,
    currentGame,
    games,
    gamesWon,
    matchWinner,
    newMatch,
    nextGame
} from '../../src/scoring/match'
import { play, winGame } from './helpers'

describe('a new match', () => {
    it('defaults to games to 11, best of 5, A serving first', () => {
        expect(newMatch().settings).toEqual({ pointsToWin: 11, bestOf: 5, firstServer: 'A' })
    })

    it('starts at 0-0 in the first game with no winner', () => {
        const match = newMatch()
        expect(games(match)).toEqual([{ score: { A: 0, B: 0 }, winner: null, firstServer: 'A' }])
        expect(matchWinner(match)).toBeNull()
    })
})

describe('scoring a game to 11', () => {
    it('counts points per player', () => {
        expect(currentGame(play(newMatch(), 'AAB')).score).toEqual({ A: 2, B: 1 })
    })

    it('is won at 11 with a two-point lead', () => {
        expect(currentGame(play(newMatch(), 'A'.repeat(11))).winner).toBe('A')
        expect(currentGame(play(newMatch(), 'A'.repeat(10) + 'B'.repeat(9) + 'A')).winner).toBe('A')
    })

    it('is not won at 11-10', () => {
        const match = play(newMatch(), 'A'.repeat(10) + 'B'.repeat(10) + 'A')
        expect(currentGame(match).winner).toBeNull()
    })

    it('goes on past 11 until someone leads by two', () => {
        const deuce = play(newMatch(), 'A'.repeat(10) + 'B'.repeat(10))
        expect(currentGame(play(deuce, 'ABAB')).winner).toBeNull()
        expect(currentGame(play(deuce, 'ABABBB')).winner).toBe('B')
        expect(currentGame(play(deuce, 'ABABBB')).score).toEqual({ A: 12, B: 14 })
    })

    it('ignores points once the game is won', () => {
        const won = play(newMatch(), 'A'.repeat(11))
        expect(addPoint(won, 'B')).toBe(won)
    })
})

describe('scoring a game to 21', () => {
    it('is won at 21 with a two-point lead, not at 11', () => {
        const match = newMatch({ pointsToWin: 21 })
        expect(currentGame(play(match, 'A'.repeat(11))).winner).toBeNull()
        expect(currentGame(play(match, 'A'.repeat(21))).winner).toBe('A')
        expect(currentGame(play(match, 'A'.repeat(20) + 'B'.repeat(20) + 'A')).winner).toBeNull()
    })
})

describe('moving to the next game', () => {
    it('only happens once the current game is won', () => {
        const unfinished = play(newMatch(), 'AAA')
        expect(nextGame(unfinished)).toBe(unfinished)
    })

    it('starts a new game at 0-0 and keeps the finished one', () => {
        const match = winGame(newMatch(), 'A')
        expect(games(match)).toEqual([
            { score: { A: 11, B: 0 }, winner: 'A', firstServer: 'A' },
            { score: { A: 0, B: 0 }, winner: null, firstServer: 'B' }
        ])
        expect(gamesWon(match)).toEqual({ A: 1, B: 0 })
    })
})

describe('winning the match', () => {
    it('takes 3 games in a best of 5', () => {
        let match = winGame(winGame(newMatch(), 'A'), 'A')
        expect(matchWinner(match)).toBeNull()
        match = play(match, 'A'.repeat(11))
        expect(matchWinner(match)).toBe('A')
    })

    it.each([
        [1, 1],
        [3, 2],
        [5, 3],
        [7, 4]
    ] as const)('takes %i-game matches in %i games', (bestOf, needed) => {
        let match = newMatch({ bestOf })
        for (let i = 1; i < needed; i++) match = winGame(match, 'B')
        expect(matchWinner(match)).toBeNull()
        match = play(match, 'B'.repeat(11))
        expect(matchWinner(match)).toBe('B')
    })

    it('counts games from both players', () => {
        let match = winGame(winGame(winGame(winGame(newMatch(), 'A'), 'B'), 'A'), 'B')
        expect(gamesWon(match)).toEqual({ A: 2, B: 2 })
        expect(matchWinner(match)).toBeNull()
        match = play(match, 'B'.repeat(11))
        expect(matchWinner(match)).toBe('B')
    })

    it('ends the match: no next game', () => {
        const won = play(winGame(winGame(newMatch(), 'A'), 'A'), 'A'.repeat(11))
        expect(nextGame(won)).toBe(won)
    })
})
