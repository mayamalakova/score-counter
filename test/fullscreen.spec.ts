// The full screen button on the scoreboard, with the browser's Fullscreen API stubbed:
// jsdom has none, like an iPhone.
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver
let fullscreenElement: Element | null

/** Gives the page a working Fullscreen API, as on Android, until restoreFullscreen. */
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

const stubs = ['fullscreenEnabled', 'fullscreenElement', 'exitFullscreen', 'requestFullscreen']

/** Takes the stubs away again, back to jsdom's page without the API. */
function restoreFullscreen() {
    for (const target of [document, document.documentElement]) {
        for (const name of stubs) Reflect.deleteProperty(target, name)
    }
}

afterEach(restoreFullscreen)

describe('full screen', () => {
    it('has no button where the browser cannot go full screen', async () => {
        app = new AppDriver()
        await app.start()
        expect(app.fullscreenLabel).toBeNull()
    })

    it('goes full screen and back from the scoreboard', async () => {
        supportFullscreen()
        app = new AppDriver()
        await app.start()
        expect(app.fullscreenLabel).toBe('Full screen')

        await app.toggleFullscreen()
        expect(document.documentElement.requestFullscreen).toHaveBeenCalledWith({ navigationUI: 'hide' })
        expect(app.fullscreenLabel).toBe('Exit full screen')

        await app.toggleFullscreen()
        expect(document.exitFullscreen).toHaveBeenCalled()
        expect(app.fullscreenLabel).toBe('Full screen')
    })

    it('follows the browser when it leaves full screen by itself', async () => {
        supportFullscreen()
        app = new AppDriver()
        await app.start()
        await app.toggleFullscreen()

        // A back gesture or Esc ends full screen without the button.
        fullscreenElement = null
        document.dispatchEvent(new Event('fullscreenchange'))
        await flushPromises()
        expect(app.fullscreenLabel).toBe('Full screen')
    })

    it('stays as it was when the browser refuses', async () => {
        supportFullscreen()
        document.documentElement.requestFullscreen = vi.fn(() => Promise.reject(new TypeError('denied')))
        app = new AppDriver()
        await app.start()

        await app.toggleFullscreen()
        expect(app.fullscreenLabel).toBe('Full screen')
    })
})
