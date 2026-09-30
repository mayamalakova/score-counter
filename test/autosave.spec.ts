import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.vue'

let wrapper: VueWrapper

async function tap(selector: string, index = 0, times = 1) {
    for (let i = 0; i < times; i++) {
        await wrapper.findAll(selector)[index].trigger('click')
    }
}

async function start(left = 'Ana', right = 'Ben') {
    const [leftName, rightName] = wrapper.findAll('.setup .name-input')
    await leftName.setValue(left)
    await rightName.setValue(right)
    await wrapper.find('form.setup').trigger('submit')
}

/** Unmounts the app and mounts a fresh one, like reloading the page. */
async function reload() {
    await nextTick()
    wrapper.unmount()
    wrapper = mount(App)
    await nextTick()
}

function scores(): string[] {
    return wrapper.findAll('.score').map(score => score.text())
}

function names(): string[] {
    return wrapper.findAll('.half .name').map(name => name.text())
}

beforeEach(() => {
    wrapper = mount(App)
})

describe('after a reload', () => {
    it('goes straight back into a match in progress', async () => {
        await start()
        await tap('.point', 0, 4)
        await tap('.point', 1, 2)
        await reload()

        expect(wrapper.find('form.setup').exists()).toBe(false)
        expect(names()).toEqual(['Ana', 'Ben'])
        expect(scores()).toEqual(['4', '2'])
    })

    it('keeps finished games, ends and the server', async () => {
        await start()
        await tap('.point', 0, 11)
        await wrapper.find('.next-game').trigger('click')
        await tap('.point', 0, 3)
        const before = {
            names: names(),
            scores: scores(),
            info: wrapper.find('.info').text(),
            server: wrapper.find('.ball-position').classes()
        }
        await reload()

        expect({
            names: names(),
            scores: scores(),
            info: wrapper.find('.info').text(),
            server: wrapper.find('.ball-position').classes()
        }).toEqual(before)
    })

    it('keeps the settings of a match in progress', async () => {
        await wrapper.find('input[name="points-to-win"][value="21"]').setValue()
        await wrapper.find('input[name="best-of"][value="3"]').setValue()
        await start()
        await reload()

        expect(wrapper.find('.info').text()).toContain('best of 3 · to 21')
    })

    it('shows the game-won bar if a game was just won', async () => {
        await start()
        await tap('.point', 0, 11)
        await reload()

        expect(wrapper.find('.bar').text()).toContain('Ana wins game 1')
    })

    it('shows the summary if the match was over', async () => {
        await start()
        // Winning on the left alternates the winner as players change ends, so play
        // left, right, left for Ana to win all three.
        for (const side of [0, 1, 0]) {
            await tap('.point', side, 11)
            if (wrapper.find('.next-game').exists()) await wrapper.find('.next-game').trigger('click')
        }
        await reload()

        expect(wrapper.find('.card h2').text()).toBe('Ana wins 3–0')
    })

    it('keeps what was typed on the set-up screen', async () => {
        const [leftName] = wrapper.findAll('.setup .name-input')
        await leftName.setValue('Ana')
        await wrapper.find('input[name="first-server"][value="true"]').setValue()
        await wrapper.find('input[name="best-of"][value="7"]').setValue()
        await reload()

        expect((wrapper.findAll('.setup .name-input')[0].element as HTMLInputElement).value).toBe('Ana')
        expect(wrapper.find('input[name="first-server"]:checked').attributes('value')).toBe('true')
        expect(wrapper.find('input[name="best-of"]:checked').attributes('value')).toBe('7')
    })

    it('does not reopen the edit panel', async () => {
        await start()
        await wrapper.find('[aria-label="Edit players and server"]').trigger('click')
        await reload()

        expect(wrapper.find('.panel').exists()).toBe(false)
    })

    it('starts fresh when the saved data is unreadable', async () => {
        localStorage.setItem('score-counter', '{broken')
        await reload()

        expect(wrapper.find('form.setup').exists()).toBe(true)
    })
})

describe('ending a match', () => {
    beforeEach(async () => {
        await wrapper.find('input[name="best-of"][value="3"]').setValue()
        await start()
        await tap('.point', 0, 5)
        await wrapper.find('[aria-label="Edit players and server"]').trigger('click')
        await wrapper.find('.panel .end-match').trigger('click')
    })

    it('asks for confirmation first', () => {
        expect(wrapper.find('[role="alertdialog"]').text()).toContain('End this match?')
        expect(wrapper.find('form.setup').exists()).toBe(false)
    })

    it('can be cancelled, keeping the match', async () => {
        await wrapper.find('.cancel-end').trigger('click')
        expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
        await wrapper.find('.panel .done').trigger('click')
        expect(scores()).toEqual(['5', '0'])
    })

    it('returns to set-up with the names and settings kept', async () => {
        await wrapper.find('.confirm-end').trigger('click')

        const inputs = wrapper.findAll('.setup .name-input').map(input => (input.element as HTMLInputElement).value)
        expect(inputs).toEqual(['Ana', 'Ben'])
        expect(wrapper.find('input[name="best-of"]:checked').attributes('value')).toBe('3')
    })

    it('is not undone by a reload', async () => {
        await wrapper.find('.confirm-end').trigger('click')
        await reload()

        expect(wrapper.find('form.setup').exists()).toBe(true)
        await wrapper.find('form.setup').trigger('submit')
        expect(scores()).toEqual(['0', '0'])
    })
})
