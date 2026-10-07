<script setup lang="ts">
import { computed } from 'vue'
import { gamesWonFrom, type Player } from '../scoring/match'
import type { ReceivedLink, SharedResult } from '../sharing/result'
import Icon from './Icon.vue'
import ResultTable, { type ResultRow } from './ResultTable.vue'
import { playerColors } from './types'

const props = defineProps<{
    link: ReceivedLink
}>()

const emit = defineEmits<{
    back: []
}>()

const view = computed(() => (props.link.status === 'ok' ? describe(props.link.result) : null))

/** What the page shows for a result. */
function describe(result: SharedResult) {
    const won = gamesWonFrom(result.games)
    const winner: Player = won.A > won.B ? 'A' : 'B'
    const row = (player: Player): ResultRow => ({
        name: result.names[player],
        color: playerColors[player],
        scores: result.games.map(game => game[player]),
        games: won[player]
    })
    const details = [`best of ${result.bestOf}`, `to ${result.pointsToWin}`]
    if (result.format === 'doubles') details.push('doubles')
    return {
        title: `${result.names[winner]} wins ${Math.max(won.A, won.B)}–${Math.min(won.A, won.B)}`,
        details: details.join(' · '),
        rows: [row('A'), row('B')] as [ResultRow, ResultRow]
    }
}
</script>

<template>
    <main class="received">
        <section v-if="view" class="card" aria-labelledby="received-title">
            <p class="label">Result received</p>
            <h1 id="received-title">{{ view.title }}</h1>
            <p class="details">{{ view.details }}</p>
            <ResultTable :rows="view.rows" />
            <button class="button primary back" type="button" @click="emit('back')">
                Back to my match <Icon name="next" />
            </button>
        </section>
        <section v-else class="card" role="alert">
            <h1>This result couldn't be read</h1>
            <p>The link may be incomplete. Ask for the QR code again.</p>
            <button class="button primary back" type="button" @click="emit('back')">
                Back to my match <Icon name="next" />
            </button>
        </section>
    </main>
</template>

<style scoped>
.received {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.card {
    max-width: 100%;
    padding: 16px 20px 20px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
}

.label {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
}

h1 {
    margin: 0;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

.details {
    margin: 0 0 8px;
    font-size: 0.95rem;
}

.back {
    width: 100%;
    justify-content: center;
}

/* Room for a best of 7 in the result table on a small phone. */
@media (max-width: 420px) {
    .card {
        padding-inline: 12px;
    }
}
</style>
