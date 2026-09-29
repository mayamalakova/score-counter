<script setup lang="ts">
import { computed } from 'vue'
import { gamesWon } from './gamesWon'
import type { SideScore } from './types'

const props = defineProps<{
    playerLeft: string
    playerRight: string
    gameScores: SideScore[]
}>()

const emit = defineEmits<{
    'next-match': []
}>()

const games = computed(() => gamesWon(props.gameScores))
</script>

<template>
    <div class="cover-all">
        <div class="match-summary-box">
            <table class="match-result">
                <tr>
                    <thead class="player-name">{{ playerLeft }}</thead>
                    <td v-for="(score, index) in gameScores" :key="index">{{ score.left }}</td>
                    <td class="games-result">{{ games.left }}</td>
                </tr>
                <tr>
                    <thead class="player-name">{{ playerRight }}</thead>
                    <td v-for="(score, index) in gameScores" :key="index">{{ score.right }}</td>
                    <td class="games-result">{{ games.right }}</td>
                </tr>
            </table>
            <div class="btn-continue" @click.stop="emit('next-match')">
                <div>New match</div>
                <div class="icon-arrow-right"></div>
            </div>
        </div>
    </div>
</template>
