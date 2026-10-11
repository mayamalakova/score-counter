<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Side } from './types'

const props = defineProps<{
    side: Side
}>()

// Changing the key restarts the hop animation on every change of service.
const hops = ref(0)
watch(
    () => props.side,
    () => hops.value++
)
</script>

<template>
    <div class="ball-position" :class="side" role="img" :aria-label="`${side} player serves`">
        <span :key="hops" class="ball" :class="{ hop: hops > 0 }"></span>
    </div>
</template>

<style scoped>
/*
 * The ball sits at the top end of the net, on the serving side (in doubles, the serving
 * pair's side). It's the only serve marker on the net, so it's kept plain: which serve
 * of the two it is can be read from the score.
 */
.ball-position {
    --ball-size: clamp(22px, 6vmin, 32px);
    --gap: 14px;
    position: absolute;
    top: var(--gap);
    left: calc(50% - var(--gap) - var(--ball-size));
    transition:
        left 0.45s ease-in-out,
        top 0.45s ease-in-out;
    pointer-events: none;
    z-index: 1;
}

.ball-position.right {
    left: calc(50% + var(--gap));
}

.ball {
    display: block;
    width: var(--ball-size);
    height: var(--ball-size);
    border-radius: 50%;
    background: var(--ball);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
}

/* The ball is at the top edge, so it arcs down and back while it crosses the net. */
.hop {
    animation: hop 0.45s ease-out;
}

@keyframes hop {
    50% {
        transform: translateY(28px) scale(1.15);
    }
}

/* Upright the net runs across the middle: the ball sits at its right end, above or below it. */
@media (orientation: portrait) {
    .ball-position,
    .ball-position.right {
        left: auto;
        right: var(--gap);
    }

    .ball-position {
        top: calc(50% - var(--gap) - var(--ball-size));
    }

    .ball-position.right {
        top: calc(50% + var(--gap));
    }

    @keyframes hop {
        50% {
            transform: translateX(-28px) scale(1.15);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .ball-position {
        transition: none;
    }

    .hop {
        animation: none;
    }
}
</style>
