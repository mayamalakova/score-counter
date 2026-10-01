<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Side } from './types'

const props = defineProps<{
    side: Side
    /** Doubles: the ball sits in the server's right half-court instead of at the net's far end. */
    doubles?: boolean
}>()

// Changing the key restarts the hop animation on every change of service.
const hops = ref(0)
watch(
    () => props.side,
    () => hops.value++
)
</script>

<template>
    <div class="ball-position" :class="[side, { doubles }]" role="img" :aria-label="`${side} player serves`">
        <span :key="hops" class="ball" :class="{ hop: hops > 0 }"></span>
    </div>
</template>

<style scoped>
.ball-position {
    --ball-size: clamp(18px, 4vmin, 30px);
    position: absolute;
    top: 16px;
    left: calc(50% - 48px);
    transition:
        left 0.45s ease-in-out,
        top 0.45s ease-in-out;
    pointer-events: none;
}

.ball-position.right {
    left: calc(50% + 24px);
}

/* Doubles: the left end's right half-court is the near (bottom) half; the right end's is the far half. */
.ball-position.doubles.left {
    top: calc(100% - 16px - var(--ball-size));
}

.ball {
    display: block;
    width: var(--ball-size);
    height: var(--ball-size);
    border: 2px solid #fff;
    border-radius: 50%;
    background: var(--ball);
}

.hop {
    animation: hop 0.45s ease-out;
}

@keyframes hop {
    50% {
        transform: translateY(-40px);
    }
}

/* Upright, the upper player's minus button is at the left end of the net, so the ball uses the right end. */
@media (orientation: portrait) {
    .ball-position,
    .ball-position.right {
        left: auto;
        right: 16px;
    }

    .ball-position {
        top: calc(50% - 48px);
    }

    .ball-position.right {
        top: calc(50% + 24px);
    }

    /* Doubles upright: the top end's right half-court is on the left, the bottom end's on the right. */
    .ball-position.doubles.left {
        left: 16px;
        right: auto;
        top: calc(50% - 48px);
    }

    .ball-position.doubles.right {
        left: calc(100% - 16px - var(--ball-size));
        right: auto;
    }

    @keyframes hop {
        50% {
            transform: translateX(-40px) scale(1.2);
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
