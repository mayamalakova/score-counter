import { describe, expect, it } from 'vitest'
import { correctService } from '../src/scoring/doubles'
import { addPoint, correctServer, newMatch, nextGame } from '../src/scoring/match'
import { DEFAULT_DOUBLES_ORDER, load, parse, save, serialize, type SavedState } from '../src/storage'

function state(overrides: Partial<SavedState> = {}): SavedState {
    let match = newMatch({ pointsToWin: 21, bestOf: 3, firstServer: 'B' })
    match = correctServer(addPoint(match, 'A'), 'A')
    return {
        gameStarted: true,
        match,
        names: { A: 'Ana', B: 'Ben' },
        partners: { A: 'Eva', B: 'Jan' },
        format: 'singles',
        firstServer: 'B',
        doublesOrder: { server: 'B2', receiver: 'A1' },
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

    it('keeps a doubles match, including service corrections', () => {
        let match = newMatch({ format: 'doubles', doublesOrder: { server: 'A1', receiver: 'B2' } })
        match = correctService(addPoint(match, 'A'), { server: 'A2', receiver: 'B1' })
        const saved = state({ match, format: 'doubles' })
        expect(parse(serialize(saved))).toEqual(saved)
    })
})

describe('upgrading a version 1 save', () => {
    // Version 1 was singles only and had no partners or doubles set-up.
    const version1 = {
        version: 1,
        gameStarted: true,
        match: {
            settings: { pointsToWin: 11, bestOf: 5, firstServer: 'A' },
            events: [{ type: 'point', player: 'A' }]
        },
        names: { A: 'Ana', B: 'Ben' },
        firstServer: 'A',
        pointsToWin: 11,
        bestOf: 5
    }

    it('keeps the match and names, as singles', () => {
        expect(parse(JSON.stringify(version1))).toEqual({
            gameStarted: true,
            match: {
                settings: {
                    pointsToWin: 11,
                    bestOf: 5,
                    firstServer: 'A',
                    format: 'singles',
                    doublesOrder: null
                },
                events: [{ type: 'point', player: 'A' }]
            },
            names: { A: 'Ana', B: 'Ben' },
            partners: { A: '', B: '' },
            format: 'singles',
            firstServer: 'A',
            doublesOrder: DEFAULT_DOUBLES_ORDER,
            pointsToWin: 11,
            bestOf: 5
        })
    })

    it('still rejects a damaged version 1 save', () => {
        expect(parse(JSON.stringify({ ...version1, names: undefined }))).toBeNull()
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
        ['partners missing', withField('partners', undefined)],
        ['an unknown format', withField('format', 'triples')],
        ['a doubles order within one pair', withField('doublesOrder', { server: 'A1', receiver: 'A2' })],
        [
            'a doubles match without its order',
            withField('match', { settings: { ...newMatch().settings, format: 'doubles' }, events: [] })
        ],
        [
            'a doubles correction for an unknown player',
            withField('match', {
                settings: newMatch().settings,
                events: [{ type: 'doublesCorrection', server: 'C1', receiver: 'A1' }]
            })
        ],
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
