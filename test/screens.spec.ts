import { mount, type VueWrapper } from '@vue/test-utils'
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

function text(selector: string): string {
    return wrapper.find(selector).text().replace(/\s+/g, ' ')
}

function button(label: string) {
    const found = wrapper.findAll('button').find(b => b.text().includes(label))
    if (!found) throw new Error(`No button "${label}"`)
    return found
}

beforeEach(() => {
    wrapper = mount(App)
})

describe('the scoreboard', () => {
    it('uses real buttons for points and minus', async () => {
        await start()
        expect(wrapper.findAll('button.point')).toHaveLength(2)
        expect(wrapper.findAll('button.minus')).toHaveLength(2)
    })

    it('shows default names when none were entered', async () => {
        await start('', '')
        expect(wrapper.findAll('.half .name').map(name => name.text())).toEqual(['Player 1', 'Player 2'])
    })

    it("keeps each player's colour when they change ends", async () => {
        await start()
        const colours = () => wrapper.findAll('.half .name').map(name => name.attributes('style'))
        const [ana, ben] = colours()
        await tap('.point', 0, 11)
        await button('Next game').trigger('click')
        expect(colours()).toEqual([ben, ana])
    })
})

describe('when a game is won', () => {
    beforeEach(async () => {
        await start()
        await tap('.point', 0, 11)
    })

    it('names the winner in a bar instead of covering the table', () => {
        expect(text('.bar')).toContain('Ana wins game 1')
        expect(wrapper.find('.cover-all').exists()).toBe(false)
    })

    it('can undo the winning point from the bar', async () => {
        await button('Undo').trigger('click')
        expect(wrapper.find('.bar').exists()).toBe(false)
        expect(wrapper.findAll('.score')[0].text()).toBe('10')
    })

    it('still lets minus correct the winning point', async () => {
        await tap('.minus', 0)
        expect(wrapper.find('.bar').exists()).toBe(false)
        expect(wrapper.findAll('.score')[0].text()).toBe('10')
    })
})

describe('the match summary', () => {
    beforeEach(async () => {
        await start()
        // Winning on the left alternates the winner as players change ends, so
        // Ana wins games 1 and 3 on the left and game 2 on the right.
        await tap('.point', 0, 11)
        await button('Next game').trigger('click')
        await tap('.point', 1, 11)
        await button('Next game').trigger('click')
        await tap('.point', 0, 11)
    })

    it('shows the result in a valid table', () => {
        expect(text('.card h2')).toBe('Ana wins 3–0')
        expect(wrapper.find('table thead tr th').exists()).toBe(true)
        expect(wrapper.findAll('table tbody tr')).toHaveLength(2)
        expect(wrapper.find('tr thead').exists()).toBe(false)
    })

    it('can undo match point', async () => {
        await button('Undo last point').trigger('click')
        expect(wrapper.find('.card').exists()).toBe(false)
        expect(wrapper.findAll('.score').map(score => score.text())).toEqual(['10', '0'])
    })
})

describe('the set-up screen', () => {
    it('shows the left player serving after a match, as the next match will start', async () => {
        await wrapper.find('input[name="first-server"][value="true"]').setValue()
        await wrapper.find('form.setup').trigger('submit')
        ;(wrapper.vm as unknown as { nextMatch(): void }).nextMatch()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('input[name="first-server"]:checked').attributes('value')).toBe('false')
    })
})
