import { describe, expect, it } from 'vitest'
import {
    correctServer,
    currentGame,
    ends,
    games,
    newMatch,
    nextGame,
    removePoint,
    restart,
    server,
    undo
} from '../../src/scoring/match'
import { play, winGame } from './helpers'

describe('removing a point', () => {
    it("takes back the player's last point", () => {
        const match = removePoint(play(newMatch(), 'AABA'), 'A')
        expect(currentGame(match).score).toEqual({ A: 2, B: 1 })
    })

    it('does nothing when neither player has scored in the first game', () => {
        const match = newMatch()
        expect(removePoint(match, 'A')).toBe(match)
    })

    it('does nothing when the player has no points but the other player has', () => {
        const match = play(winGame(newMatch(), 'A'), 'BBB')
        expect(removePoint(match, 'A')).toBe(match)
    })

    it('can take back the winning point before moving to the next game', () => {
        const match = removePoint(play(newMatch(), 'A'.repeat(11)), 'A')
        expect(currentGame(match)).toMatchObject({ score: { A: 10, B: 0 }, winner: null })
    })
})

describe('removing a point at 0-0 after a game', () => {
    it('reopens the previous game without its winning point, if the player won it', () => {
        const match = removePoint(winGame(play(newMatch(), 'BBB'), 'A'), 'A')
        expect(games(match)).toHaveLength(1)
        expect(currentGame(match)).toMatchObject({ score: { A: 10, B: 3 }, winner: null })
    })

    it('puts the players back at the ends of the reopened game', () => {
        const match = removePoint(winGame(newMatch(), 'A'), 'A')
        expect(ends(match).left).toBe('A')
    })

    it('does nothing if the other player won the previous game', () => {
        const match = winGame(newMatch(), 'B')
        expect(removePoint(match, 'A')).toBe(match)
    })

    it('also drops server corrections made at 0-0 in the new game', () => {
        const match = removePoint(correctServer(winGame(newMatch(), 'A'), 'A'), 'A')
        expect(match.events.filter(event => event.type !== 'point')).toEqual([])
    })
})

describe('restarting the game', () => {
    it('clears the current game back to 0-0', () => {
        const match = restart(play(winGame(newMatch(), 'A'), 'ABB'))
        expect(games(match)).toHaveLength(2)
        expect(currentGame(match).score).toEqual({ A: 0, B: 0 })
    })

    it('undoes server corrections made in that game only', () => {
        const corrected = correctServer(play(newMatch(), 'AAA'), 'A')
        expect(server(restart(corrected))).toBe('A')
        const earlier = correctServer(newMatch(), 'B')
        const nextGameRestarted = restart(play(winGame(earlier, 'A'), 'AB'))
        expect(server(nextGameRestarted)).toBe('A')
    })
})

describe('undo', () => {
    it('drops the last event', () => {
        expect(currentGame(undo(play(newMatch(), 'AB'))).score).toEqual({ A: 1, B: 0 })
    })

    it('can step back over the start of a game', () => {
        const won = play(newMatch(), 'A'.repeat(11))
        expect(undo(nextGame(won))).toEqual(won)
    })

    it('does nothing on an empty match', () => {
        const match = newMatch()
        expect(undo(match)).toBe(match)
    })
})
