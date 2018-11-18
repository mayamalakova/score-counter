<template>
    <div>
        <input class="player-name-input"
               placeholder="Player name"
               v-bind:value="playerName"
               @input="$emit('update', $event.target.value)"/>
    </div>
</template>
<script>
    export default {
        name: 'player-name-input',
        props: ["playerName"]
    }
</script>