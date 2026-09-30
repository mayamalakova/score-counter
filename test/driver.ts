import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../src/App.vue'
import type { Side } from '../src/components/types'

export interface SetUpOptions {
    left?: string
    right?: string
    rightServesFirst?: boolean
    pointsToWin?: 11 | 21
    bestOf?: 1 | 3 | 5 | 7
}

/**
 * Drives the app through its UI, the way a player would: typing on the set-up
 * screen and tapping buttons. Tests read what's on screen, never App's internals.
 */
export class AppDriver {
    wrapper: VueWrapper

    constructor() {
        this.wrapper = mount(App)
    }

    // --- Set-up ---

    async fillSetUp({ left = 'Ana', right = 'Ben', rightServesFirst, pointsToWin, bestOf }: SetUpOptions = {}) {
        const [leftName, rightName] = this.wrapper.findAll('.setup .name-input')
        await leftName.setValue(left)
        await rightName.setValue(right)
        if (rightServesFirst !== undefined) {
            await this.wrapper.find(`input[name="first-server"][value="${rightServesFirst}"]`).setValue()
        }
        if (pointsToWin) await this.wrapper.find(`input[name="points-to-win"][value="${pointsToWin}"]`).setValue()
        if (bestOf) await this.wrapper.find(`input[name="best-of"][value="${bestOf}"]`).setValue()
    }

    async start(options: SetUpOptions = {}) {
        await this.fillSetUp(options)
        await this.wrapper.find('form.setup').trigger('submit')
    }

    get onSetUp(): boolean {
        return this.wrapper.find('form.setup').exists()
    }

    /** The names typed on the set-up screen, left then right. */
    get setUpNames(): string[] {
        return this.wrapper.findAll('.setup .name-input').map(input => (input.element as HTMLInputElement).value)
    }

    checkedValue(name: 'first-server' | 'points-to-win' | 'best-of'): string | undefined {
        return this.wrapper.find(`input[name="${name}"]:checked`).attributes('value')
    }

    // --- Playing ---

    async point(side: Side, times = 1) {
        const half = side === 'left' ? 0 : 1
        for (let i = 0; i < times; i++) await this.wrapper.findAll('button.point')[half].trigger('click')
    }

    async minus(side: Side) {
        await this.wrapper.findAll('button.minus')[side === 'left' ? 0 : 1].trigger('click')
    }

    /** Wins a game from 0-0 for the player at that end and moves on, unless that ends the match. */
    async winGame(side: Side) {
        await this.point(side, this.pointsToWin)
        if (this.gameWon) await this.nextGame()
    }

    async nextGame() {
        await this.button('Next game').trigger('click')
    }

    async restart() {
        await this.wrapper.find('[aria-label="Restart game"]').trigger('click')
    }

    async undo() {
        await this.button('Undo').trigger('click')
    }

    /** Names shown on the table, left then right (or top then bottom when upright). */
    get names(): string[] {
        return this.wrapper.findAll('.half .name').map(name => name.text())
    }

    get nameColours(): (string | undefined)[] {
        return this.wrapper.findAll('.half .name').map(name => name.attributes('style'))
    }

    get scores(): string[] {
        return this.wrapper.findAll('.score').map(score => score.text())
    }

    get server(): Side {
        return this.wrapper.find('.ball-position').classes('left') ? 'left' : 'right'
    }

    get info(): string {
        return this.wrapper.find('.info').text()
    }

    get gameWon(): boolean {
        return this.wrapper.find('.bar').exists()
    }

    get gameWonText(): string {
        return this.wrapper.find('.bar').text().replace(/\s+/g, ' ')
    }

    // --- Edit panel ---

    async openEdit() {
        await this.wrapper.find('[aria-label="Edit players and server"]').trigger('click')
    }

    async editNames(left: string, right: string) {
        const [leftName, rightName] = this.wrapper.findAll('.panel .name-input')
        await leftName.setValue(left)
        await rightName.setValue(right)
    }

    async setServingNow(side: Side) {
        await this.wrapper.find(`input[name="server-now"][value="${side}"]`).setValue()
    }

    /** Presses Done. jsdom doesn't submit a form when its submit button is clicked, so submit directly. */
    async closeEdit() {
        await this.wrapper.find('form.panel').trigger('submit')
    }

    get editOpen(): boolean {
        return this.wrapper.find('.panel').exists()
    }

    async endMatch() {
        await this.wrapper.find('.panel .end-match').trigger('click')
        await this.wrapper.find('.confirm-end').trigger('click')
    }

    // --- Summary ---

    get summaryTitle(): string | null {
        const title = this.wrapper.find('.card h2')
        return title.exists() ? title.text() : null
    }

    async newMatch() {
        await this.button('New match').trigger('click')
    }

    // --- Helpers ---

    button(label: string) {
        const found = this.wrapper.findAll('button').find(button => button.text().includes(label))
        if (!found) throw new Error(`No button labelled "${label}"`)
        return found
    }

    /** Unmounts the app and mounts a fresh one, like reloading the page. */
    async reload() {
        await nextTick()
        this.wrapper.unmount()
        this.wrapper = mount(App)
        await nextTick()
    }

    private get pointsToWin(): number {
        return this.info.includes('to 21') ? 21 : 11
    }
}
