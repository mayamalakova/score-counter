<script setup lang="ts">
import PlayerNameInput from './PlayerNameInput.vue'
import ServerInput from './ServerInput.vue'
import type { BestOf, PointsToWin } from '../scoring/match'

const emit = defineEmits<{
    'start-match': []
}>()

const playerLeft = defineModel<string>('playerLeft', { required: true })
const playerRight = defineModel<string>('playerRight', { required: true })
/** False when the left player serves first, true for the right player. */
const swapServer = defineModel<boolean>('swapServer', { required: true })
const pointsToWin = defineModel<PointsToWin>('pointsToWin', { required: true })
const bestOf = defineModel<BestOf>('bestOf', { required: true })

const pointsOptions: PointsToWin[] = [11, 21]
const bestOfOptions: BestOf[] = [1, 3, 5, 7]
</script>

<template>
    <div>
        <h1>Start a new match</h1>
        <div class="set-up-game">
            <div class="player-field">
                <PlayerNameInput v-model="playerLeft"/>
                <ServerInput :checked="true" @select="swapServer = false"/>
            </div>

            <div class="player-field">
                <PlayerNameInput v-model="playerRight"/>
                <ServerInput :checked="false" @select="swapServer = true"/>
            </div>

        </div>
        <div class="match-settings">
            <label>
                Points per game
                <select class="setting-select" v-model.number="pointsToWin">
                    <option v-for="points in pointsOptions" :key="points" :value="points">{{ points }}</option>
                </select>
            </label>
            <label>
                Best of
                <select class="setting-select" v-model.number="bestOf">
                    <option v-for="games in bestOfOptions" :key="games" :value="games">{{ games }}</option>
                </select>
            </label>
        </div>
        <div class="btn-large" @click.stop="emit('start-match')">
            <div>Start</div>
            <div class="icon-arrow-right"></div>
        </div>

    </div>
</template>
