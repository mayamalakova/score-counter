<script setup lang="ts">
import Icon from './Icon.vue'
import type { BestOf, PointsToWin } from '../scoring/match'

defineProps<{
    colorLeft: string
    colorRight: string
}>()

const emit = defineEmits<{
    'start-match': []
}>()

const playerLeft = defineModel<string>('playerLeft', { required: true })
const playerRight = defineModel<string>('playerRight', { required: true })
/** False when the left player serves first, true for the right player. */
const swapServer = defineModel<boolean>('swapServer', { required: true })
const pointsToWin = defineModel<PointsToWin>('pointsToWin', { required: true })
const bestOf = defineModel<BestOf>('bestOf', { required: true })

const pointsOptions: PointsToWin[] = [11, 21]
const bestOfOptions: BestOf[] = [1, 3, 5, 7]
</script>

<template>
    <form class="setup" @submit.prevent="emit('start-match')">
        <section class="players">
            <h1>New match</h1>
            <div class="player">
                <input
                    v-model="playerLeft"
                    class="name-input"
                    aria-label="Left player"
                    placeholder="Player 1"
                    :style="{ borderColor: colorLeft }"
                />
                <label class="serves">
                    <input v-model="swapServer" type="radio" name="first-server" :value="false" />
                    Serves first
                </label>
            </div>
            <div class="player">
                <input
                    v-model="playerRight"
                    class="name-input"
                    aria-label="Right player"
                    placeholder="Player 2"
                    :style="{ borderColor: colorRight }"
                />
                <label class="serves">
                    <input v-model="swapServer" type="radio" name="first-server" :value="true" />
                    Serves first
                </label>
            </div>
        </section>

        <section class="settings">
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
