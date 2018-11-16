<template>
    <div>

        <div class="set-up-game">
            <div class="player-field">
                <label class="label-small for-bottom-input">Player Name</label>
                <input :value="playerLeft"
                       class="player-name-input"
                       placeholder="Player name"
                       @input="$emit(Events.UPDATE_PLAYER_LEFT, $event.target.value)">

                <label class="label-small for-inlined-input">
                    Serving
                    <input type="radio" name="server" class="input-radio"
                           value="false"
                           @input="$emit(Events.UPDATE_SERVER, $event.target.value)"/>
                </label>
            </div>
            <span>against</span>
            <div class="player-field">
                <label class="label-small for-bottom-input">Player Name</label>
                <input :value="playerRight"
                       class="player-name-input"
                       placeholder="Player name"
                       @input="$emit(Events.UPDATE_PLAYER_RIGHT, $event.target.value)">

                <label class="label-small for-inlined-input">
                    Serving
                    <input type="radio" name="server" class="input-radio"
                           value="true"
                           @input="$emit(Events.UPDATE_SERVER, $event.target.value)"/>
                </label>
            </div>

            <span>Picked: {{ swapServer }}</span>

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

    export default {
        name: "game-set-up",
        props: ["playerLeft", "playerRight", "swapServer"],
        data: function () {
            return {
                Events: Events
            }
        },
    }
</script>

<style scoped>

</style>