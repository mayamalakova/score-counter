import { describe, expect, it } from 'vitest'
import { ends, newMatch, server, type Match } from '../../src/scoring/match'
import { play, winGame } from './helpers'

/** Wins games alternately for A and B, so the match reaches the given game without ending. */
function reachGame(game: number, match: Match): Match {
    for (let i = 1; i < game; i++) match = winGame(match, i % 2 === 1 ? 'A' : 'B')
    return match
}

describe('ends', () => {
    it('starts with A on the left', () => {
        expect(ends(newMatch())).toEqual({ left: 'A', right: 'B' })
    })

    it('changes after each game', () => {
        expect(ends(reachGame(2, newMatch()))).toEqual({ left: 'B', right: 'A' })
        expect(ends(reachGame(3, newMatch()))).toEqual({ left: 'A', right: 'B' })
    })

    it('stays put at 5 in a game that is not the last possible one', () => {
        expect(ends(play(newMatch(), 'AAAAA')).left).toBe('A')
    })

    it('stays put until the game is over, even when it is won', () => {
        expect(ends(play(newMatch(), 'A'.repeat(11))).left).toBe('A')
    })
})

describe('ends in the deciding game', () => {
    it.each([1, 3, 5, 7] as const)('change when the first player reaches 5, best of %i', bestOf => {
        const deciding = reachGame(bestOf, newMatch({ bestOf }))
        const before = ends(deciding).left
        expect(ends(play(deciding, 'ABABABAB')).left).toBe(before)
        expect(ends(play(deciding, 'ABABABABA')).left).not.toBe(before)
    })

    it('change when the first player reaches 10 in games to 21', () => {
        const deciding = reachGame(5, newMatch({ pointsToWin: 21 }))
        expect(ends(play(deciding, 'A'.repeat(9))).left).toBe('A')
        expect(ends(play(deciding, 'A'.repeat(10))).left).toBe('B')
    })

    it('do not change the server', () => {
        const deciding = play(reachGame(5, newMatch()), 'ABABABAB')
        expect(server(play(deciding, 'A'))).toBe(server(play(deciding, 'B')))
    })
})
