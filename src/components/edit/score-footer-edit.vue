<template>
    <div class="score-footer">

        <player-name-input :player-name="playerLeft"
                           @update="$emit(Events.UPDATE_PLAYER_LEFT, $event)"/>

        <div>
            {{this.gamesLeft}} : {{this.gamesRight}}
        </div>

        <player-name-input :player-name="playerRight"
                           @update="$emit(Events.UPDATE_PLAYER_RIGHT, $event)"/>

    </div>

</template>
<script>
    import Events from '../../utils/events';
    import PlayerNameInput from '../shared/PlayerNameInput.vue';

    export default {
        name: 'score-footer-edit',
        components: {
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
