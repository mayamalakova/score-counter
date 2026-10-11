<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'
import type { PlayerView, Side } from './types'

const props = defineProps<{
    player: PlayerView
    side: Side
    /** This player (in doubles, this pair) is serving: the half is drawn a shade lighter. */
    serving: boolean
}>()

const t = useMessages()

/**
 * Doubles: where each player stands. The phone is on the table's near long side
 * (the screen's bottom edge), so a player's right half-court is the bottom half at
 * the left end and the top half at the right end. The server always serves from
 * their right half-court, so that tag carries the serve dot.
 */
const courts = computed(() => {
    const { courts } = props.player
    if (!courts) return []
    const server = (court: 'right' | 'left') => props.serving && court === 'right'
    return props.side === 'left'
        ? [
              { position: 'far', name: courts.left, serves: server('left') },
              { position: 'near', name: courts.right, serves: server('right') }
          ]
        : [
              { position: 'far', name: courts.right, serves: server('right') },
              { position: 'near', name: courts.left, serves: server('left') }
          ]
})

const emit = defineEmits<{
    increase: []
    decrease: []
}>()
</script>

<template>
    <div class="half" :class="[side, { serving, doubles: player.courts }]">
        <button class="point" type="button" :aria-label="t.pointFor(player.name)" @click="emit('increase')">
            <span v-if="!player.courts" class="name" :style="{ background: player.color }">{{
                player.name
            }}</span>
            <span class="score">{{ player.score }}</span>
        </button>
        <div
            v-for="court in courts"
            :key="court.position"
            class="name court"
            :class="[court.position, { serves: court.serves }]"
            :style="{ background: player.color }"
        >
            <span v-if="court.serves" class="serve-dot" aria-hidden="true"></span>{{ court.name }}
        </div>
        <button
            class="minus"
            type="button"
            :aria-label="t.takePointFrom(player.name)"
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
    background: var(--table);
    transition: background-color 0.45s ease-in-out;
}

.half.serving {
    background: var(--table-serving);
}

/* Doubles: the centre line splits the end into two half-courts. */
.half.doubles::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    margin-top: -1px;
    background: rgb(255 255 255 / 0.75);
    pointer-events: none;
}

.point {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
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
    padding: 0.15em 0.8em;
    border: 2px solid var(--line);
    border-radius: 999px;
    font-weight: 700;
    font-size: clamp(0.95rem, 4.2vmin, 1.4rem);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.score {
    font-family: var(--font-score);
    font-weight: 900;
    font-size: min(60vh, 30vw);
    line-height: 0.85;
    font-variant-numeric: tabular-nums;
}

/* Doubles: room for a name tag above and below the score. */
.half.doubles .score {
    font-size: min(46vh, 26vw);
}

.minus {
    position: absolute;
    bottom: 12px;
    width: clamp(44px, 10vmin, 60px);
    height: clamp(44px, 10vmin, 60px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.22);
    font-size: clamp(1rem, 4vmin, 1.6rem);
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
    display: flex;
    align-items: center;
    gap: 0.4em;
    pointer-events: none;
}

.court.far {
    top: 16px;
}

.court.near {
    bottom: 16px;
}

.serve-dot {
    flex: none;
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    background: var(--ball);
}

@media (orientation: portrait) {
    .score {
        font-size: min(30vh, 58vw);
    }

    .half.doubles .score {
        font-size: min(26vh, 50vw);
    }

    /* Upright the picture is turned a quarter turn: the centre line runs down the middle. */
    .half.doubles::before {
        top: 0;
        bottom: 0;
        left: 50%;
        right: auto;
        width: 2px;
        height: auto;
        margin: 0 0 0 -1px;
    }

    /* The near side is the left edge. */
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
