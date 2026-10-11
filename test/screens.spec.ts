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

    it('shows games won at the foot of the net, following the players when they change ends', async () => {
        await app.start()
        expect(app.games).toEqual(['0', '0'])
        await app.winGame('left')
        // Ana won game 1 and is now on the right.
        expect(app.games).toEqual(['0', '1'])
    })

    it("lights up the server's half, on the same side as the ball", async () => {
        await app.start()
        expect(app.servingHalf).toBe('left')
        await app.point('left', 2)
        expect(app.server).toBe('right')
        expect(app.servingHalf).toBe('right')
    })

    it('keeps restart off the board, in the menu', async () => {
        await app.start()
        expect(app.wrapper.find('.board [aria-label="Restart game"]').exists()).toBe(false)
        await app.openEdit()
        expect(app.wrapper.find('.panel .restart').exists()).toBe(true)
    })
})

describe('restarting a game from the menu', () => {
    beforeEach(async () => {
        await app.start()
        await app.point('left', 3)
        await app.openEdit()
        await app.wrapper.find('.panel .restart').trigger('click')
    })

    it('asks first, naming the game', () => {
        expect(app.wrapper.find('#restart-title').text()).toBe('Restart game 1?')
        expect(app.scores).toEqual(['3', '0'])
    })

    it('keeps the score when cancelled', async () => {
        await app.wrapper.find('.cancel-restart').trigger('click')
        await app.closeEdit()
        expect(app.scores).toEqual(['3', '0'])
    })

    it('clears the game and closes the menu when confirmed', async () => {
        await app.wrapper.find('.confirm-restart').trigger('click')
        expect(app.editOpen).toBe(false)
        expect(app.scores).toEqual(['0', '0'])
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
