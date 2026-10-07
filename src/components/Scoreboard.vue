<script setup lang="ts">
import { computed } from 'vue'
import FullscreenButton from './FullscreenButton.vue'
import GameWonBar from './GameWonBar.vue'
import Icon from './Icon.vue'
import PlayerHalf from './PlayerHalf.vue'
import ServerBall from './ServerBall.vue'
import type { PlayerView, Side } from './types'

const props = defineProps<{
    left: PlayerView
    right: PlayerView
    server: Side
    gameNumber: number
    bestOf: number
    pointsToWin: number
    doubles: boolean
    /** Name of the player who just won the game, while waiting for the next one. */
    gameWinner: string | null
}>()

const emit = defineEmits<{
    'increase-left': []
    'decrease-left': []
    'increase-right': []
    'decrease-right': []
    'toggle-edit': []
    restart: []
    undo: []
    'next-game': []
}>()

const info = computed(() =>
    [
        `Game ${props.gameNumber}`,
        `best of ${props.bestOf}`,
        `to ${props.pointsToWin}`,
        props.doubles && 'doubles'
    ]
        .filter(Boolean)
        .join(' · ')
)
</script>

<template>
    <div class="board">
        <header class="top-bar">
            <button class="icon-button" type="button" aria-label="Restart game" @click="emit('restart')">
                <Icon name="restart" />
            </button>
            <span class="info">{{ info }}</span>
            <div class="actions">
                <FullscreenButton class="icon-button" />
                <button
                    class="icon-button"
                    type="button"
                    aria-label="Edit players and server"
                    @click="emit('toggle-edit')"
                >
                    <Icon name="edit" />
                </button>
            </div>
        </header>

        <div class="table">
            <PlayerHalf
                side="left"
                :player="left"
                @increase="emit('increase-left')"
                @decrease="emit('decrease-left')"
            />
            <PlayerHalf
                side="right"
                :player="right"
                @increase="emit('increase-right')"
                @decrease="emit('decrease-right')"
            />
            <div v-if="doubles" class="centre-line" aria-hidden="true"></div>
            <div class="net" aria-hidden="true"></div>
            <ServerBall :side="server" :doubles="doubles" />
            <GameWonBar
                v-if="gameWinner"
                :winner="gameWinner"
                :game-number="gameNumber"
                @undo="emit('undo')"
                @next-game="emit('next-game')"
            />
        </div>
    </div>
</template>

<style scoped>
.board {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px 12px 12px;
    gap: 8px;
}

/* Sideways the net runs down the middle: equal outer columns keep the info centred over it. */
.top-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.info {
    font-size: clamp(0.8rem, 2.8vmin, 1.1rem);
    opacity: 0.9;
    text-align: center;
}

.icon-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgb(255 255 255 / 0.7);
    border-radius: var(--radius);
    background: none;
}

.table {
    position: relative;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 4px solid var(--line);
    border-radius: 6px;
}

.net {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 4px;
    margin-left: -2px;
    background: var(--line);
    pointer-events: none;
}

/* Doubles: the centre line splits each end into two half-courts. */
.centre-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    margin-top: -1px;
    background: rgb(255 255 255 / 0.75);
    pointer-events: none;
}

@media (orientation: portrait) {
    /* Upright the net runs across, so the info takes all the room between the buttons instead. */
    .top-bar {
        display: flex;
        justify-content: space-between;
    }

    .centre-line {
        top: 0;
        bottom: 0;
        left: 50%;
        right: auto;
        width: 2px;
        height: auto;
        margin: 0 0 0 -1px;
    }

    .table {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }

    .net {
        top: 50%;
        bottom: auto;
        left: 0;
        right: 0;
        width: auto;
        height: 4px;
        margin: -2px 0 0;
    }
}
</style>
