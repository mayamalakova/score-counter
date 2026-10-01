<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import type { PlayerView, Side } from './types'

const props = defineProps<{
    player: PlayerView
    side: Side
}>()

/**
 * Doubles: where each player stands. The phone is on the table's near long side
 * (the screen's bottom edge), so a player's right half-court is the bottom half at
 * the left end and the top half at the right end.
 */
const courts = computed(() => {
    const { courts } = props.player
    if (!courts) return []
    return props.side === 'left'
        ? [
              { position: 'far', name: courts.left },
              { position: 'near', name: courts.right }
          ]
        : [
              { position: 'far', name: courts.right },
              { position: 'near', name: courts.left }
          ]
})

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
            <span v-if="!player.courts" class="name" :style="{ background: player.color }">{{
                player.name
            }}</span>
            <span class="score">{{ player.score }}</span>
            <span class="games">games {{ player.games }}</span>
        </button>
        <div
            v-for="court in courts"
            :key="court.position"
            class="name court"
            :class="court.position"
            :style="{ background: player.color }"
        >
            {{ court.name }}
        </div>
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

.court {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
}

.court.far {
    top: 12px;
}

.court.near {
    bottom: 14px;
}

@media (orientation: portrait) {
    .score {
        font-size: min(30vh, 58vw);
    }

    /* Upright the picture is turned a quarter turn: the near side is the left edge. */
    .court.far,
    .court.near {
        top: 50%;
        bottom: auto;
        transform: translateY(-50%);
        max-width: 40%;
    }

    .court.far {
        left: auto;
        right: 12px;
    }

    .court.near {
        left: 12px;
    }
}
</style>
