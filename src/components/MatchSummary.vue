<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'
import ResultCard from './ResultCard.vue'
import type { ResultRow } from './ResultTable.vue'
import type { PlayerView, SideScore } from './types'

const props = defineProps<{
    left: PlayerView
    right: PlayerView
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
        <ResultCard :rows="rows" title-id="summary-title" heading="h2">
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
        </ResultCard>
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

.actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}
</style>
