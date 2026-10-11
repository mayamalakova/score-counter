<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Side } from './types'

const props = defineProps<{
    side: Side
    /** Doubles: the ball goes in the server's half-court, not just on their side. */
    doubles: boolean
    /** Read out instead of the picture, e.g. "Ana serves". */
    label: string
}>()

// Changing the key restarts the hop animation on every change of service.
const hops = ref(0)
watch(
    () => props.side,
    () => hops.value++
)
</script>

<template>
    <div class="ball-position" :class="[side, { doubles }]" role="img" :aria-label="label">
        <span :key="hops" class="ball" :class="{ hop: hops > 0 }"></span>
    </div>
</template>

<style scoped>
/*
 * The ball sits by the net on the serving side. It's the only serve marker on the net,
 * so it's kept plain: which serve of the two it is can be read from the score.
 *
 * Singles: at the top end of the net. Doubles: in the server's half-court, which is
 * always their pair's right half-court: the near (bottom) half at the left end and the
 * far (top) half at the right end, so the half with the ball is the server's.
 */
.ball-position {
    --ball-size: clamp(22px, 6vmin, 32px);
    --gap: 14px;
    /* Doubles at the bottom: clear of the games box at the foot of the net. */
    --above-games: 64px;
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

.ball-position.doubles.left {
    top: calc(100% - var(--above-games) - var(--ball-size));
}

.ball {
    display: block;
    width: var(--ball-size);
    height: var(--ball-size);
    border-radius: 50%;
    background: var(--ball);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
}

/* The ball arcs away from the edge it sits at while it crosses the net. */
.hop {
    animation: hop-down 0.45s ease-out;
}

.doubles.left .hop {
    animation-name: hop-up;
}

@keyframes hop-down {
    50% {
        transform: translateY(28px) scale(1.15);
    }
}

@keyframes hop-up {
    50% {
        transform: translateY(-28px) scale(1.15);
    }
}

@keyframes hop-left {
    50% {
        transform: translateX(-28px) scale(1.15);
    }
}

@keyframes hop-right {
    50% {
        transform: translateX(28px) scale(1.15);
    }
}

/*
 * Upright the net runs across the middle and the picture is turned a quarter turn:
 * singles sit at the net's right end, above or below it. In doubles the top pair's
 * right half-court is on the left and the bottom pair's on the right.
 */
@media (orientation: portrait) {
    .ball-position,
    .ball-position.right {
        left: auto;
        right: var(--gap);
    }

    .ball-position,
    .ball-position.doubles.left {
        top: calc(50% - var(--gap) - var(--ball-size));
    }

    .ball-position.right {
        top: calc(50% + var(--gap));
    }

    /*
     * Only left, so the ball glides across in doubles rather than jumping. It keeps clear
     * of the upper player's minus button, which sits at the net's left end (12px from the
     * edge, --minus-size wide); the bottom end mirrors it.
     */
    .ball-position.doubles {
        --inset: calc(12px + var(--minus-size) + 12px);
        right: auto;
        left: calc(100% - var(--inset) - var(--ball-size));
    }

    .ball-position.doubles.left {
        left: var(--inset);
    }

    .hop {
        animation-name: hop-left;
    }

    .doubles.left .hop {
        animation-name: hop-right;
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
