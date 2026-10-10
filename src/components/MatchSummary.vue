<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'
import ResultTable, { type ResultRow } from './ResultTable.vue'
import type { PlayerView, SideScore } from './types'

const props = defineProps<{
    left: PlayerView
    right: PlayerView
    winner: string
    gameScores: SideScore[]
}>()

const emit = defineEmits<{
    undo: []
    share: []
    'next-match': []
}>()

const t = useMessages()

const rows = computed<[ResultRow, ResultRow]>(() => [
    { ...props.left, scores: props.gameScores.map(game => game.left) },
    { ...props.right, scores: props.gameScores.map(game => game.right) }
])
</script>

<template>
    <div class="backdrop">
        <section class="card" aria-labelledby="summary-title">
            <h2 id="summary-title">
                {{
                    t.winsMatch(winner, Math.max(left.games, right.games), Math.min(left.games, right.games))
                }}
            </h2>
            <ResultTable :rows="rows" />
            <div class="actions">
                <button class="button" type="button" @click="emit('undo')">
                    <Icon name="undo" /> {{ t.undoLastPoint }}
                </button>
                <button class="button share" type="button" @click="emit('share')">
                    <Icon name="qr" /> {{ t.shareResult }}
                </button>
                <button class="button primary next-match" type="button" @click="emit('next-match')">
                    {{ t.newMatch }} <Icon name="next" />
                </button>
            </div>
        </section>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgb(10 30 60 / 0.6);
    z-index: 10;
}

.card {
    max-width: 100%;
    padding: 16px 20px 20px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
}

h2 {
    margin: 0 0 8px;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}

/* Room for a best of 7 in the result table on a small phone. */
@media (max-width: 420px) {
    .card {
        padding-inline: 12px;
    }
}
</style>
