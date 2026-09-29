<script setup lang="ts">
import { computed } from 'vue'
import NextGameButton from './NextGameButton.vue'
import PlayerScore from './PlayerScore.vue'
import ScoreFooter from './ScoreFooter.vue'
import TopToolbar from './TopToolbar.vue'
import { scoreClass } from './scoreClass'
import type { Side, SideScore } from './types'

const props = defineProps<{
    scoreLeft: number
    scoreRight: number
    server: Side
    gameWon: boolean
    playerLeft: string
    playerRight: string
    gameScores: SideScore[]
}>()

const emit = defineEmits<{
    'increase-left': []
    'decrease-left': []
    'increase-right': []
    'decrease-right': []
    'toggle-edit': []
    restart: []
    'next-game': []
}>()

const valClass = computed(() => scoreClass(props.scoreLeft, props.scoreRight))
</script>

<template>
    <div class="container">
        <TopToolbar @toggle-edit="emit('toggle-edit')" @restart="emit('restart')"/>

        <div class="score-container">
            <PlayerScore :val-class="valClass"
                         :score="scoreLeft" :server="server" side="left"
                         @increase="emit('increase-left')"
                         @decrease="emit('decrease-left')"/>

            <PlayerScore :val-class="valClass"
                         :score="scoreRight" :server="server" side="right"
                         @increase="emit('increase-right')"
                         @decrease="emit('decrease-right')"/>

            <NextGameButton v-if="gameWon" @click="emit('next-game')"/>
        </div>

        <ScoreFooter :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"/>
    </div>
</template>
