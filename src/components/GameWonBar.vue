<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{
    winner: string
    gameNumber: number
}>()

const emit = defineEmits<{
    undo: []
    'next-game': []
}>()
</script>

<template>
    <div class="bar" role="status">
        <span><strong>{{ winner }}</strong> wins game {{ gameNumber }}</span>
        <button class="button" type="button" @click="emit('undo')">
            <Icon name="undo"/> Undo
        </button>
        <button class="button primary next-game" type="button" @click="emit('next-game')">
            Next game <Icon name="next"/>
        </button>
    </div>
</template>

<style scoped>
.bar {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
    white-space: nowrap;
    z-index: 2;
}

/* Upright, the bottom edge holds the lower player's minus button: sit on the net instead. */
@media (orientation: portrait) {
    .bar {
        top: 50%;
        bottom: auto;
        transform: translate(-50%, -50%);
    }
}
</style>
