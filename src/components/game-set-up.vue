<template>
    <div class="set-up-game">
        <div class="player-field">
            <label class="label-small for-bottom-input">Player Name</label>
            <input :value="playerLeft"
                   class="player-name-input"
                   placeholder="Player name"
                   @input="$emit(Events.UPDATE_PLAYER_LEFT, $event.target.value)">

            <label class="label-small for-inlined-input">
                Serving
                <input type="radio" name="server" class="input-radio" value="left" v-model="$parent.newServer"/>
            </label>
        </div>
        <span >against</span>
        <div class="player-field">
            <label class="label-small for-bottom-input">Player Name</label>
            <input :value="playerRight"
                   class="player-name-input"
                   placeholder="Player name"
                   @input="$emit(Events.UPDATE_PLAYER_RIGHT, $event.target.value)">

            <label class="label-small for-inlined-input">
                Serving
                <input type="radio" name="server" class="input-radio" value="right" v-model="$parent.newServer"/>
            </label>
        </div>

    </div>
</template>

<script>
    import Events from '../utils/events';
    import "../assets/score-view.styl";

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