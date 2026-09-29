<script setup lang="ts">
import { computed } from 'vue'
import { gamesWon } from './gamesWon'
import type { SideScore } from './types'

const props = defineProps<{
    playerLeft: string
    playerRight: string
    gameScores: SideScore[]
}>()

const games = computed(() => gamesWon(props.gameScores))
</script>

<template>
    <div class="score-footer">

        <div class="player-name left">{{ playerLeft }}</div>

        <div>
            {{ games.left }} : {{ games.right }}
        </div>

        <div class="player-name right">{{ playerRight }}</div>
    </div>
</template>
