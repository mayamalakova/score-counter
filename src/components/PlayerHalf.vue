<script setup lang="ts">
import Icon from './Icon.vue'
import type { PlayerView, Side } from './types'

defineProps<{
    player: PlayerView
    side: Side
}>()

const emit = defineEmits<{
    increase: []
    decrease: []
}>()
</script>

<template>
    <div class="half" :class="side">
        <button
            class="point"
            type="button"
            :aria-label="`Point for ${player.name}`"
            @click="emit('increase')"
        >
            <span class="name" :style="{ background: player.color }">{{ player.name }}</span>
            <span class="score">{{ player.score }}</span>
            <span class="games">games {{ player.games }}</span>
        </button>
        <button
            class="minus"
            type="button"
            :aria-label="`Take a point from ${player.name}`"
            @click="emit('decrease')"
        >
            <Icon name="minus" />
        </button>
    </div>
</template>

<style scoped>
.half {
    position: relative;
    min-width: 0;
    min-height: 0;
}

.point {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    border: 0;
    background: none;
    user-select: none;
    touch-action: manipulation;
}

.point:active {
    background: rgb(255 255 255 / 0.06);
}

.name {
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0.2em 0.9em;
    border-radius: 999px;
    font-weight: 700;
    font-size: clamp(0.9rem, 3.5vmin, 1.6rem);
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.score {
    font-family: var(--font-score);
    font-weight: 900;
    font-size: min(58vh, 30vw);
    line-height: 0.85;
    font-variant-numeric: tabular-nums;
}

.games {
    font-size: clamp(0.8rem, 3vmin, 1.3rem);
    opacity: 0.85;
}

.minus {
    position: absolute;
    bottom: 12px;
    width: clamp(40px, 9vmin, 64px);
    height: clamp(40px, 9vmin, 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgb(255 255 255 / 0.8);
    border-radius: 50%;
    background: rgb(0 0 0 / 0.08);
    font-size: clamp(1rem, 4vmin, 1.8rem);
}

.left .minus {
    left: 12px;
}

.right .minus {
    right: 12px;
}

@media (orientation: portrait) {
    .score {
        font-size: min(30vh, 58vw);
    }
}
</style>
