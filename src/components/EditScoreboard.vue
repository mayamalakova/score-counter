<script setup lang="ts">
import { computed } from 'vue'
import EditFooter from './EditFooter.vue'
import PlayerScore from './PlayerScore.vue'
import TopToolbar from './TopToolbar.vue'
import { scoreClass } from './scoreClass'
import type { Side, SideScore } from './types'

const props = defineProps<{
    scoreLeft: number
    scoreRight: number
    gameScores: SideScore[]
}>()

const emit = defineEmits<{
    'toggle-edit': []
    restart: []
}>()

const playerLeft = defineModel<string>('playerLeft', { required: true })
const playerRight = defineModel<string>('playerRight', { required: true })
const newServer = defineModel<Side>('newServer', { required: true })

const valClass = computed(() => scoreClass(props.scoreLeft, props.scoreRight))
</script>

<template>
    <div class="container">
        <TopToolbar @toggle-edit="emit('toggle-edit')" @restart="emit('restart')"/>

        <div class="score-container-edit">
            <PlayerScore :val-class="valClass"
                         :score="scoreLeft" :server="newServer" side="left"/>

            <PlayerScore :val-class="valClass"
                         :score="scoreRight" :server="newServer" side="right"/>
        </div>

        <EditFooter v-model:player-left="playerLeft"
                    v-model:player-right="playerRight"
                    v-model:new-server="newServer"
                    :game-scores="gameScores"/>
    </div>
</template>
