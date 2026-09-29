import { describe, expect, it } from 'vitest'
import { correctServer, currentGame, games, newMatch, server } from '../../src/scoring/match'
import { play, winGame } from './helpers'

/** The server before each point of `points`, as a string, e.g. 'AABB'. */
function serversDuring(points: string, match = newMatch()): string {
    let servers = ''
    for (const point of points) {
        servers += server(match)
        match = play(match, point)
    }
    return servers
}

describe('service in a game to 11', () => {
    it('starts with the first server chosen for the match', () => {
        expect(server(newMatch())).toBe('A')
        expect(server(newMatch({ firstServer: 'B' }))).toBe('B')
    })

    it('changes every 2 points', () => {
        expect(serversDuring('ABABABAB')).toBe('AABBAABB')
    })

    it('changes every point from 10-10', () => {
        const deuce = play(newMatch(), 'AB'.repeat(10))
        expect(serversDuring('ABABAB', deuce)).toBe('ABABAB')
    })

    it('keeps changing every 2 points all the way to 10-10', () => {
        expect(serversDuring('AB'.repeat(10))).toBe('AABB'.repeat(5))
    })
})

describe('service in a game to 21', () => {
    it('changes every 5 points', () => {
        const match = newMatch({ pointsToWin: 21 })
        expect(serversDuring('AB'.repeat(10), match)).toBe('AAAAABBBBBAAAAABBBBB')
    })

    it('changes every point from 20-20', () => {
        const deuce = play(newMatch({ pointsToWin: 21 }), 'AB'.repeat(20))
        expect(serversDuring('ABAB', deuce)).toBe('ABAB')
    })
})

describe('service across games', () => {
    it('the first server of a game receives first in the next', () => {
        let match = winGame(newMatch(), 'A')
        expect(server(match)).toBe('B')
        match = winGame(match, 'A')
        expect(server(match)).toBe('A')
    })

    it('works the same when B served first in the match', () => {
        expect(server(winGame(newMatch({ firstServer: 'B' }), 'A'))).toBe('A')
    })
})

describe('correcting the server', () => {
    it('changes who serves now and keeps rotating from there', () => {
        let match = correctServer(play(newMatch(), 'AAA'), 'A')
        // 3 points played: B would serve, the correction says A.
        expect(server(match)).toBe('A')
        expect(serversDuring('ABAB', match)).toBe('ABBA')
    })

    it('records nothing when the server is already right', () => {
        const match = play(newMatch(), 'AAA')
        expect(correctServer(match, 'B')).toBe(match)
    })

    it('carries forward: the next game starts with the other player', () => {
        let match = correctServer(newMatch(), 'B')
        expect(currentGame(match).firstServer).toBe('B')
        match = winGame(match, 'A')
        expect(server(match)).toBe('A')
    })

    it('does not change the first server of earlier games', () => {
        const match = correctServer(winGame(newMatch(), 'A'), 'A')
        expect(games(match).map(game => game.firstServer)).toEqual(['A', 'A'])
        expect(server(match)).toBe('A')
    })
})
