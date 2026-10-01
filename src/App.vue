<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import EditPanel from './components/EditPanel.vue'
import MatchSummary from './components/MatchSummary.vue'
import Scoreboard from './components/Scoreboard.vue'
import SetUp from './components/SetUp.vue'
import type { PlayerView, Side, SideScore } from './components/types'
import * as doubles from './scoring/doubles'
import * as scoring from './scoring/match'
import type { BestOf, DoublesPlayer, DoublesTeam, Format, Player, PointsToWin, Serve } from './scoring/match'
import { DEFAULT_DOUBLES_ORDER, load, save } from './storage'

// A reload goes straight back to where it was: set-up, mid-game or the summary.
const saved = load()
const gameStarted = ref(saved?.gameStarted ?? false)
const match = ref(saved?.match ?? scoring.newMatch())
// Names are kept per player (A starts on the left), so they follow the
// players when ends change.
const names = ref<Record<Player, string>>(saved?.names ?? { A: '', B: '' })
// In doubles, each side's second player.
const partners = ref<Record<DoublesTeam, string>>(saved?.partners ?? { A: '', B: '' })
// Set-up choices for the next match.
const format = ref<Format>(saved?.format ?? 'singles')
const firstServer = ref<Player>(saved?.firstServer ?? 'A')
const doublesOrder = ref<Serve>(saved?.doublesOrder ?? DEFAULT_DOUBLES_ORDER)
const pointsToWin = ref<PointsToWin>(saved?.pointsToWin ?? 11)
const bestOf = ref<BestOf>(saved?.bestOf ?? 5)
const editMode = ref(false)
const newServer = ref<Side>('left')
const newServe = ref<Serve>(DEFAULT_DOUBLES_ORDER)

// Colours follow the player, not the side.
const colors: Record<Player, string> = { A: 'var(--player-a)', B: 'var(--player-b)' }
const defaultNames: Record<Player, string> = { A: 'Player 1', B: 'Player 2' }
const defaultDoublesNames: Record<DoublesPlayer, string> = {
    A1: 'Player 1',
    A2: 'Player 2',
    B1: 'Player 3',
    B2: 'Player 4'
}

watchEffect(() =>
    save({
        gameStarted: gameStarted.value,
        match: match.value,
        names: { ...names.value },
        partners: { ...partners.value },
        format: format.value,
        firstServer: firstServer.value,
        doublesOrder: doublesOrder.value,
        pointsToWin: pointsToWin.value,
        bestOf: bestOf.value
    })
)

const ends = computed(() => scoring.ends(match.value))
const currentGame = computed(() => scoring.currentGame(match.value))
const isDoubles = computed(() => match.value.settings.format === 'doubles')
const servingPair = computed<Player>(() =>
    isDoubles.value
        ? scoring.getDoublesTeam(doubles.currentServe(match.value).server)
        : scoring.server(match.value)
)
const server = computed<Side>(() => (servingPair.value === ends.value.left ? 'left' : 'right'))
const gameWinner = computed(() => currentGame.value.winner)
const matchWinner = computed(() => scoring.matchWinner(match.value))
const gameNumber = computed(() => scoring.games(match.value).length)

function doublesName(player: DoublesPlayer): string {
    const team = scoring.getDoublesTeam(player)
    const name = player[1] === '1' ? names.value[team] : partners.value[team]
    return name.trim() || defaultDoublesNames[player]
}

/** A player's name in singles, or the team's names ("Ana / Eva") in doubles. */
function displayName(player: Player): string {
    if (isDoubles.value) return `${doublesName(`${player}1`)} / ${doublesName(`${player}2`)}`
    return names.value[player].trim() || defaultNames[player]
}

function playerView(player: Player): PlayerView {
    const view: PlayerView = {
        name: displayName(player),
        color: colors[player],
        score: currentGame.value.score[player],
        games: scoring.gamesWon(match.value)[player]
    }
    if (isDoubles.value) {
        const { right, left } = doubles.positions(match.value)[player]
        view.courts = { right: doublesName(right), left: doublesName(left) }
    }
    return view
}

const left = computed(() => playerView(ends.value.left))
const right = computed(() => playerView(ends.value.right))

// Finished games (including one just won), oriented to the current ends.
const gameScores = computed<SideScore[]>(() =>
    scoring
        .games(match.value)
        .filter(game => game.winner)
        .map(game => ({ left: game.score[ends.value.left], right: game.score[ends.value.right] }))
)

const playerLeft = computed({
    get: () => names.value[ends.value.left],
    set: name => {
        names.value[ends.value.left] = name
    }
})

const playerRight = computed({
    get: () => names.value[ends.value.right],
    set: name => {
        names.value[ends.value.right] = name
    }
})

// The set-up screen picks the server by side; A is on the left at the start.
const swapServer = computed({
    get: () => firstServer.value === 'B',
    set: swap => {
        firstServer.value = swap ? 'B' : 'A'
    }
})

function sidePlayer(side: Side): Player {
    return side === 'left' ? ends.value.left : ends.value.right
}

function nextMatch() {
    // Whoever ended the match on the left starts the next one there.
    if (ends.value.left === 'B') {
        names.value = { A: names.value.B, B: names.value.A }
        partners.value = { A: partners.value.B, B: partners.value.A }
    }
    firstServer.value = 'A'
    doublesOrder.value = DEFAULT_DOUBLES_ORDER
    match.value = scoring.newMatch()
    gameStarted.value = false
}

function endMatch() {
    editMode.value = false
    nextMatch()
}

function startMatch() {
    match.value = scoring.newMatch({
        format: format.value,
        doublesOrder: format.value === 'doubles' ? doublesOrder.value : null,
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
        if (isDoubles.value) newServe.value = doubles.currentServe(match.value)
    } else if (isDoubles.value) {
        match.value = doubles.correctServe(match.value, newServe.value)
    } else {
        match.value = scoring.correctServer(match.value, sidePlayer(newServer.value))
    }
}

/** Doubles players for the edit panel, left team first, with the names as typed. */
const doublesPlayers = computed(() => {
    if (!isDoubles.value) return undefined
    return [ends.value.left, ends.value.right].flatMap(team =>
        ([`${team}1`, `${team}2`] as DoublesPlayer[]).map(id => ({
            id,
            name: id[1] === '1' ? names.value[team] : partners.value[team],
            color: colors[team]
        }))
    )
})

function rename(player: DoublesPlayer, name: string) {
    const team = scoring.getDoublesTeam(player)
    if (player[1] === '1') names.value = { ...names.value, [team]: name }
    else partners.value = { ...partners.value, [team]: name }
}

function restart() {
    match.value = scoring.restart(match.value)
}

function undo() {
    match.value = scoring.undo(match.value)
}
</script>

<template>
    <SetUp
        v-if="!gameStarted"
        v-model:names="names"
        v-model:partners="partners"
        v-model:format="format"
        v-model:swap-server="swapServer"
        v-model:doubles-order="doublesOrder"
        v-model:points-to-win="pointsToWin"
        v-model:best-of="bestOf"
        :color-left="colors.A"
        :color-right="colors.B"
        @start-match="startMatch"
    />

    <template v-else>
        <Scoreboard
            :left="left"
            :right="right"
            :server="server"
            :game-number="gameNumber"
            :best-of="match.settings.bestOf"
            :points-to-win="match.settings.pointsToWin"
            :doubles="isDoubles"
            :game-winner="gameWinner && !matchWinner ? displayName(gameWinner) : null"
            @increase-left="increaseLeft"
            @decrease-left="decreaseLeft"
            @increase-right="increaseRight"
            @decrease-right="decreaseRight"
            @toggle-edit="toggleEdit"
            @restart="restart"
            @undo="undo"
            @next-game="nextGame"
        />

        <MatchSummary
            v-if="matchWinner"
            :left="left"
            :right="right"
            :winner="displayName(matchWinner)"
            :game-scores="gameScores"
            @undo="undo"
            @next-match="nextMatch"
        />

        <EditPanel
            v-else-if="editMode"
            v-model:player-left="playerLeft"
            v-model:player-right="playerRight"
            v-model:server="newServer"
            v-model:serve="newServe"
            :doubles-players="doublesPlayers"
            :color-left="left.color"
            :color-right="right.color"
            @done="toggleEdit"
            @end-match="endMatch"
            @rename="rename"
        />
    </template>
</template>
