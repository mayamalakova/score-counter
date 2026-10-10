// Keeping the screen on during play, with the Screen Wake Lock API stubbed:
// jsdom has none, like an older browser.
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { encodeResult } from '../src/sharing/result'
import { AppDriver } from './driver'

let app: AppDriver | undefined
let visibility: DocumentVisibilityState = 'visible'
let held: { released: boolean } | null = null
let request: ReturnType<typeof vi.fn>

/** Gives the page a working Wake Lock API, as on Android Chrome or iOS Safari. */
function supportWakeLock() {
    held = null
    request = vi.fn(async () => {
        const lock = {
            released: false,
            release: vi.fn(async () => {
                lock.released = true
            })
        }
        held = lock
        return lock
    })
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
}

/** Switches to another app (hidden) and back (visible). The browser drops the lock when hidden. */
async function setVisibility(state: DocumentVisibilityState) {
    visibility = state
    if (state === 'hidden' && held) held.released = true
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
}

const screenOn = () => held !== null && !held.released

afterEach(() => {
    app?.wrapper.unmount()
    app = undefined
    visibility = 'visible'
    Reflect.deleteProperty(navigator, 'wakeLock')
    Reflect.deleteProperty(document, 'visibilityState')
})

describe('keeping the screen on', () => {
    it('does nothing where the browser cannot', async () => {
        app = new AppDriver()
        await app.start()
        await app.point('left', 3)
        expect(app.scores).toEqual(['3', '0'])
    })

    it('stays off on set-up', async () => {
        supportWakeLock()
        app = new AppDriver()
        await flushPromises()
        expect(request).not.toHaveBeenCalled()
    })

    it('keeps the screen on once a match starts', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start()
        await flushPromises()
        expect(request).toHaveBeenCalledWith('screen')
        expect(screenOn()).toBe(true)
    })

    it('lets the screen dim when the match is won, and keeps it on again after undo', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start({ bestOf: 1 })
        // Ana changes ends at 5 in the deciding game, so her last points are on the right.
        await app.point('left', 5)
        await app.point('right', 6)
        await flushPromises()
        expect(app.summaryTitle).toBe('Ana wins 1–0')
        expect(screenOn()).toBe(false)

        await app.button('Undo last point').trigger('click')
        await flushPromises()
        expect(screenOn()).toBe(true)
    })

    it('lets the screen dim after ending the match', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start()
        await app.openEdit()
        await app.endMatch()
        await flushPromises()
        expect(app.onSetUp).toBe(true)
        expect(screenOn()).toBe(false)
    })

    it('asks again when the page comes back after another app', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start()
        await flushPromises()

        await setVisibility('hidden')
        expect(screenOn()).toBe(false)
        await setVisibility('visible')
        expect(request).toHaveBeenCalledTimes(2)
        expect(screenOn()).toBe(true)
    })

    it('resumes after a reload mid-match', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start()
        await app.reload()
        await flushPromises()
        expect(screenOn()).toBe(true)
    })

    it('stays off while showing a received result', async () => {
        supportWakeLock()
        app = new AppDriver()
        await app.start()
        await flushPromises()

        const result = encodeResult({
            format: 'singles',
            pointsToWin: 11,
            bestOf: 1,
            names: { A: 'Ana', B: 'Ben' },
            games: [{ A: 11, B: 5 }]
        })
        history.replaceState(null, '', `/#result=${result}`)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        await flushPromises()
        expect(screenOn()).toBe(false)

        await app.button('Back to my match').trigger('click')
        await flushPromises()
        expect(screenOn()).toBe(true)
    })

    it('carries on as usual when the browser refuses', async () => {
        supportWakeLock()
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        request.mockRejectedValueOnce(new DOMException('battery saver', 'NotAllowedError'))
        app = new AppDriver()
        await app.start()
        await flushPromises()
        expect(screenOn()).toBe(false)
        expect(log).toHaveBeenCalledWith('Keeping the screen on was refused', expect.any(DOMException))
        await app.point('left')
        expect(app.scores).toEqual(['1', '0'])
        log.mockRestore()
    })
})
