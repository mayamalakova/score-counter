<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { getDoublesTeam } from '../scoring/match'
import type { BestOf, DoublesPlayer, Format, Player, PointsToWin, Service } from '../scoring/match'

const props = defineProps<{
    colorLeft: string
    colorRight: string
}>()

const emit = defineEmits<{
    'start-match': []
}>()

/** Each side's player in singles, or first player in doubles. The left side is A. */
const names = defineModel<Record<Player, string>>('names', { required: true })
/** Each side's second player in doubles. */
const partners = defineModel<Record<Player, string>>('partners', { required: true })
const format = defineModel<Format>('format', { required: true })
/** Singles: false when the left player serves first, true for the right player. */
const swapServer = defineModel<boolean>('swapServer', { required: true })
const doublesOrder = defineModel<Service>('doublesOrder', { required: true })
const pointsToWin = defineModel<PointsToWin>('pointsToWin', { required: true })
const bestOf = defineModel<BestOf>('bestOf', { required: true })

const pointsOptions: PointsToWin[] = [11, 21]
const bestOfOptions: BestOf[] = [1, 3, 5, 7]

const singlesRows = computed(() => [
    {
        side: 'A' as const,
        label: 'Left player',
        placeholder: 'Player 1',
        color: props.colorLeft,
        swap: false
    },
    {
        side: 'B' as const,
        label: 'Right player',
        placeholder: 'Player 2',
        color: props.colorRight,
        swap: true
    }
])

const pairs = computed(() => [
    { side: 'A' as const, label: 'Left pair', color: props.colorLeft },
    { side: 'B' as const, label: 'Right pair', color: props.colorRight }
])

function nameOf(player: DoublesPlayer): string {
    return player[1] === '1' ? names.value[getDoublesTeam(player)] : partners.value[getDoublesTeam(player)]
}

function setName(player: DoublesPlayer, name: string) {
    const side = getDoublesTeam(player)
    if (player[1] === '1') names.value = { ...names.value, [side]: name }
    else partners.value = { ...partners.value, [side]: name }
}

function placeholder(player: DoublesPlayer): string {
    return `Player ${{ A1: 1, A2: 2, B1: 3, B2: 4 }[player]}`
}

/**
 * Set-up only asks who serves first. The other pair's first-listed player receives
 * first; if the pair chooses differently, the edit panel corrects it.
 */
const server = computed({
    get: () => doublesOrder.value.server,
    set: player => {
        doublesOrder.value = { server: player, receiver: getDoublesTeam(player) === 'A' ? 'B1' : 'A1' }
    }
})
</script>

<template>
    <form class="setup" @submit.prevent="emit('start-match')">
        <section class="players">
            <h1>New match</h1>
            <template v-if="format === 'singles'">
                <div v-for="row in singlesRows" :key="row.side" class="player">
                    <input
                        :value="names[row.side]"
                        class="name-input"
                        :aria-label="row.label"
                        :placeholder="row.placeholder"
                        :style="{ borderColor: row.color }"
                        @input="names = { ...names, [row.side]: ($event.target as HTMLInputElement).value }"
                    />
                    <label class="serves">
                        <input v-model="swapServer" type="radio" name="first-server" :value="row.swap" />
                        Serves first
                    </label>
                </div>
            </template>
            <template v-else>
                <div
                    v-for="pair in pairs"
                    :key="pair.side"
                    class="pair"
                    role="group"
                    :aria-label="pair.label"
                >
                    <div
                        v-for="player in [`${pair.side}1`, `${pair.side}2`] as DoublesPlayer[]"
                        :key="player"
                        class="player"
                    >
                        <input
                            :value="nameOf(player)"
                            class="name-input"
                            :aria-label="`${pair.label}, ${player[1] === '1' ? 'first' : 'second'} player`"
                            :placeholder="placeholder(player)"
                            :style="{ borderColor: pair.color }"
                            @input="setName(player, ($event.target as HTMLInputElement).value)"
                        />
                        <label class="serves">
                            <input v-model="server" type="radio" name="doubles-server" :value="player" />
                            Serves first
                        </label>
                    </div>
                </div>
            </template>
        </section>

        <section class="settings">
            <fieldset>
                <legend>Format</legend>
                <div class="segments">
                    <label v-for="option in ['singles', 'doubles'] as Format[]" :key="option">
                        <input v-model="format" type="radio" name="format" :value="option" />
                        <span>{{ option === 'singles' ? 'Singles' : 'Doubles' }}</span>
                    </label>
                </div>
            </fieldset>
            <fieldset>
                <legend>Points per game</legend>
                <div class="segments">
                    <label v-for="points in pointsOptions" :key="points">
                        <input v-model="pointsToWin" type="radio" name="points-to-win" :value="points" />
                        <span>{{ points }}</span>
                    </label>
                </div>
            </fieldset>
            <fieldset>
                <legend>Best of</legend>
                <div class="segments">
                    <label v-for="games in bestOfOptions" :key="games">
                        <input v-model="bestOf" type="radio" name="best-of" :value="games" />
                        <span>{{ games }}</span>
                    </label>
                </div>
            </fieldset>
            <button class="start" type="submit">Start match <Icon name="next" /></button>
        </section>
    </form>
</template>

<style scoped>
.setup {
    min-height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-content: center;
    gap: 24px 40px;
    max-width: 820px;
    margin: 0 auto;
    padding: 24px;
}

h1 {
    margin: 0 0 16px;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: clamp(2rem, 7vmin, 3rem);
}

.player {
    margin-bottom: 16px;
}

/* Doubles: a pair's two players side by side, so four players fit on a phone held sideways. */
.pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}

.pair .player {
    margin-bottom: 0;
}

.name-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid;
    border-left-width: 10px;
    border-radius: 8px;
    background: #fff;
    color: var(--ink);
    font-size: 1.1rem;
}

.serves {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.95rem;
}

.serves input {
    width: 20px;
    height: 20px;
    accent-color: var(--ball);
}

.settings {
    align-self: end;
}

fieldset {
    margin: 0 0 16px;
    padding: 0;
    border: 0;
}

legend {
    padding: 0;
    margin-bottom: 6px;
    font-size: 0.9rem;
    opacity: 0.9;
}

.segments {
    display: flex;
    border: 2px solid #fff;
    border-radius: var(--radius);
    overflow: hidden;
}

.segments label {
    flex: 1;
    position: relative;
}

.segments input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
}

.segments span {
    display: block;
    padding: 8px 0;
    text-align: center;
    font-weight: 700;
}

.segments label + label span {
    border-left: 2px solid rgb(255 255 255 / 0.5);
}

.segments input:checked + span {
    background: #fff;
    color: var(--ink);
}

.segments input:focus-visible + span {
    outline: 3px solid var(--ball);
    outline-offset: -3px;
}

.start {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    padding: 12px;
    border: 0;
    border-radius: var(--radius);
    background: #fff;
    color: var(--ink);
    font-weight: 700;
    font-size: 1.1rem;
}

@media (orientation: portrait) {
    .setup {
        grid-template-columns: 1fr;
        align-content: start;
    }
}
</style>
