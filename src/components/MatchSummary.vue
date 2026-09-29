<script setup lang="ts">
import Icon from './Icon.vue'
import type { PlayerView, SideScore } from './types'

defineProps<{
    left: PlayerView
    right: PlayerView
    winner: string
    gameScores: SideScore[]
}>()

const emit = defineEmits<{
    undo: []
    'next-match': []
}>()
</script>

<template>
    <div class="backdrop">
        <section class="card" aria-labelledby="summary-title">
            <h2 id="summary-title">{{ winner }} wins {{ Math.max(left.games, right.games) }}–{{ Math.min(left.games, right.games) }}</h2>
            <table class="match-result">
                <thead>
                    <tr>
                        <th scope="col"><span class="visually-hidden">Player</span></th>
                        <th v-for="(_, index) in gameScores" :key="index" scope="col">{{ index + 1 }}</th>
                        <th scope="col">Games</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, row) in [left, right]" :key="row">
                        <th scope="row"><span class="dot" :style="{ background: player.color }"></span>{{ player.name }}</th>
                        <td v-for="(score, index) in gameScores" :key="index"
                            :class="{ won: row === 0 ? score.left > score.right : score.right > score.left }">
                            {{ row === 0 ? score.left : score.right }}
                        </td>
                        <td class="games">{{ player.games }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="actions">
                <button class="button" type="button" @click="emit('undo')">
                    <Icon name="undo"/> Undo last point
                </button>
                <button class="button primary next-match" type="button" @click="emit('next-match')">
                    New match <Icon name="next"/>
                </button>
            </div>
        </section>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgb(10 30 60 / 0.6);
    z-index: 10;
}

.card {
    max-width: 100%;
    padding: 16px 20px 20px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
}

h2 {
    margin: 0 0 8px;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

.match-result {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-variant-numeric: tabular-nums;
}

th, td {
    padding: 4px 8px;
    text-align: center;
}

th[scope="row"] {
    text-align: left;
    white-space: nowrap;
}

td.won, td.games {
    font-weight: 700;
}

.dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 50%;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
}
</style>
