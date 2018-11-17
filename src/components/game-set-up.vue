<template>
    <div>

        <div class="set-up-game">
            <div class="player-field">

                <player-name-input :playerName="playerLeft" @update="$emit(Events.UPDATE_PLAYER_LEFT, $event)"/>

                <label class="label-small for-inlined-input">
                    Serving
                    <input type="radio" name="server" class="input-radio"
                           :value="swapServer"
                           @input="$emit(Events.UPDATE_SERVER, $event.target.value)"/>
                </label>
            </div>
            <span>against</span>
            <div class="player-field">
                <player-name-input :playerName="playerRight" @update="$emit(Events.UPDATE_PLAYER_RIGHT, $event)"/>

                <label class="label-small for-inlined-input">
                    Serving
                    <input type="radio" name="server" class="input-radio"
                           :value="swapServer"
                           @input="$emit(Events.UPDATE_SERVER, $event.target.value)"/>
                </label>
            </div>

        </div>
        <div class="btn-large" @click.stop="$emit(Events.START_MATCH)">
            <div>Start</div>
            <div class="icon-arrow-right"></div>
        </div>

    </div>
</template>

<script>
    import Events from '../utils/events';
    import "../assets/score-view.styl";
    import PlayerNameInput from "./PlayerNameInput.vue";

    export default {
        name: "game-set-up",
        components: {PlayerNameInput},
        props: ["playerLeft", "playerRight", "swapServer"],
        data: function () {
            return {
                Events: Events
            }
        }
    }
</script>

<style scoped>

</style>