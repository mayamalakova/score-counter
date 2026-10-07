// The full screen button on the scoreboard, with the browser's Fullscreen API stubbed:
// jsdom has none, like an iPhone.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver
let fullscreenElement: Element | null

/** Gives the page a working Fullscreen API, as on Android, until the test ends. */
function supportFullscreen() {
    fullscreenElement = null
    const change = () => document.dispatchEvent(new Event('fullscreenchange'))
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => true })
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreenElement })
    document.documentElement.requestFullscreen = vi.fn(async () => {
        fullscreenElement = document.documentElement
        change()
    })
    document.exitFullscreen = vi.fn(async () => {
        fullscreenElement = null
        change()
    })
}

function fullscreenButton() {
    return app.wrapper.find('.top-bar [aria-pressed]')
}

async function settle() {
    await new Promise(resolve => setTimeout(resolve))
    await app.wrapper.vm.$nextTick()
}

afterEach(() => {
    const stubbed = document as unknown as Record<string, unknown>
    delete stubbed.fullscreenEnabled
    delete stubbed.fullscreenElement
    delete stubbed.exitFullscreen
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen
})

describe('full screen', () => {
    it('has no button where the browser cannot go full screen', async () => {
        app = new AppDriver()
        await app.start()
        expect(fullscreenButton().exists()).toBe(false)
    })

    it('goes full screen and back from the scoreboard', async () => {
        supportFullscreen()
        app = new AppDriver()
        await app.start()
        expect(fullscreenButton().attributes('aria-label')).toBe('Full screen')

        await fullscreenButton().trigger('click')
        await settle()
        expect(document.documentElement.requestFullscreen).toHaveBeenCalledWith({ navigationUI: 'hide' })
        expect(fullscreenButton().attributes('aria-label')).toBe('Exit full screen')
        expect(fullscreenButton().attributes('aria-pressed')).toBe('true')

        await fullscreenButton().trigger('click')
        await settle()
        expect(document.exitFullscreen).toHaveBeenCalled()
        expect(fullscreenButton().attributes('aria-label')).toBe('Full screen')
    })

    it('follows the browser when it leaves full screen by itself', async () => {
        supportFullscreen()
        app = new AppDriver()
        await app.start()
        await fullscreenButton().trigger('click')
        await settle()

        // A back gesture or Esc ends full screen without the button.
        fullscreenElement = null
        document.dispatchEvent(new Event('fullscreenchange'))
        await settle()
        expect(fullscreenButton().attributes('aria-label')).toBe('Full screen')
    })

    it('stays as it was when the browser refuses', async () => {
        supportFullscreen()
        document.documentElement.requestFullscreen = vi.fn(() => Promise.reject(new TypeError('denied')))
        app = new AppDriver()
        await app.start()

        await fullscreenButton().trigger('click')
        await settle()
        expect(fullscreenButton().attributes('aria-label')).toBe('Full screen')
    })
})
