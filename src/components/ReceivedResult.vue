<script setup lang="ts">
import { computed } from 'vue'
import { gamesWonFrom } from '../scoring/match'
import type { SharedResult } from '../sharing/result'
import Icon from './Icon.vue'
import ResultTable, { type ResultRow } from './ResultTable.vue'

const props = defineProps<{
    /** The result from the link, or null if the link couldn't be read. */
    result: SharedResult | null
}>()

const emit = defineEmits<{
    back: []
}>()

const gamesWon = computed(() => gamesWonFrom(props.result?.games ?? []))

const rows = computed<[ResultRow, ResultRow] | null>(() => {
    const { result } = props
    if (!result) return null
    return [
        {
            name: result.names.A,
            color: 'var(--player-a)',
            scores: result.games.map(game => game.A),
            games: gamesWon.value.A
        },
        {
            name: result.names.B,
            color: 'var(--player-b)',
            scores: result.games.map(game => game.B),
            games: gamesWon.value.B
        }
    ]
})

const title = computed(() => {
    const { A, B } = gamesWon.value
    const winner = A > B ? props.result?.names.A : props.result?.names.B
    return `${winner} wins ${Math.max(A, B)}–${Math.min(A, B)}`
})

const details = computed(() => {
    const { result } = props
    if (!result) return ''
    const parts = [`best of ${result.bestOf}`, `to ${result.pointsToWin}`]
    if (result.format === 'doubles') parts.push('doubles')
    return parts.join(' · ')
})
</script>

<template>
    <main class="received">
        <section v-if="result && rows" class="card" aria-labelledby="received-title">
            <p class="label">Result received</p>
            <h1 id="received-title">{{ title }}</h1>
            <p class="details">{{ details }}</p>
            <ResultTable :rows="rows" />
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
