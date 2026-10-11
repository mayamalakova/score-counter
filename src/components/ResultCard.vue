<script setup lang="ts">
import { computed } from 'vue'
import { useMessages } from '../i18n'
import ResultTable, { type ResultRow } from './ResultTable.vue'

/**
 * A finished match's result: "Ana wins 3–1", an optional line of match details, and
 * the game-by-game table. The screen that shows it adds its own buttons in the slot.
 */
const props = defineProps<{
    /** The two players (or doubles teams), in the order to show them. */
    rows: [ResultRow, ResultRow]
    /** E.g. "of 5 · to 11 · doubles"; left out where the screen doesn't need it. */
    details?: string
    /** The headline's id, so the screen can name its dialog or page after it. */
    titleId: string
    /** h1 on a page of its own, h2 over the board. */
    heading: 'h1' | 'h2'
    /** A small line above the headline, e.g. "Result received". */
    label?: string
}>()

const t = useMessages()

const title = computed(() => {
    const [first, second] = props.rows
    const winner = first.games > second.games ? first : second
    return t.value.winsMatch(
        winner.name,
        Math.max(first.games, second.games),
        Math.min(first.games, second.games)
    )
})
</script>

<template>
    <section class="card" :aria-labelledby="titleId">
        <header class="heading">
            <p v-if="label" class="label">{{ label }}</p>
            <component :is="heading" :id="titleId" class="title">{{ title }}</component>
            <p v-if="details" class="details">{{ details }}</p>
        </header>
        <ResultTable :rows="rows" />
        <slot />
    </section>
</template>

<style scoped>
.heading {
    margin-bottom: 8px;
}

.label {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
}

.title {
    margin: 0;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

.details {
    margin: 0;
    font-size: 0.95rem;
}
</style>
