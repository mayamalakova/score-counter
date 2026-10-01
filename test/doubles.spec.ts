// Doubles, played through the UI. The engine's rules are covered in test/scoring/doubles.spec.ts.
import { beforeEach, describe, expect, it } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver

beforeEach(() => {
    app = new AppDriver()
})

describe('setting up doubles', () => {
    it('asks for two names per pair', async () => {
        await app.wrapper.find('input[name="format"][value="doubles"]').setValue()
        expect(app.wrapper.findAll('.setup .name-input')).toHaveLength(4)
    })

    it('only lets the other pair receive first', async () => {
        await app.fillSetUp({ doubles: { server: 'A2' } })
        const disabled = app.wrapper
            .findAll('input[name="doubles-receiver"]')
            .map(radio => (radio.element as HTMLInputElement).disabled)
        expect(disabled).toEqual([true, true, false, false])
    })

    it('moves the receiver to the other pair when the serving pair changes', async () => {
        await app.fillSetUp({ doubles: { server: 'B2' } })
        expect(app.checkedValue('doubles-receiver')).toBe('A1')
    })
})

describe('the doubles board', () => {
    it('shows the pairs, the format and where everyone stands for the first serve', async () => {
        await app.start({ doubles: { server: 'A1', receiver: 'B1' } })
        expect(app.info).toBe('Game 1 · best of 5 · to 11 · doubles')
        // Ana serves from her right half-court (near, at the left end) to Ben in his (far, at the right end).
        expect(app.courts).toEqual({ leftFar: 'Eva', leftNear: 'Ana', rightFar: 'Ben', rightNear: 'Jan' })
        expect(app.server).toBe('left')
    })

    it('moves players across at each change of service', async () => {
        await app.start({ doubles: { server: 'A1', receiver: 'B1' } })
        await app.point('left')
        await app.point('right')
        // Ben serves to Eva: Eva moves into her right half-court.
        expect(app.courts).toEqual({ leftFar: 'Ana', leftNear: 'Eva', rightFar: 'Ben', rightNear: 'Jan' })
        expect(app.server).toBe('right')
    })

    it('starts game 2 with the first receiver serving to the first server', async () => {
        await app.start({ doubles: { server: 'A1', receiver: 'B2' } })
        await app.winGame('left')
        // Pairs have changed ends: Ben and Jan are on the left. Jan serves to Ana.
        expect(app.courts).toEqual({ leftFar: 'Ben', leftNear: 'Jan', rightFar: 'Ana', rightNear: 'Eva' })
        expect(app.server).toBe('left')
    })

    it('changes ends and swaps the receivers at 5 in the deciding game', async () => {
        await app.start({ bestOf: 1, doubles: { server: 'A1', receiver: 'B1' } })
        // 4 points: A1>B1, B1>A2, A2>B2, so Eva serves to Jan.
        await app.point('left', 4)
        expect(app.courts).toEqual({ leftFar: 'Ana', leftNear: 'Eva', rightFar: 'Jan', rightNear: 'Ben' })

        // At 5 the pairs change ends and Ben and Jan swap receiving order, so Eva serves to Ben.
        await app.point('left')
        expect(app.courts).toEqual({ leftFar: 'Jan', leftNear: 'Ben', rightFar: 'Eva', rightNear: 'Ana' })
        expect(app.server).toBe('right')
    })

    it('names the pair in the game-won bar and the summary', async () => {
        await app.start({ bestOf: 1, doubles: {} })
        await app.point('left', 5)
        await app.point('right', 6)
        expect(app.summaryTitle).toBe('Ana / Eva wins 1–0')
    })

    it('uses default names for players left blank', async () => {
        await app.start({ doubles: { names: ['', 'Eva', '', ''] } })
        expect(app.courts.leftNear).toBe('Player 1')
        expect(app.courts.rightFar).toBe('Player 3')
    })
})

describe('doubles after a reload', () => {
    it('keeps the format, the names and where everyone stands', async () => {
        await app.start({ doubles: { server: 'A2', receiver: 'B2' } })
        await app.point('left', 3)
        const before = { courts: app.courts, server: app.server, info: app.info }
        await app.reload()
        expect({ courts: app.courts, server: app.server, info: app.info }).toEqual(before)
    })

    it('keeps the doubles set-up for the next match', async () => {
        await app.fillSetUp({ doubles: { server: 'B1', receiver: 'A2' } })
        await app.reload()
        expect(app.setUpNames).toEqual(['Ana', 'Eva', 'Ben', 'Jan'])
        expect(app.checkedValue('doubles-server')).toBe('B1')
        expect(app.checkedValue('doubles-receiver')).toBe('A2')
    })
})
