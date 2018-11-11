<template>
    <div>
        <div>
            <input :value="playerLeft"
                   class="player-name-input"
                   placeholder="Player name"
                   @input="$emit(Events.UPDATE_PLAYER_LEFT, $event.target.value)">
        </div>
        <div>
            <input :value="playerRight"
                   class="player-name-input"
                   placeholder="Player name"
                   @input="$emit(Events.UPDATE_PLAYER_LEFT, $event.target.value)">
        </div>

    </div>
</template>

<script>
    import Events from '../utils/events';

    export default {
        name: "game-set-up",
        props: ["playerLeft", "playerRight"],
        data: function () {
            return {
                Events: Events
            }
        },
    }
</script>

<style scoped>

</style>