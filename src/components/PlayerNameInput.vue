<script setup lang="ts">
const name = defineModel<string>({ required: true })
</script>

<template>
    <div>
        <input class="player-name-input"
               placeholder="Player name"
               v-model="name"/>
    </div>
</template>
