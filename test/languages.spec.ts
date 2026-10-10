// The app in English, Czech and Bulgarian, switched on the set-up screen.
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { bg } from '../src/i18n/bg'
import { cs } from '../src/i18n/cs'
import { en } from '../src/i18n/en'
import { AppDriver } from './driver'

let app: AppDriver

afterEach(() => {
    app.wrapper.unmount()
})

const heading = () => app.wrapper.find('h1').text()
const startButton = () => app.wrapper.find('button.start').text()
const info = () => app.wrapper.find('.info').text()

describe('languages', () => {
    it('starts in English', () => {
        app = new AppDriver()
        expect(heading()).toBe('New match')
        expect(document.documentElement.lang).toBe('en')
    })

    it('switches to Czech on set-up, and plays in Czech', async () => {
        app = new AppDriver()
        await app.chooseLanguage('cs')
        expect(heading()).toBe('Nový zápas')
        expect(startButton()).toBe('Začít zápas')
        expect(document.documentElement.lang).toBe('cs')
        expect(document.title).toBe('Počítadlo stolního tenisu')

        await app.start({ bestOf: 5 })
        expect(info()).toBe('Set 1 · na 3 vítězné sety · do 11')
        expect(app.wrapper.find('.point').attributes('aria-label')).toBe('Bod pro: Ana')
    })

    it('switches to Bulgarian', async () => {
        app = new AppDriver()
        await app.chooseLanguage('bg')
        expect(heading()).toBe('Нов мач')
        await app.start({ bestOf: 1, doubles: {} })
        expect(info()).toBe('Гейм 1 · до 1 спечелен гейм · до 11 · двойки')
    })

    it('remembers the choice on this phone', async () => {
        app = new AppDriver()
        await app.chooseLanguage('cs')
        await app.reload()
        expect(heading()).toBe('Nový zápas')
    })

    it('keeps the choice apart from the match, so ending a match keeps the language', async () => {
        app = new AppDriver()
        await app.chooseLanguage('bg')
        await app.start()
        await app.wrapper.find('[aria-label="Промени играчите и сервиса"]').trigger('click')
        await app.endMatch()
        expect(heading()).toBe('Нов мач')
    })

    it('names players left blank in the chosen language', async () => {
        app = new AppDriver()
        await app.chooseLanguage('cs')
        await app.start({ left: '', right: '' })
        expect(app.wrapper.find('.point').attributes('aria-label')).toBe('Bod pro: Hráč 1')
    })

    it('shows the game-won bar and the summary in the chosen language', async () => {
        app = new AppDriver()
        await app.chooseLanguage('cs')
        await app.start({ bestOf: 3 })
        await app.point('left', 11)
        expect(app.gameWonText).toBe('Ana vyhrává 1. set Zpět Další set')
        await app.button('Další set').trigger('click')
        await app.point('right', 11)
        expect(app.summaryTitle).toBe('Ana vyhrává 2:0')
    })

    it('ignores an unknown saved language', () => {
        localStorage.setItem('score-counter-language', 'xx')
        app = new AppDriver()
        expect(heading()).toBe('New match')
    })
})

describe('the language menu', () => {
    const toggle = () => app.wrapper.find('.language-picker .toggle')
    const menuOpen = () => app.wrapper.find('.language-picker [role="menu"]').exists()

    it('shows the current language on its flag button, and lists all three', async () => {
        app = new AppDriver()
        expect(toggle().attributes('aria-label')).toBe('Language: English')
        await toggle().trigger('click')
        expect(toggle().attributes('aria-expanded')).toBe('true')
        const options = app.wrapper.findAll('[role="menuitemradio"]')
        expect(options.map(option => option.text())).toEqual(['English', 'Čeština', 'Български'])
        expect(options.map(option => option.attributes('aria-checked'))).toEqual(['true', 'false', 'false'])
    })

    it('closes after a choice, showing the new language', async () => {
        app = new AppDriver()
        await app.chooseLanguage('cs')
        expect(menuOpen()).toBe(false)
        expect(toggle().attributes('aria-label')).toBe('Jazyk: Čeština')
    })

    it('closes on a tap elsewhere without changing the language', async () => {
        app = new AppDriver()
        await toggle().trigger('click')
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
        await flushPromises()
        expect(menuOpen()).toBe(false)
        expect(heading()).toBe('New match')
    })

    it('moves between languages with the arrow keys', async () => {
        app = new AppDriver({ attachTo: document.body })
        await toggle().trigger('click')
        await flushPromises()
        const menu = app.wrapper.find('[role="menu"]')
        const focused = () => document.activeElement?.getAttribute('lang')
        expect(focused()).toBe('en')
        await menu.trigger('keydown', { key: 'ArrowDown' })
        expect(focused()).toBe('cs')
        await menu.trigger('keydown', { key: 'End' })
        expect(focused()).toBe('bg')
        await menu.trigger('keydown', { key: 'ArrowDown' })
        expect(focused()).toBe('en')
        await menu.trigger('keydown', { key: 'ArrowUp' })
        expect(focused()).toBe('bg')
    })

    it('closes with Escape', async () => {
        app = new AppDriver()
        await toggle().trigger('click')
        await app.wrapper.find('.language-picker').trigger('keydown', { key: 'Escape' })
        expect(menuOpen()).toBe(false)
    })
})

describe('the translations', () => {
    it.each([
        ['Czech', cs],
        ['Bulgarian', bg]
    ])('%s translates every text', (_, messages) => {
        for (const [key, english] of Object.entries(en)) {
            const translated = messages[key as keyof typeof en]
            const sample = (text: unknown) =>
                typeof text === 'function' ? String(text('Ana', 1, 0)) : String(text)
            expect(sample(translated), key).not.toBe('')
            if (!/^(gameNumber|toPoints|playerId)$/.test(key)) {
                expect(sample(translated), key).not.toBe(sample(english))
            }
        }
    })
})
