import { describe, expect, it } from 'vitest'
import { correctServe, currentServe, positions } from '../../src/scoring/doubles'
import {
    ends,
    newMatch,
    removePoint,
    restart,
    undo,
    type BestOf,
    type Match,
    type PointsToWin,
    type Serve
} from '../../src/scoring/match'
import { play, player, serve, winGame } from './helpers'

function doubles(order: Serve = serve('A1', 'B1'), bestOf: BestOf = 5, pointsToWin: PointsToWin = 11) {
    return newMatch({ format: 'doubles', doublesOrder: order, bestOf, pointsToWin })
}

/** Who serves to whom before each point of `points`, e.g. 'A1>B1'. */
function servesDuring(points: string, match: Match): string[] {
    const seen: string[] = []
    for (const point of points) {
        const { server, receiver } = currentServe(match)
        seen.push(`${server}>${receiver}`)
        match = play(match, point)
    }
    return seen
}

/** Wins games alternately for A and B, so the match reaches the given game without ending. */
function reachGame(game: number, match: Match): Match {
    for (let i = 1; i < game; i++) match = winGame(match, i % 2 === 1 ? 'A' : 'B')
    return match
}

describe('a doubles player', () => {
    it('knows their team and position', () => {
        expect(player('B2')).toMatchObject({ team: 'B', position: 2 })
        expect(player('B2').id).toBe('B2')
        expect(String(player('A1'))).toBe('A1')
    })

    it('equals another object for the same player, and nobody else', () => {
        expect(player('A1').equals(player('A1'))).toBe(true)
        expect(player('A1').equals(player('A2'))).toBe(false)
        expect(player('A1').equals(player('B1'))).toBe(false)
    })

    it('has the other player in the same team as partner', () => {
        expect(['A1', 'A2', 'B1', 'B2'].map(id => player(id as 'A1').partner().id)).toEqual([
            'A2',
            'A1',
            'B2',
            'B1'
        ])
    })

    it("has the other team's first player as first opponent", () => {
        expect(player('A2').firstOpponent().id).toBe('B1')
        expect(player('B2').firstOpponent().id).toBe('A1')
    })
})

describe('a doubles match', () => {
    it('serves A first when A1 serves first', () => {
        expect(doubles().settings.firstServer).toBe('A')
        expect(doubles(serve('B2', 'A1')).settings.firstServer).toBe('B')
    })

    it('starts with the chosen server and receiver', () => {
        expect(currentServe(doubles(serve('A2', 'B1')))).toEqual(serve('A2', 'B1'))
    })
})

describe('rotation within a game', () => {
    it('goes receiver to server, server’s partner to receiver, every 2 points', () => {
        expect(servesDuring('AB'.repeat(4), doubles())).toEqual([
            'A1>B1',
            'A1>B1',
            'B1>A2',
            'B1>A2',
            'A2>B2',
            'A2>B2',
            'B2>A1',
            'B2>A1'
        ])
    })

    it('comes back to the start after four changes', () => {
        expect(currentServe(play(doubles(), 'AB'.repeat(4)))).toEqual(serve('A1', 'B1'))
    })

    it('changes every point from 10-10', () => {
        const deuce = play(doubles(), 'AB'.repeat(10))
        // 20 points: 10 changes, so back to the start plus two.
        expect(servesDuring('ABAB', deuce)).toEqual(['A2>B2', 'B2>A1', 'A1>B1', 'B1>A2'])
    })

    it('changes every 5 points in games to 21', () => {
        const match = doubles(undefined, 5, 21)
        expect(servesDuring('AB'.repeat(5), match)).toEqual([
            ...Array(5).fill('A1>B1'),
            ...Array(5).fill('B1>A2')
        ])
    })
})

describe('later games', () => {
    it('the first receiver serves first, to the player who served to them', () => {
        expect(currentServe(winGame(doubles(serve('A1', 'B2')), 'A'))).toEqual(serve('B2', 'A1'))
    })

    it('swaps back in game 3', () => {
        const match = winGame(winGame(doubles(serve('A1', 'B2')), 'A'), 'B')
        expect(currentServe(match)).toEqual(serve('A1', 'B2'))
    })

    it('does not depend on where game 1 ended in the rotation', () => {
        const match = winGame(play(doubles(), 'BBB'), 'A')
        expect(currentServe(match)).toEqual(serve('B1', 'A1'))
    })
})

describe('the last possible game', () => {
    it.each([1, 3, 5, 7] as const)('swaps the receiving order when a pair reaches 5, best of %i', bestOf => {
        const deciding = play(reachGame(bestOf, doubles(undefined, bestOf)), 'AB'.repeat(4))
        // 8 points, 4 changes: back to the game's first order.
        const before = currentServe(deciding)
        const after = currentServe(play(deciding, 'A'))
        expect(after.server.equals(before.server)).toBe(true)
        expect(after.receiver.equals(before.receiver.partner())).toBe(true)
    })

    it('swaps once, then rotates normally', () => {
        // Game 5 starts A1>B1. Five points: A1>B1, B1>A2, A2>B2, then the swap makes it A2>B1.
        const atFive = play(reachGame(5, doubles()), 'AAAAA')
        expect(currentServe(atFive)).toEqual(serve('A2', 'B1'))
        expect(servesDuring('BBBB', atFive)).toEqual(['A2>B1', 'B1>A1', 'B1>A1', 'A1>B2'])
    })

    it('does not swap in a game that is not the last possible one', () => {
        const match = play(doubles(), 'AAAA')
        expect(currentServe(play(match, 'A'))).toEqual(currentServe(match))
    })

    it('swaps at 10 in games to 21', () => {
        const deciding = reachGame(5, doubles(undefined, 5, 21))
        // Every 5 points: A1>B1, then B1>A2 from 5, A2>B2 from 10, swapped at 10 to A2>B1.
        expect(currentServe(play(deciding, 'A'.repeat(9)))).toEqual(serve('B1', 'A2'))
        expect(currentServe(play(deciding, 'A'.repeat(10)))).toEqual(serve('A2', 'B1'))
    })

    it('undoes the swap when the fifth point is taken back', () => {
        const deciding = play(reachGame(5, doubles()), 'AAAA')
        expect(currentServe(removePoint(play(deciding, 'A'), 'A'))).toEqual(currentServe(deciding))
    })
})

describe('positions', () => {
    it('puts the server and the receiver in their right half-courts', () => {
        expect(positions(doubles(serve('A1', 'B2')))).toEqual({
            A: { right: player('A1'), left: player('A2') },
            B: { right: player('B2'), left: player('B1') }
        })
    })

    it('moves players across at each change of service', () => {
        const match = play(doubles(), 'AB')
        // B1 serves to A2.
        expect(positions(match)).toEqual({
            A: { right: player('A2'), left: player('A1') },
            B: { right: player('B1'), left: player('B2') }
        })
    })

    it('keeps the pairs at their ends', () => {
        const match = winGame(doubles(), 'A')
        expect(ends(match)).toEqual({ left: 'B', right: 'A' })
    })
})

describe('correcting the serve', () => {
    it('sets who serves to whom now and rotates from there', () => {
        const match = correctServe(play(doubles(), 'AAA'), serve('A2', 'B1'))
        expect(currentServe(match)).toEqual(serve('A2', 'B1'))
        // 3 points: next change after the 4th point.
        expect(currentServe(play(match, 'A'))).toEqual(serve('B1', 'A1'))
    })

    it('records nothing when the order is already right', () => {
        const match = play(doubles(), 'AAA')
        expect(correctServe(match, currentServe(match))).toBe(match)
    })

    it('carries forward into the next game', () => {
        const match = correctServe(doubles(), serve('A2', 'B2'))
        expect(currentServe(winGame(match, 'A'))).toEqual(serve('B2', 'A2'))
    })

    it('is dropped by restarting the game', () => {
        const match = correctServe(play(doubles(), 'AA'), serve('A2', 'B2'))
        expect(currentServe(restart(match))).toEqual(serve('A1', 'B1'))
    })

    it('is dropped by undo', () => {
        const match = correctServe(play(doubles(), 'AA'), serve('A2', 'B2'))
        expect(currentServe(undo(match))).toEqual(currentServe(play(doubles(), 'AA')))
    })
})

describe('singles', () => {
    it('has no doubles order', () => {
        expect(() => currentServe(newMatch())).toThrow('Not a doubles match')
    })
})
