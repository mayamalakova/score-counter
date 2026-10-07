// Sharing a finished match's result by QR code, and opening a shared result.
import { beforeEach, describe, expect, it } from 'vitest'
import ShareResult from '../src/components/ShareResult.vue'
import { encodeResult, resultFromHash, type SharedResult } from '../src/sharing/result'
import { AppDriver } from './driver'

let app: AppDriver

/** Plays a best of 3 that Ana wins 2–1, ending on the summary. */
async function finishMatch(doubles = false) {
    await app.start(doubles ? { bestOf: 3, doubles: {} } : { bestOf: 3 })
    // Ana's side: left in game 1, right in game 2, left in game 3 (from 5–0 on the right).
    await app.point('left', 11)
    await app.nextGame()
    await app.point('left', 11)
    await app.nextGame()
    await app.point('left', 5)
    await app.point('right', 6)
}

function sharedLink(): string {
    return app.wrapper.findComponent(ShareResult).props('link') as string
}

/** The result in the shared link, as the receiving phone reads it. */
function sharedResult(): SharedResult | undefined {
    const received = resultFromHash(new URL(sharedLink()).hash)
    return received.status === 'ok' ? received.result : undefined
}

const shared: SharedResult = {
    format: 'singles',
    pointsToWin: 11,
    bestOf: 5,
    names: { A: 'Ana', B: 'Ben' },
    games: [
        { A: 11, B: 8 },
        { A: 9, B: 11 },
        { A: 11, B: 6 },
        { A: 13, B: 11 }
    ]
}

describe('sharing a result', () => {
    beforeEach(async () => {
        app = new AppDriver()
        await finishMatch()
        await app.button('Share result').trigger('click')
    })

    it('shows a QR code from the summary', () => {
        expect(app.wrapper.find('.qr svg').exists()).toBe(true)
    })

    it("links to this app with the match's result", () => {
        const link = new URL(sharedLink())
        expect(link.origin).toBe(location.origin)
        expect(sharedResult()).toEqual({
            format: 'singles',
            pointsToWin: 11,
            bestOf: 3,
            names: { A: 'Ana', B: 'Ben' },
            games: [
                { A: 11, B: 0 },
                { A: 0, B: 11 },
                { A: 11, B: 0 }
            ]
        })
    })

    it('closes back to the summary', async () => {
        await app.button('Done').trigger('click')
        expect(app.wrapper.find('.qr').exists()).toBe(false)
        expect(app.summaryTitle).toBe('Ana wins 2–1')
    })
})

describe('sharing a doubles result', () => {
    it('carries the team names', async () => {
        app = new AppDriver()
        await finishMatch(true)
        await app.button('Share result').trigger('click')
        expect(sharedResult()?.names).toEqual({ A: 'Ana / Eva', B: 'Ben / Jan' })
    })
})

describe('opening a shared result', () => {
    beforeEach(() => {
        history.replaceState(null, '', `/#result=${encodeResult(shared)}`)
        app = new AppDriver()
    })

    it('shows the result on its own page', () => {
        expect(app.wrapper.find('#received-title').text()).toBe('Ana wins 3–1')
        expect(app.wrapper.find('.details').text()).toBe('best of 5 · to 11')
        const rows = app.wrapper
            .findAll('tbody tr')
            .map(row => row.findAll('th, td').map(cell => cell.text()))
        expect(rows).toEqual([
            ['Ana', '11', '9', '11', '13', '3'],
            ['Ben', '8', '11', '6', '11', '1']
        ])
        expect(app.onSetUp).toBe(false)
    })

    it('goes back to the app and clears the link', async () => {
        await app.button('Back to my match').trigger('click')
        expect(app.onSetUp).toBe(true)
        expect(location.hash).toBe('')
    })

    it("leaves this phone's own match untouched", async () => {
        app.wrapper.unmount()
        history.replaceState(null, '', '/')
        app = new AppDriver()
        await app.start()
        await app.point('left', 3)

        history.replaceState(null, '', `/#result=${encodeResult(shared)}`)
        await app.reload()
        expect(app.wrapper.find('#received-title').exists()).toBe(true)

        await app.button('Back to my match').trigger('click')
        expect(app.scores).toEqual(['3', '0'])
    })

    it('says so when the link cannot be read', async () => {
        app.wrapper.unmount()
        history.replaceState(null, '', '/#result=broken')
        app = new AppDriver()
        expect(app.wrapper.find('[role="alert"]').text()).toContain("This result couldn't be read")
    })

    it('opens a result that arrives while the app is already open', async () => {
        app.wrapper.unmount()
        history.replaceState(null, '', '/')
        app = new AppDriver()
        expect(app.onSetUp).toBe(true)

        history.replaceState(null, '', `/#result=${encodeResult(shared)}`)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        await app.wrapper.vm.$nextTick()
        expect(app.wrapper.find('#received-title').text()).toBe('Ana wins 3–1')
    })
})
