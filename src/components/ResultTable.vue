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
    <div class="scroll">
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
    </div>
</template>

<style scoped>
/* A best of 7 with long names can still be too wide for a small phone: then only the table scrolls. */
.scroll {
    max-width: 100%;
    overflow-x: auto;
    margin-bottom: 16px;
}

.match-result {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
}

th,
td {
    padding: 4px 8px;
    text-align: center;
}

/* Long doubles names wrap (at spaces, so usually at " / ") rather than push the scores off a phone. */
th[scope='row'] {
    min-width: 4.5em;
    text-align: left;
    overflow-wrap: anywhere;
}

@media (max-width: 420px) {
    .match-result {
        font-size: 0.9rem;
    }

    th,
    td {
        padding: 4px;
    }
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
