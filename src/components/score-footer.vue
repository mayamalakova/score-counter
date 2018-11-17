<template>
    <div class="score-footer">

        <input v-if="editMode"
               :value="playerLeft"
               class="player-name-input"
               placeholder="Player name"
               @input="$emit(Events.UPDATE_PLAYER_LEFT, $event.target.value)">

        <div v-if="!editMode" class="player-name left">{{playerLeft}}</div>

        <div>
            {{this.gamesLeft}} : {{this.gamesRight}}
        </div>

        <input v-if="editMode"
               :value="playerRight"
               class="player-name-input"
               placeholder="Player name"
               @input="$emit(Events.UPDATE_PLAYER_RIGHT, $event.target.value)">

        <div v-if="!editMode" class="player-name right">{{playerRight}}</div>
    </div>

</template>
<script>
    import gameScore from "./game-score.vue";
    import Events from '../utils/events'

    export default {
        components: {
            "game-score": gameScore
        },
        props: ["playerLeft", "playerRight", "gameScores", "editMode"],
        data: function () {
            return {
                Events: Events
            }
        },

        computed: {
            gamesLeft: function () {
                return this.gameScores.filter(x => x.left > x.right).length;
            },

            gamesRight: function () {
                return this.gameScores.filter(x => x.right > x.left).length;
            },
        }
    };
</script>
