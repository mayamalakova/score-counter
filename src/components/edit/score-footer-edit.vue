<template>
    <div class="score-footer">
        <player-name-input :player-name="playerLeft"
                           @update="$emit(Events.UPDATE_PLAYER_LEFT, $event)"/>
        <server-input :checked="true" @update="$emit(Events.UPDATE_SERVER, false)"/>
        <div>
            {{this.gamesLeft}} : {{this.gamesRight}}
        </div>

        <player-name-input :player-name="playerRight"
                           @update="$emit(Events.UPDATE_PLAYER_RIGHT, $event)"/>
        <server-input :checked="true" @update="$emit(Events.UPDATE_SERVER, true)"/>

    </div>

</template>
<script>
    import Events from '../../utils/events';
    import PlayerNameInput from '../shared/PlayerNameInput.vue';
    import ServerInput from "../shared/ServerInput.vue";

    export default {
        name: 'score-footer-edit',
        components: {
            ServerInput,
            PlayerNameInput
        },
        props: ["playerLeft", "playerRight", "gameScores"],
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
