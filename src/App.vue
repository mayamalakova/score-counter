<script setup lang="ts">
import { computed, ref } from 'vue'
import EditPanel from './components/EditPanel.vue'
import MatchSummary from './components/MatchSummary.vue'
import Scoreboard from './components/Scoreboard.vue'
import SetUp from './components/SetUp.vue'
import type { PlayerView, Side, SideScore } from './components/types'
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

// Colours follow the player, not the side.
const colors: Record<Player, string> = { A: 'var(--player-a)', B: 'var(--player-b)' }
const defaultNames: Record<Player, string> = { A: 'Player 1', B: 'Player 2' }

const ends = computed(() => scoring.ends(match.value))
const currentGame = computed(() => scoring.currentGame(match.value))
const scoreLeft = computed(() => currentGame.value.score[ends.value.left])
const scoreRight = computed(() => currentGame.value.score[ends.value.right])
const server = computed<Side>(() => scoring.server(match.value) === ends.value.left ? 'left' : 'right')
const gameWinner = computed(() => currentGame.value.winner)
const matchWinner = computed(() => scoring.matchWinner(match.value))
const gameNumber = computed(() => scoring.games(match.value).length)

function displayName(player: Player): string {
    return names.value[player].trim() || defaultNames[player]
}

function playerView(player: Player): PlayerView {
    return {
        name: displayName(player),
        color: colors[player],
        score: currentGame.value.score[player],
        games: scoring.gamesWon(match.value)[player]
    }
}

const left = computed(() => playerView(ends.value.left))
const right = computed(() => playerView(ends.value.right))

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

function undo() {
    match.value = scoring.undo(match.value)
}
</script>

<template>
    <SetUp v-if="!gameStarted"
           v-model:player-left="playerLeft"
           v-model:player-right="playerRight"
           v-model:swap-server="swapServer"
           v-model:points-to-win="pointsToWin"
           v-model:best-of="bestOf"
           :color-left="colors.A" :color-right="colors.B"
           @start-match="startMatch"/>

    <template v-else>
        <Scoreboard :left="left" :right="right" :server="server"
                    :game-number="gameNumber" :best-of="match.settings.bestOf"
                    :points-to-win="match.settings.pointsToWin"
                    :game-winner="gameWinner && !matchWinner ? displayName(gameWinner) : null"
                    @increase-left="increaseLeft"
                    @decrease-left="decreaseLeft"
                    @increase-right="increaseRight"
                    @decrease-right="decreaseRight"
                    @toggle-edit="toggleEdit" @restart="restart"
                    @undo="undo" @next-game="nextGame"/>

        <MatchSummary v-if="matchWinner"
                      :left="left" :right="right" :winner="displayName(matchWinner)" :game-scores="gameScores"
                      @undo="undo" @next-match="nextMatch"/>

        <EditPanel v-else-if="editMode"
                   v-model:player-left="playerLeft"
                   v-model:player-right="playerRight"
                   v-model:server="newServer"
                   :color-left="left.color" :color-right="right.color"
                   @done="toggleEdit"/>
    </template>
</template>
