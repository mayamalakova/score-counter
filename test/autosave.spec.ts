// Autosave: a reload goes straight back to where the app was. End match is the way out.
import { beforeEach, describe, expect, it } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver

beforeEach(() => {
    app = new AppDriver()
})

describe('after a reload', () => {
    it('goes straight back into a match in progress', async () => {
        await app.start()
        await app.point('left', 4)
        await app.point('right', 2)
        await app.reload()

        expect(app.onSetUp).toBe(false)
        expect(app.names).toEqual(['Ana', 'Ben'])
        expect(app.scores).toEqual(['4', '2'])
    })

    it('keeps finished games, ends and the server', async () => {
        await app.start()
        await app.winGame('left')
        await app.point('left', 3)
        const before = { names: app.names, scores: app.scores, info: app.info, server: app.server }
        await app.reload()

        expect({ names: app.names, scores: app.scores, info: app.info, server: app.server }).toEqual(before)
    })

    it('keeps the settings of a match in progress', async () => {
        await app.start({ pointsToWin: 21, bestOf: 3 })
        await app.reload()

        expect(app.info).toContain('best of 3 · to 21')
    })

    it('shows the game-won bar if a game was just won', async () => {
        await app.start()
        await app.point('left', 11)
        await app.reload()

        expect(app.gameWonText).toContain('Ana wins game 1')
    })

    it('shows the summary if the match was over', async () => {
        await app.start()
        // Players change ends each game, so Ana wins on the left, right, left.
        await app.winGame('left')
        await app.winGame('right')
        await app.point('left', 11)
        await app.reload()

        expect(app.summaryTitle).toBe('Ana wins 3–0')
    })

    it('keeps what was typed on the set-up screen', async () => {
        await app.fillSetUp({ left: 'Ana', right: '', rightServesFirst: true, bestOf: 7 })
        await app.reload()

        expect(app.setUpNames).toEqual(['Ana', ''])
        expect(app.checkedValue('first-server')).toBe('true')
        expect(app.checkedValue('best-of')).toBe('7')
    })

    it('does not reopen the edit panel', async () => {
        await app.start()
        await app.openEdit()
        await app.reload()

        expect(app.editOpen).toBe(false)
    })

    it('starts fresh when the saved data is unreadable', async () => {
        localStorage.setItem('score-counter', '{broken')
        await app.reload()

        expect(app.onSetUp).toBe(true)
    })
})

describe('ending a match', () => {
    beforeEach(async () => {
        await app.start({ bestOf: 3 })
        await app.point('left', 5)
        await app.openEdit()
        await app.wrapper.find('.panel .end-match').trigger('click')
    })

    it('asks for confirmation first', () => {
        expect(app.wrapper.find('[role="alertdialog"]').text()).toContain('End this match?')
        expect(app.onSetUp).toBe(false)
    })

    it('can be cancelled, keeping the match', async () => {
        await app.wrapper.find('.cancel-end').trigger('click')
        expect(app.wrapper.find('[role="alertdialog"]').exists()).toBe(false)
        await app.closeEdit()
        expect(app.scores).toEqual(['5', '0'])
    })

    it('returns to set-up with the names and settings kept', async () => {
        await app.wrapper.find('.confirm-end').trigger('click')

        expect(app.setUpNames).toEqual(['Ana', 'Ben'])
        expect(app.checkedValue('best-of')).toBe('3')
    })

    it('is not undone by a reload', async () => {
        await app.wrapper.find('.confirm-end').trigger('click')
        await app.reload()

        expect(app.onSetUp).toBe(true)
        await app.start()
        expect(app.scores).toEqual(['0', '0'])
    })
})
