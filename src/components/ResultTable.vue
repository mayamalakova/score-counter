<script setup lang="ts">
export interface ResultRow {
    name: string
    color: string
    /** This player's score in each game, in order. */
    scores: number[]
    games: number
}

defineProps<{
    /** The two players (or doubles teams), in the order to show them. */
    rows: [ResultRow, ResultRow]
}>()
</script>

<template>
    <table class="match-result">
        <thead>
            <tr>
                <th scope="col"><span class="visually-hidden">Player</span></th>
                <th v-for="(_, index) in rows[0].scores" :key="index" scope="col">{{ index + 1 }}</th>
                <th scope="col">Games</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, which) in rows" :key="which">
                <th scope="row">
                    <span class="dot" :style="{ background: row.color }"></span>{{ row.name }}
                </th>
                <td
                    v-for="(score, index) in row.scores"
                    :key="index"
                    :class="{ won: score > rows[which === 0 ? 1 : 0].scores[index] }"
                >
                    {{ score }}
                </td>
                <td class="games">{{ row.games }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.match-result {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-variant-numeric: tabular-nums;
}

th,
td {
    padding: 4px 8px;
    text-align: center;
}

th[scope='row'] {
    text-align: left;
    white-space: nowrap;
}

td.won,
td.games {
    font-weight: 700;
}

.dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 50%;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
}
</style>
