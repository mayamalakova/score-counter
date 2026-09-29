<script setup lang="ts">
import { computed, ref } from 'vue'
import EditScoreboard from './components/EditScoreboard.vue'
import MatchSummary from './components/MatchSummary.vue'
import Scoreboard from './components/Scoreboard.vue'
import SetUp from './components/SetUp.vue'
import type { Side, SideScore } from './components/types'
import * as scoring from './scoring/match'
import type { BestOf, Player, PointsToWin } from './scoring/match'

const gameStarted = ref(false)
const match = ref(scoring.newMatch())
// Names are kept per player (A starts on the left), so they follow the
// players when ends change.
const names = ref<Record<Player, string>>({ A: '', B: '' })
const firstServer = ref<Player>('A')
const pointsToWin = ref<PointsToWin>(11)
const bestOf = ref<BestOf>(5)
const editMode = ref(false)
const newServer = ref<Side>('left')

const ends = computed(() => scoring.ends(match.value))
const currentGame = computed(() => scoring.currentGame(match.value))
const scoreLeft = computed(() => currentGame.value.score[ends.value.left])
const scoreRight = computed(() => currentGame.value.score[ends.value.right])
const server = computed<Side>(() => scoring.server(match.value) === ends.value.left ? 'left' : 'right')
const gameWinner = computed(() => currentGame.value.winner)
const matchWinner = computed(() => scoring.matchWinner(match.value))

// Finished games (including one just won), oriented to the current ends.
const gameScores = computed<SideScore[]>(() => scoring.games(match.value)
    .filter(game => game.winner)
    .map(game => ({ left: game.score[ends.value.left], right: game.score[ends.value.right] })))

const playerLeft = computed({
    get: () => names.value[ends.value.left],
    set: name => { names.value[ends.value.left] = name }
})

const playerRight = computed({
    get: () => names.value[ends.value.right],
    set: name => { names.value[ends.value.right] = name }
})

// The set-up screen picks the server by side; A is on the left at the start.
const swapServer = computed({
    get: () => firstServer.value === 'B',
    set: swap => { firstServer.value = swap ? 'B' : 'A' }
})

function sidePlayer(side: Side): Player {
    return side === 'left' ? ends.value.left : ends.value.right
}

function nextMatch() {
    // Whoever ended the match on the left starts the next one there.
    names.value = { A: playerLeft.value, B: playerRight.value }
    firstServer.value = 'A'
    match.value = scoring.newMatch()
    gameStarted.value = false
}

function startMatch() {
    match.value = scoring.newMatch({
        firstServer: firstServer.value,
        pointsToWin: pointsToWin.value,
        bestOf: bestOf.value
    })
    gameStarted.value = true
}

function nextGame() {
    match.value = scoring.nextGame(match.value)
}

function increaseLeft() {
    match.value = scoring.addPoint(match.value, sidePlayer('left'))
}

function decreaseLeft() {
    match.value = scoring.removePoint(match.value, sidePlayer('left'))
}

function increaseRight() {
    match.value = scoring.addPoint(match.value, sidePlayer('right'))
}

function decreaseRight() {
    match.value = scoring.removePoint(match.value, sidePlayer('right'))
}

function toggleEdit() {
    editMode.value = !editMode.value
    if (editMode.value) {
        newServer.value = server.value
    } else {
        match.value = scoring.correctServer(match.value, sidePlayer(newServer.value))
    }
}

function restart() {
    match.value = scoring.restart(match.value)
}
</script>

<template>
    <SetUp v-if="!gameStarted"
           v-model:player-left="playerLeft"
           v-model:player-right="playerRight"
           v-model:swap-server="swapServer"
           v-model:points-to-win="pointsToWin"
           v-model:best-of="bestOf"
           @start-match="startMatch"/>

    <MatchSummary v-else-if="matchWinner"
                  :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"
                  @next-match="nextMatch"/>

    <Scoreboard v-else-if="!editMode"
                :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                :game-won="!!gameWinner"
                :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"
                @increase-left="increaseLeft"
                @decrease-left="decreaseLeft"
                @increase-right="increaseRight"
                @decrease-right="decreaseRight"
                @toggle-edit="toggleEdit" @restart="restart"
                @next-game="nextGame"/>

    <EditScoreboard v-else
                    :score-left="scoreLeft" :score-right="scoreRight" :game-scores="gameScores"
                    v-model:player-left="playerLeft"
                    v-model:player-right="playerRight"
                    v-model:new-server="newServer"
                    @toggle-edit="toggleEdit" @restart="restart"/>
</template>
