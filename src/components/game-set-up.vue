<template>
    <div>
        <h1>Start a new match</h1>
        <div class="set-up-game">
            <div class="player-field">
                <player-name-input :playerName="playerLeft" @update="$emit(Events.UPDATE_PLAYER_LEFT, $event)"/>
                <server-input :checked="true" @update="$emit(Events.UPDATE_SERVER, false)"/>
            </div>

            <div class="player-field">
                <player-name-input :playerName="playerRight" @update="$emit(Events.UPDATE_PLAYER_RIGHT, $event)"/>
                <server-input :checked="false" @update="$emit(Events.UPDATE_SERVER, true)"/>
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
    import PlayerNameInput from "./shared/PlayerNameInput.vue";
    import ServerInput from "./shared/ServerInput.vue";

    export default {
        name: "game-set-up",
        components: {ServerInput, PlayerNameInput},
        props: ["playerLeft", "playerRight", "newServer"],
        data: function () {
            return {
                Events: Events,
                server: "left"
            }
        }
    }
</script>

