<script setup lang="ts">
import ServerIndicator from './ServerIndicator.vue'
import type { Side } from './types'

defineProps<{
    score: number
    server: Side
    side: Side
    valClass: string
}>()

const emit = defineEmits<{
    increase: []
    decrease: []
}>()
</script>

<template>
    <div :class="`score-${side}`" @click="emit('increase')">
        <div class="score-val">
            <span :class="valClass">{{ score }} </span>

            <ServerIndicator :server="server" :side="side"/>
        </div>
        <div class="btn-minus" @click.stop="emit('decrease')">-</div>
    </div>
</template>
