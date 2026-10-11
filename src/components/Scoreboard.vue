<script setup lang="ts">
import { computed } from 'vue'
import FullscreenButton from './FullscreenButton.vue'
import GameWonBar from './GameWonBar.vue'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'
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
    'open-menu': []
    undo: []
    'next-game': []
}>()

const t = useMessages()

/** The match settings under the game number, e.g. "best of 5 · to 11". */
const settings = computed(() =>
    [
        t.value.bestOfGames(props.bestOf),
        t.value.toPoints(props.pointsToWin),
        props.doubles && t.value.doublesShort
    ]
        .filter(Boolean)
        .join(' · ')
)
</script>

<template>
    <div class="board">
        <PlayerHalf
            side="left"
            :player="left"
            :serving="server === 'left'"
            @increase="emit('increase-left')"
            @decrease="emit('decrease-left')"
        />
        <PlayerHalf
            side="right"
            :player="right"
            :serving="server === 'right'"
            @increase="emit('increase-right')"
            @decrease="emit('decrease-right')"
        />
        <ServerBall :side="server" />

        <!-- Games won sit at the bottom end of the net, each in its player's colour. -->
        <div class="match-score">
            <span
                class="games-won"
                role="img"
                :aria-label="`${left.name}: ${t.gamesWon(left.games)}`"
                :style="{ background: left.color }"
                >{{ left.games }}</span
            >
            <span class="info">
                <strong>{{ t.gameNumber(gameNumber) }}</strong>
                <span>{{ settings }}</span>
            </span>
            <span
                class="games-won"
                role="img"
                :aria-label="`${right.name}: ${t.gamesWon(right.games)}`"
                :style="{ background: right.color }"
                >{{ right.games }}</span
            >
        </div>

        <button class="corner-button menu" type="button" :aria-label="t.matchMenu" @click="emit('open-menu')">
            <Icon name="menu" />
        </button>
        <!-- The class lands on the button (its only root), so this file's .corner-button style applies. -->
        <FullscreenButton class="corner-button fullscreen" />

        <GameWonBar
            v-if="gameWinner"
            :winner="gameWinner"
            :game-number="gameNumber"
            @undo="emit('undo')"
            @next-game="emit('next-game')"
        />
    </div>
</template>

<style scoped>
/* Each half fills its side of the screen; the white net between them is the only line. */
.board {
    --net: 6px;
    position: relative;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--net);
    background: var(--line);
}

.match-score {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border-radius: 12px 12px 0 0;
    background: #fff;
    color: var(--ink);
    box-shadow: 0 -2px 8px rgb(0 0 0 / 0.25);
    white-space: nowrap;
}

.games-won {
    min-width: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.3rem;
    color: #fff;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: clamp(1.6rem, 7vmin, 2.3rem);
    font-variant-numeric: tabular-nums;
}

.info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    font-size: 0.75rem;
    line-height: 1.25;
}

.info strong {
    font-size: 0.9rem;
}

.corner-button {
    position: absolute;
    top: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius);
    background: rgb(0 0 0 / 0.22);
    z-index: 2;
}

.menu {
    left: 10px;
}

.fullscreen {
    right: 10px;
}

/* Upright the halves stack and the net runs across the middle. */
@media (orientation: portrait) {
    .board {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
        column-gap: 0;
        row-gap: var(--net);
    }
}
</style>
