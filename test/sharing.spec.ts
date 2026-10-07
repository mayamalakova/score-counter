import { describe, expect, it } from 'vitest'
import {
    decodeResult,
    encodeResult,
    resultFromHash,
    resultLink,
    type SharedResult
} from '../src/sharing/result'

function result(overrides: Partial<SharedResult> = {}): SharedResult {
    return {
        format: 'singles',
        pointsToWin: 11,
        bestOf: 5,
        names: { A: 'Ana', B: 'Ben' },
        games: [
            { A: 11, B: 8 },
            { A: 9, B: 11 },
            { A: 11, B: 6 },
            { A: 13, B: 11 }
        ],
        ...overrides
    }
}

/** Games written as '11:8 9:11' in the packed form, [[11, 8], [9, 11]]. */
function games(scores: string): number[][] {
    return scores.split(' ').map(game => game.split(':').map(Number))
}

/** Encodes raw packed data, to build links the app itself would never make. */
function packed(data: unknown): string {
    return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('a shared result', () => {
    it('reads back exactly what was shared', () => {
        expect(decodeResult(encodeResult(result()))).toEqual(result())
    })

    it('keeps doubles team names and accented letters', () => {
        const shared = result({ format: 'doubles', names: { A: 'Šťastný / Eva', B: 'Ben / Jiří' } })
        expect(decodeResult(encodeResult(shared))).toEqual(shared)
    })

    it('keeps games to 21 and other match lengths', () => {
        const shared = result({ pointsToWin: 21, bestOf: 1, games: [{ A: 19, B: 21 }] })
        expect(decodeResult(encodeResult(shared))).toEqual(shared)
    })

    it('uses only characters that are safe in a link', () => {
        expect(encodeResult(result({ names: { A: '???>>>', B: 'ÿÿÿ' } }))).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('keeps two long names in a doubles team', () => {
        const names = { A: 'Kateřina Nováková-Svobodová / Alžběta Dvořáková-Procházková', B: 'Ben / Jan' }
        const shared = result({ format: 'doubles', names })
        expect(decodeResult(encodeResult(shared))?.names).toEqual(names)
    })

    it('cuts a name too long to share rather than make a link that is refused', () => {
        const shared = result({ names: { A: 'Š'.repeat(100), B: 'Ben' } })
        expect(decodeResult(encodeResult(shared))?.names).toEqual({ A: 'Š'.repeat(80), B: 'Ben' })
    })

    it('is short enough for an easy-to-scan QR code', () => {
        expect(resultLink('https://mayas-tt-scorer.netlify.app/', result()).length).toBeLessThan(200)
    })
})

describe('the link', () => {
    it('opens the app with the result after #result=', () => {
        const link = resultLink('https://example.app/', result())
        expect(link.startsWith('https://example.app/#result=')).toBe(true)
        expect(resultFromHash(new URL(link).hash)).toEqual({ status: 'ok', result: result() })
    })

    it('is ignored when the hash is something else', () => {
        expect(resultFromHash('')).toEqual({ status: 'none' })
        expect(resultFromHash('#about')).toEqual({ status: 'none' })
    })

    it('is refused when it is a result that cannot be read', () => {
        expect(resultFromHash('#result=not-a-result')).toEqual({ status: 'unreadable' })
    })
})

describe('refusing results that cannot be used', () => {
    const valid = {
        v: 1,
        f: 's',
        p: 11,
        b: 5,
        n: ['Ana', 'Ben'],
        g: games('11:8 11:9 11:7')
    }

    it('accepts the valid example', () => {
        expect(decodeResult(packed(valid))).not.toBeNull()
    })

    it.each([
        ['not base64', '%%%'],
        ['not JSON', packed('{oops').slice(0, 5)],
        ['another version', packed({ ...valid, v: 2 })],
        ['an unknown format', packed({ ...valid, f: 'x' })],
        ['unsupported points per game', packed({ ...valid, p: 15 })],
        ['unsupported best of', packed({ ...valid, b: 4 })],
        ['one name only', packed({ ...valid, n: ['Ana'] })],
        ['an empty name', packed({ ...valid, n: ['Ana', '  '] })],
        ['a very long name', packed({ ...valid, n: ['Ana', 'x'.repeat(81)] })],
        ['no games', packed({ ...valid, g: [] })],
        ['a game that is not a pair of scores', packed({ ...valid, g: games('11:8 11 11:7') })],
        ['a negative score', packed({ ...valid, g: games('11:-1 11:9 11:7') })],
        ['a game that would not have ended there', packed({ ...valid, g: games('11:8 15:3 11:7') })],
        ['an unfinished game', packed({ ...valid, g: games('11:8 11:10 11:7') })],
        ['a match nobody has won', packed({ ...valid, g: games('11:8 11:9') })],
        ['games after the match was won', packed({ ...valid, g: games('11:8 11:9 11:7 11:5') })]
    ])('%s', (_, encoded) => {
        expect(decodeResult(encoded)).toBeNull()
    })
})
