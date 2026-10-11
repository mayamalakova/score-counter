<script setup lang="ts">
import { computed } from 'vue'
import { gamesWonFrom, type Player } from '../scoring/match'
import type { ReceivedLink, SharedResult } from '../sharing/result'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'
import ResultCard from './ResultCard.vue'
import type { ResultRow } from './ResultTable.vue'
import { playerColors } from './types'

const props = defineProps<{
    link: ReceivedLink
}>()

const emit = defineEmits<{
    back: []
}>()

const t = useMessages()

const view = computed(() => (props.link.status === 'ok' ? describe(props.link.result) : null))

/** The result card's rows and details for a shared result. */
function describe(result: SharedResult) {
    const won = gamesWonFrom(result.games)
    const row = (player: Player): ResultRow => ({
        name: result.names[player],
        color: playerColors[player],
        scores: result.games.map(game => game[player]),
        games: won[player]
    })
    const details = [t.value.bestOfGames(result.bestOf), t.value.toPoints(result.pointsToWin)]
    if (result.format === 'doubles') details.push(t.value.doublesShort)
    return {
        details: details.join(' · '),
        rows: [row('A'), row('B')] as [ResultRow, ResultRow]
    }
}
</script>

<template>
    <main class="received">
        <ResultCard
            v-if="view"
            :rows="view.rows"
            :details="view.details"
            :label="t.resultReceived"
            title-id="received-title"
            heading="h1"
        >
            <button class="button primary back" type="button" @click="emit('back')">
                {{ t.backToMyMatch }} <Icon name="next" />
            </button>
        </ResultCard>
        <section v-else class="card" role="alert">
            <h1>{{ t.unreadableResult }}</h1>
            <p>{{ t.unreadableHint }}</p>
            <button class="button primary back" type="button" @click="emit('back')">
                {{ t.backToMyMatch }} <Icon name="next" />
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

/* The card for a link that couldn't be read; a readable one uses ResultCard. */
h1 {
    margin: 0;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

.back {
    width: 100%;
    justify-content: center;
}
</style>
