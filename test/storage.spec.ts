import { describe, expect, it } from 'vitest'
import { addPoint, correctServer, newMatch, nextGame } from '../src/scoring/match'
import { load, parse, save, serialize, type SavedState } from '../src/storage'

function state(overrides: Partial<SavedState> = {}): SavedState {
    let match = newMatch({ pointsToWin: 21, bestOf: 3, firstServer: 'B' })
    match = correctServer(addPoint(match, 'A'), 'A')
    return {
        gameStarted: true,
        match,
        names: { A: 'Ana', B: 'Ben' },
        firstServer: 'B',
        pointsToWin: 21,
        bestOf: 3,
        ...overrides
    }
}

/** A saved state with one field replaced by an invalid value. */
function withField(field: string, value: unknown): string {
    return JSON.stringify({ ...JSON.parse(serialize(state())), [field]: value })
}

describe('saving and reading back', () => {
    it('round-trips the whole state', () => {
        expect(parse(serialize(state()))).toEqual(state())
    })

    it('keeps every kind of event', () => {
        let match = newMatch()
        for (let i = 0; i < 11; i++) match = addPoint(match, 'B')
        match = correctServer(nextGame(match), 'A')
        expect(parse(serialize(state({ match })))?.match).toEqual(match)
    })
})

describe('ignoring saves that cannot be used', () => {
    it.each([
        ['nothing saved', null],
        ['not JSON', '{oops'],
        ['not an object', '[1, 2]'],
        ['a different version', JSON.stringify({ ...JSON.parse(serialize(state())), version: 0 })],
        ['no version', JSON.stringify(state())],
        ['gameStarted not a boolean', withField('gameStarted', 'yes')],
        ['names missing', withField('names', undefined)],
        ['a name not a string', withField('names', { A: 'Ana', B: 7 })],
        ['an unknown player', withField('firstServer', 'C')],
        ['unsupported points per game', withField('pointsToWin', 15)],
        ['unsupported best of', withField('bestOf', 4)],
        ['match settings missing', withField('match', { events: [] })],
        ['events not a list', withField('match', { settings: newMatch().settings, events: {} })],
        [
            'an unknown event',
            withField('match', { settings: newMatch().settings, events: [{ type: 'let' }] })
        ],
        [
            'a point for nobody',
            withField('match', { settings: newMatch().settings, events: [{ type: 'point' }] })
        ]
    ])('%s', (_, json) => {
        expect(parse(json)).toBeNull()
    })
})

describe('when storage is unavailable', () => {
    const broken = {
        getItem(): string | null {
            throw new Error('blocked')
        },
        setItem(): void {
            throw new Error('full')
        }
    }

    it('loads nothing instead of failing', () => {
        expect(load(broken)).toBeNull()
    })

    it('saves nothing instead of failing', () => {
        expect(() => save(state(), broken)).not.toThrow()
    })
})

describe('load and save', () => {
    it('use the same place', () => {
        const store = new Map<string, string>()
        const storage = {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => {
                store.set(key, value)
            }
        }
        save(state(), storage)
        expect(load(storage)).toEqual(state())
    })
})
