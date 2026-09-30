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
.ball-position {
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

.ball {
    display: block;
    width: clamp(18px, 4vmin, 30px);
    height: clamp(18px, 4vmin, 30px);
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
