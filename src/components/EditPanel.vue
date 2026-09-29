<script setup lang="ts">
import { ref } from 'vue'
import type { Side } from './types'

defineProps<{
    colorLeft: string
    colorRight: string
}>()

const emit = defineEmits<{
    done: []
    'end-match': []
}>()

const playerLeft = defineModel<string>('playerLeft', { required: true })
const playerRight = defineModel<string>('playerRight', { required: true })
const server = defineModel<Side>('server', { required: true })

// Ending a match throws the score away, so it takes a second, deliberate tap.
const confirmingEnd = ref(false)
</script>

<template>
    <div class="backdrop">
        <section v-if="confirmingEnd" class="panel" role="alertdialog" aria-labelledby="end-title"
                 aria-describedby="end-message">
            <h2 id="end-title">End this match?</h2>
            <p id="end-message">The score will be lost.</p>
            <div class="actions">
                <button class="button cancel-end" type="button" @click="confirmingEnd = false">Cancel</button>
                <button class="button danger confirm-end" type="button" @click="emit('end-match')">End match</button>
            </div>
        </section>
        <form v-else class="panel" aria-label="Edit players and server" @submit.prevent="emit('done')">
            <h2>Players</h2>
            <div class="row">
                <input v-model="playerLeft" class="name-input" aria-label="Left player"
                       placeholder="Player name" :style="{ borderColor: colorLeft }"/>
                <label class="serves">
                    <input v-model="server" type="radio" name="server-now" value="left"/>
                    Serving now
                </label>
            </div>
            <div class="row">
                <input v-model="playerRight" class="name-input" aria-label="Right player"
                       placeholder="Player name" :style="{ borderColor: colorRight }"/>
                <label class="serves">
                    <input v-model="server" type="radio" name="server-now" value="right"/>
                    Serving now
                </label>
            </div>
            <button class="button primary done" type="submit">Done</button>
            <button class="end-match" type="button" @click="confirmingEnd = true">End match</button>
        </form>
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

.panel {
    width: min(420px, 100%);
    padding: 16px 20px 20px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
}

h2 {
    margin: 0 0 12px;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 1.8rem;
}

.row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.name-input {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    border: 2px solid;
    border-left-width: 8px;
    border-radius: 8px;
}

.serves {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 0.9rem;
}

.done {
    width: 100%;
    justify-content: center;
    margin-top: 6px;
}

.end-match {
    display: block;
    margin: 12px auto 0;
    padding: 6px 10px;
    border: 0;
    background: none;
    color: var(--player-b);
    font-weight: 700;
    text-decoration: underline;
}

p {
    margin: 0 0 16px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.button.danger {
    border-color: var(--player-b);
    background: var(--player-b);
    color: #fff;
}
</style>
