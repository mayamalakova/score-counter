// What each screen shows and offers, beyond the main flows.
import { beforeEach, describe, expect, it } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver

beforeEach(() => {
    app = new AppDriver()
})

describe('the scoreboard', () => {
    it('uses real buttons for points and minus', async () => {
        await app.start()
        expect(app.wrapper.findAll('button.point')).toHaveLength(2)
        expect(app.wrapper.findAll('button.minus')).toHaveLength(2)
    })

    it('shows default names when none were entered', async () => {
        await app.start({ left: '', right: '' })
        expect(app.names).toEqual(['Player 1', 'Player 2'])
    })

    it("keeps each player's colour when they change ends", async () => {
        await app.start()
        const [ana, ben] = app.nameColours
        await app.winGame('left')
        expect(app.nameColours).toEqual([ben, ana])
    })
})

describe('when a game is won', () => {
    beforeEach(async () => {
        await app.start()
        await app.point('left', 11)
    })

    it('names the winner in a bar instead of covering the table', () => {
        expect(app.gameWonText).toContain('Ana wins game 1')
        expect(app.wrapper.find('.cover-all').exists()).toBe(false)
    })

    it('can undo the winning point from the bar', async () => {
        await app.undo()
        expect(app.gameWon).toBe(false)
        expect(app.scores[0]).toBe('10')
    })

    it('still lets minus correct the winning point', async () => {
        await app.minus('left')
        expect(app.gameWon).toBe(false)
        expect(app.scores[0]).toBe('10')
    })
})

describe('the match summary', () => {
    beforeEach(async () => {
        await app.start()
        // Players change ends each game, so Ana wins on the left, right, left.
        await app.winGame('left')
        await app.winGame('right')
        await app.point('left', 11)
    })

    it('shows the result in a valid table', () => {
        expect(app.summaryTitle).toBe('Ana wins 3–0')
        expect(app.wrapper.find('table thead tr th').exists()).toBe(true)
        expect(app.wrapper.findAll('table tbody tr')).toHaveLength(2)
        expect(app.wrapper.find('tr thead').exists()).toBe(false)
    })

    it('can undo match point', async () => {
        await app.button('Undo last point').trigger('click')
        expect(app.summaryTitle).toBeNull()
        expect(app.scores).toEqual(['10', '0'])
    })
})
