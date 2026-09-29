<script setup lang="ts">
import { computed } from 'vue'
import PlayerNameInput from './PlayerNameInput.vue'
import ServerInput from './ServerInput.vue'
import { gamesWon } from './gamesWon'
import type { Side, SideScore } from './types'

const props = defineProps<{
    gameScores: SideScore[]
}>()

const playerLeft = defineModel<string>('playerLeft', { required: true })
const playerRight = defineModel<string>('playerRight', { required: true })
const newServer = defineModel<Side>('newServer', { required: true })

const games = computed(() => gamesWon(props.gameScores))
</script>

<template>
    <div class="score-footer">
        <div class="player-field">
            <PlayerNameInput v-model="playerLeft"/>
            <ServerInput :checked="newServer === 'left'" @select="newServer = 'left'"/>
        </div>

        <div class="game-score">
            {{ games.left }} : {{ games.right }}
        </div>

        <div class="player-field">
            <PlayerNameInput v-model="playerRight"/>
            <ServerInput :checked="newServer === 'right'" @select="newServer = 'right'"/>
        </div>

    </div>
</template>
